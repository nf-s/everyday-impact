import test from 'node:test';
import assert from 'node:assert/strict';
import { groups } from '../dist/data/catalogue.js';
import { itemEntries, searchEntries } from '../dist/entries.js';
import { shortlistQuestion, buildPlannerRequest, parsePlannerResponse, generatePlan, PlannerError } from '../lib/question-planner.js';

function labels(shortlist) {
  return Object.fromEntries(shortlist.clauses.map((clause, i) => [String.fromCharCode(65 + i), shortlist.candidates[clause.indices[0]].label]));
}
function select(shortlist, clauseNumber, predicate) {
  const candidate = shortlist.clauses[clauseNumber].indices.map(index => shortlist.candidates[index]).find(predicate);
  assert.ok(candidate, 'Expected relevant candidate');
  return candidate.label;
}
function invalid(body, shortlist) {
  assert.throws(() => parsePlannerResponse(body, shortlist), error => error instanceof PlannerError && error.code === 'invalid_output');
}

test('shared entries retain all exact catalogue choices and lifestyle defaults without browser globals', () => {
  assert.equal(itemEntries.length, groups.reduce((sum, group) => sum + group.options.length, 0));
  assert.equal(searchEntries.length, itemEntries.length + 7);
  assert.ok(searchEntries.some(entry => entry.label === 'Switch to a vegan diet' && entry.choice.after === 'vegan'));
});

test('bounded per-clause enums cover several activities with real, unique catalogue labels', () => {
  const shortlist = shortlistQuestion('Compare AI image generation with beef and running a dryer');
  assert.equal(shortlist.clauses.length, 3);
  assert.ok(shortlist.candidates.length <= 20);
  select(shortlist, 0, item => item.choice.group === 'ai-image-generation');
  select(shortlist, 1, item => item.choice.group === 'generic-foods' && item.label === 'Beef');
  select(shortlist, 2, item => item.choice.before === 'generic-dryer-8kg');
  const request = buildPlannerRequest(shortlist);
  assert.equal(request.max_tokens, 220);
  assert.equal(request.temperature, 0);
  assert.deepEqual(request.response_format.json_schema.required, ['A', 'B', 'C']);
  for (const clause of shortlist.clauses) {
    assert.ok(clause.indices.length <= 5);
    const names = clause.indices.map(index => shortlist.candidates[index].label);
    assert.equal(names.length, new Set(names).size);
  }
  assert.ok(request.messages.reduce((sum, message) => sum + message.content.length, 0) < 3500);
  assert.ok(!request.messages[1].content.includes('values'));
  assert.ok(!request.messages[1].content.includes('sourceNote'));
});

test('aliases, plurals and independent clauses retain likely user wording without AI inside rail', () => {
  for (const [question, group] of [
    ['Use 5 prompts daily for a month', 'ai-request'], ['Build a website', 'ai-web-app-development'],
    ['A tumble dryer', 'dryer-loads'], ['My electricity bill', 'au-grid-electricity'],
    ['Going vegan', 'uk-diets'], ['Take the train', 'surface-travel']
  ]) select(shortlistQuestion(question), 0, item => item.choice.group === group);
  assert.ok(shortlistQuestion('rail').candidates.every(item => !item.choice.group.startsWith('ai-')));
  assert.equal(shortlistQuestion('tofu').candidates[0].label, 'Tofu, plain');
});

test('unmatched subjects and unmatched comparison clauses never silently fall back or incur inference', async () => {
  for (const question of ['unicorn rides', 'beef and unicorn rides']) {
    let calls = 0;
    await assert.rejects(generatePlan(question, async () => { calls++; return {}; }), error => error.code === 'no_match');
    assert.equal(calls, 0);
  }
  for (const question of ['', 'a'.repeat(501), null]) assert.throws(() => shortlistQuestion(question), error => error.code === 'invalid_question');
});

test('single inference accepts native and OpenAI envelopes and retains unrequested defaults', async () => {
  const shortlist = shortlistQuestion('dryer');
  let calls = 0;
  const result = await generatePlan('dryer', async request => {
    calls++; assert.equal(request.messages.length, 2);
    return { choices: [{ message: { content: JSON.stringify(labels(shortlist)) }, finish_reason: 'stop' }], usage: { total_tokens: 123 } };
  });
  assert.equal(calls, 1);
  assert.deepEqual(result.choices[0], shortlist.candidates[0].choice);
  assert.deepEqual(parsePlannerResponse({ response: JSON.stringify(labels(shortlist)) }, shortlist), result);
});

test('matching every comparison activity precedes deterministic quantity, schedule and horizon parsing', () => {
  const shortlist = shortlistQuestion('Compare 5 AI prompts daily with 150g beef twice a week over 2 weeks');
  const body = { A: select(shortlist, 0, item => item.choice.group === 'ai-request'), B: select(shortlist, 1, item => item.label === 'Beef') };
  const plan = parsePlannerResponse(body, shortlist);
  assert.equal(plan.choices.length, 2);
  assert.equal(plan.choices[0].amount, 5);
  assert.equal(plan.choices[0].period, 'daily');
  assert.equal(plan.choices[1].amount, 0.15);
  assert.equal(plan.choices[1].times, 2);
  assert.deepEqual(plan.horizon, { amount: 2, unit: 'weeks' });
  invalid({ A: body.A }, shortlist);
});

test('lifestyle changes are excluded for ordinary comparisons and allowed for explicit changes', () => {
  const direct = shortlistQuestion('Compare train and vegan diet');
  assert.ok(direct.candidates.every(item => item.choice.kind === 'footprint'));
  const changes = shortlistQuestion('go vegan and skip a return flight');
  const body = { A: select(changes, 0, item => item.label === 'Switch to a vegan diet'), B: select(changes, 1, item => item.label === 'Skip a Paris–New York return flight') };
  const result = parsePlannerResponse(body, changes);
  assert.equal(result.choices[0].kind, 'swap');
  assert.equal(result.choices[0].after, 'vegan');
  assert.equal(result.choices[1].kind, 'skip');
  assert.equal(shortlistQuestion('Replace a beef meal with a vegan meal').clauses.length, 1);
});

test('model cannot invent factors, quantities, slots or labels, or omit an activity', () => {
  const shortlist = shortlistQuestion('prompts and beef');
  const valid = labels(shortlist);
  for (const body of [null, 'not json', '```json\n{}\n```', { choices: [{ index: 0 }] }, {}, { A: valid.A },
    { ...valid, carbon: 1 }, { ...valid, amount: 5 }, { ...valid, C: valid.A }, { ...valid, A: null },
    { ...valid, A: 0 }, { ...valid, A: 'invented activity' }, { ...valid, A: valid.B }]) invalid(body, shortlist);
  assert.throws(() => parsePlannerResponse({ ...valid, B: 'Unsupported' }, shortlist), error => error.code === 'no_match');
  invalid({ choices: [{ message: { content: JSON.stringify(valid) }, finish_reason: 'length' }] }, shortlist);
  invalid({ choices: [{ message: { content: JSON.stringify(valid) } }, { message: { content: JSON.stringify(valid) } }] }, shortlist);
});


test('comparison connectors and trailing horizons do not lose activities or split bare with-AI modifiers', () => {
  for (const question of [
    'Build a website compared to running a kettle',
    'Compare boiling a kettle with AI image generation',
    'What’s the impact of going vegan or skipping a flight, over 2 months?',
    'Generate 3 images per day with AI and use a dryer twice a week'
  ]) assert.equal(shortlistQuestion(question).clauses.length, 2, question);
  const train = shortlistQuestion('Compare driving a petrol car 50 km with taking a train 50 km');
  const trainCandidates = train.clauses[1].indices.map(index => train.candidates[index]);
  assert.equal(trainCandidates[0].choice.before, 'national-rail');
  assert.ok(trainCandidates.every(item => !item.choice.before.includes('car') && item.choice.before !== 'bus'));
  const kettle = shortlistQuestion('boil a kettle');
  assert.ok(kettle.candidates.every(item => item.choice.before.includes('kettle')));
});


test('unsupported replacements cannot silently become an unrelated meal preset or one footprint', async () => {
  for (const question of [
    'What if I replace beef with tofu?',
    'Swap beef for tofu',
    'Replace a smartphone with a kettle',
    'What if I swapped a smartphone for a kettle?',
    'Replace a beef meal with a vegan meal and swap a smartphone for a kettle'
  ]) {
    let calls = 0;
    await assert.rejects(generatePlan(question, async () => { calls++; return {}; }), error => error.code === 'unsupported_replacement' && /Advanced/.test(error.message));
    assert.equal(calls, 0);
  }
  const supported = shortlistQuestion('Replace a beef meal with a vegan meal');
  const label = select(supported, 0, item => item.label === 'Replace a beef meal with a vegan meal');
  const plan = parsePlannerResponse({ A: label }, supported);
  assert.equal(plan.choices[0].kind, 'swap');
  assert.equal(plan.choices[0].before, 'beef');
  assert.equal(plan.choices[0].after, 'vegan');
  assert.equal(shortlistQuestion('Compare beef and tofu').clauses.length, 2);
});

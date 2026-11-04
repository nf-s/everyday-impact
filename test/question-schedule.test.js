import test from 'node:test';
import assert from 'node:assert/strict';
import { applyQuestionSchedule, QuestionScheduleError } from '../lib/question-schedule.js';

const food = { choice: { kind: 'footprint', group: 'food', before: 'beef', after: null, amount: 0.15, times: 2, period: 'weekly' }, singular: 'kg', unit: 'per kg' };
const ai = { choice: { kind: 'footprint', group: 'ai-request', before: 'gemini', after: null, amount: 5, times: 1, period: 'daily' }, singular: 'request', unit: 'text request' };
const run = (question, selection = food) => applyQuestionSchedule(question, [{ ...selection, phrase: question }]);
test('explicit mass uses the denominator; named portions retain their reference size', () => {
  assert.equal(run('150 g beef per week').choices[0].amount, 0.15);
  assert.equal(run('half kg beef per week').choices[0].amount, 0.5);
  assert.equal(run('1/4 kg beef weekly').choices[0].amount, 0.25);
  assert.equal(run('one steak per week').choices[0].amount, 0.15);
  assert.equal(run('two steaks per week').choices[0].amount, 0.3);
  assert.equal(run('one steak per week').choices[0].times, 1);
});
test('activity counts and frequency are separate, without model-number quantities', () => {
  assert.equal(run('twenty ChatGPT questions', ai).choices[0].amount, 20);
  const diet = run('two days of a vegan diet', { ...food, singular: 'person-day' }).choices[0];
  assert.equal(diet.amount, 2);
  assert.equal(diet.period, 'once');
  assert.equal(run('20 Gemini prompts/day', ai).choices[0].amount, 20);
  assert.equal(run('twenty Gemini prompts daily', ai).choices[0].amount, 20);
  assert.equal(run('Gemini twice per week', ai).choices[0].times, 2);
  assert.equal(run('Gemini once', ai).choices[0].period, 'once');
  assert.equal(run('Qwen3 30B', ai).choices[0].amount, 5);
  assert.equal(run('Gemini with 400 token output', ai).choices[0].amount, 5);
  assert.deepEqual(run('Gemini', ai).choices[0], ai.choice);
});
test('comparison horizon is distinct from frequency and amount', () => {
  const result = run('20 Gemini prompts daily for the next two weeks', ai);
  assert.deepEqual(result.horizon, { amount: 2, unit: 'weeks' });
  assert.equal(result.choices[0].amount, 20);
  assert.equal(result.choices[0].period, 'daily');
  assert.equal(run('beef over a week').choices[0].amount, 0.15);
  assert.deepEqual(run('beef this month').horizon, { amount: 1, unit: 'months' });
  assert.equal(run('beef every week').horizon, undefined);
});
test('one final cadence can apply to preceding uncadenced activities', () => {
  const result = applyQuestionSchedule('20 Gemini prompts and one steak per week', [{ ...ai, phrase: '20 Gemini prompts' }, { ...food, phrase: 'one steak per week' }]);
  assert.deepEqual(result.choices.map(choice => [choice.amount, choice.period, choice.times]), [[20, 'weekly', 1], [0.15, 'weekly', 1]]);
  const weekly = applyQuestionSchedule('Gemini and beef twice weekly', [{ ...ai, phrase: 'Gemini' }, { ...food, phrase: 'beef twice weekly' }]);
  assert.deepEqual(weekly.choices.map(choice => [choice.period, choice.times]), [['weekly', 2], ['weekly', 2]]);
});
test('compatible time and distance quantities convert without density assumptions', () => {
  assert.equal(run('half hour shower daily', { ...ai, singular: 'minute' }).choices[0].amount, 30);
  assert.equal(run('90 minutes TV daily', { ...ai, singular: 'hour' }).choices[0].amount, 1.5);
  assert.equal(run('10 km driving daily', { ...ai, singular: 'km' }).choices[0].amount, 10);
  assert.throws(() => run('2 litres milk daily'), QuestionScheduleError);
  assert.throws(() => run('0 g beef'), { code: 'unsupported_schedule' });
  assert.throws(() => run('1000001 prompts', ai), { code: 'unsupported_schedule' });
  assert.throws(() => run('beef for 1001 years'), { code: 'unsupported_schedule' });
});
test('skip intent and existing lifestyle changes retain their catalogue data', () => {
  assert.equal(run('skip one steak weekly').choices[0].kind, 'skip');
  const swap = { ...food, choice: { ...food.choice, kind: 'swap', after: 'tofu' } };
  assert.equal(run('one steak weekly', swap).choices[0].after, 'tofu');
  assert.equal(food.choice.times, 2);
});

test('quantified activities without cadence happen once, with hyphenated durations supported', () => {
  assert.equal(run('10 Gemini prompts', ai).choices[0].period, 'once');
  assert.equal(run('200 g of beef').choices[0].period, 'once');
  assert.equal(run('4-minute shower', { ...ai, singular: 'minute' }).choices[0].amount, 4);
  assert.equal(run('20 ChatGPT queries', ai).choices[0].amount, 20);
  assert.equal(run('beef twice weekly').choices[0].times, 2);
  assert.equal(run('running a kettle', ai).choices[0].amount, ai.choice.amount);
  assert.throws(() => run('-5 g beef'), { code: 'unsupported_schedule' });
  assert.throws(() => run('2 pounds beef'), { code: 'unsupported_schedule' });
});


test('weekends count as one weekly event unless each day is explicitly requested', () => {
  const selection = { choice: { group: 'test', before: 'one', kind: 'footprint', after: null, amount: 1, period: 'once', times: 1 }, singular: 'use', unit: 'use' };
  const weekend = applyQuestionSchedule('use it every weekend', [{ ...selection, phrase: 'use it every weekend' }]);
  assert.equal(weekend.choices[0].period, 'weekly');
  assert.equal(weekend.choices[0].times, 1);
  const days = applyQuestionSchedule('use it each day of the weekend', [{ ...selection, phrase: 'use it each day of the weekend' }]);
  assert.equal(days.choices[0].period, 'weekly');
  assert.equal(days.choices[0].times, 2);
});

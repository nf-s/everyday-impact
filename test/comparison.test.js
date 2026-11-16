import test from 'node:test';
import assert from 'node:assert/strict';
import { validCatalogueChoice } from '../dist/entries.js';
import { impactParts } from '../dist/model.js';
import { serializeComparison, parseComparison } from '../dist/share-state.js';
import { exampleOptions, exampleChoices, defaultExample } from '../dist/examples.js';
import {
  createStore, grids, metricKeys, sharedKeys, estimate, resolve, usageText, format, alternativePool, needsGrid,
  gridCompletesCarbon, waterScopesDiffer, scopeLabel, measureEntry, measureUnit, shareState, usesGroup, generalEntries, entryTotal
} from '../dist/comparison.js';

const flight = { group: 'return-flight', before: 'paris-new-york-return', after: null, kind: 'footprint', amount: 1, period: 'once', times: 1 };
const shower = { group: 'shower', before: 'higher-9l', after: 'efficient-6l', kind: 'swap', amount: 4, period: 'daily', times: 1 };
const kettle = { group: 'everyday-electricity', before: 'kettle-three-minutes', after: null, kind: 'footprint', amount: 1, period: 'daily', times: 1 };
const beef = { group: 'food-products', before: 'beef-steak', after: null, kind: 'footprint', amount: 0.15, period: 'weekly', times: 2 };
const gridIds = grids.map(grid => grid.id);

function loaded(...choices) {
  const store = createStore();
  store.load({ choices });
  return store;
}

test('every example is valid and the default example exists', () => {
  assert.ok(exampleChoices(defaultExample));
  assert.equal(exampleChoices('missing'), null);
  for (const [id] of exampleOptions) assert.ok(exampleChoices(id).every(validCatalogueChoice), id);
  assert.deepEqual(exampleChoices('flight-diet').map(choice => choice.kind), ['skip', 'swap']);
  assert.deepEqual(exampleChoices('ai-beef').map(choice => choice.kind), ['footprint', 'footprint']);
});

test('loading a comparison picks the most widely available measure and keeps other settings', () => {
  const store = loaded(shower, flight);
  assert.equal(store.state.metric, 'carbon');
  assert.deepEqual(metricKeys(store.state), ['carbon', 'water']);
  assert.deepEqual(sharedKeys(store.state), []);
  store.setHorizon({ amount: 3, unit: 'months' });
  store.load({ choices: [shower] });
  assert.equal(store.state.metric, 'water');
  assert.deepEqual(store.state.horizon, { amount: 3, unit: 'months' });
  store.load({ choices: [shower, flight], metric: 'water', horizon: { amount: 2, unit: 'years' } });
  assert.equal(store.state.metric, 'water');
  assert.deepEqual(store.state.horizon, { amount: 2, unit: 'years' });
  assert.equal(store.setHorizon({ amount: 0, unit: 'months' }), false);
});

test('edits notify listeners, keep identities and reject invalid schedules', () => {
  const store = loaded(flight, beef);
  let notified = 0;
  store.subscribe(() => { notified += 1; });
  const [first, second] = store.state.choices;
  store.patch(second.uid, { amount: 0.3 });
  assert.equal(store.state.choices[1].amount, 0.3);
  assert.equal(store.state.choices[1].uid, second.uid);
  store.patch(second.uid, { amount: -1 });
  assert.equal(store.state.choices[1].amount, 0.3);
  store.patch(second.uid, { period: 'once' });
  assert.equal(store.state.choices[1].times, 1);
  store.moveFirst(second.uid);
  assert.deepEqual(store.state.choices.map(item => item.uid), [second.uid, first.uid]);
  store.remove(first.uid);
  assert.equal(store.state.choices.length, 1);
  assert.equal(notified, 5);
  store.setMetric(store.state.metric);
  assert.equal(notified, 5);
});

test('alternatives stay compatible and the measure follows the activities', () => {
  const store = loaded(beef);
  const [item] = store.state.choices;
  const pool = alternativePool(item);
  assert.ok(pool.length > 0);
  assert.ok(pool.every(entry => !(entry.choice.group === item.group && entry.choice.before === item.before)));
  const tofu = pool.find(entry => entry.choice.before === 'tofu');
  store.setAlternative(item.uid, 'swap', tofu.choice);
  assert.ok(validCatalogueChoice(shareState(store.state).choices[0]));
  assert.equal(resolve(store.state.choices[0], store.state).alternativeName, tofu.label);
  const result = estimate(store.state.choices[0], 'carbon', store.state);
  assert.ok(result.alternative < result.current && result.difference > 0);

  // Changing to another food keeps the replacement; an unrelated activity drops it.
  const chicken = pool.find(entry => entry.choice.before === 'poultry-meat');
  store.replaceActivity(item.uid, chicken.choice);
  assert.equal(store.state.choices[0].before, 'poultry-meat');
  assert.equal(store.state.choices[0].after, 'tofu');
  assert.equal(store.state.choices[0].uid, item.uid);
  store.replaceActivity(item.uid, shower);
  assert.equal(store.state.choices[0].group, 'shower');
  assert.equal(store.state.metric, 'water');

  store.setAlternative(item.uid, 'skip');
  assert.equal(estimate(store.state.choices[0], 'water', store.state).alternative, 0);
  store.setAlternative(item.uid, 'footprint');
  assert.equal(store.state.choices[0].after, null);
  assert.equal(Object.hasOwn(store.state.choices[0], 'afterGroup'), false);
});

test('an assumed grid supplies greenhouse gas figures for electricity-only activities', () => {
  const store = loaded(flight, kettle);
  assert.equal(needsGrid(store.state), true);
  assert.equal(gridCompletesCarbon(store.state), true);
  assert.equal(estimate(store.state.choices[1], 'carbon', store.state).current, null);
  store.setGrid('national');
  assert.equal(gridCompletesCarbon(store.state), false);
  assert.ok(estimate(store.state.choices[1], 'carbon', store.state).current > 0);
  const { before, group } = resolve(store.state.choices[1], store.state);
  assert.equal(scopeLabel(before, group, 'carbon'), 'Grid estimate · electricity only');
  assert.equal(needsGrid(loaded(flight).state), false);
});

test('figures are described in readable units', () => {
  const store = loaded(flight, shower, beef);
  const [first, second, third] = store.state.choices;
  assert.equal(usageText(first), '1 return flight, once');
  assert.equal(usageText(second), '4 minutes, once a day');
  assert.equal(usageText(third), '150 g, twice a week');
  assert.equal(format(estimate(first, 'carbon', store.state).current, 'carbon'), '1.27 t CO₂e');
  assert.equal(format(estimate(second, 'water', store.state).current, 'water'), '13.1 kL');
  assert.deepEqual(impactParts(0.0548, 'carbon'), { text: '54.8', unit: 'g CO₂e' });
  assert.deepEqual(impactParts(-2500, 'energy'), { text: '−2.5', unit: 'MWh' });
  assert.deepEqual(impactParts(2500000, 'water'), { text: '2.5', unit: 'ML' });
  assert.deepEqual(impactParts(12, 'agribalyseLand'), { text: '12', unit: 'Pt' });
  assert.deepEqual(impactParts(null, 'carbon'), { text: '–', unit: '' });
  assert.equal(waterScopesDiffer(store.state), false);
  assert.equal(usesGroup(store.state, 'shower'), true);
  assert.equal(usesGroup(store.state, 'digital-devices'), false);
});

test('the calculation record names the activity and picks watt-hours for small totals', () => {
  const store = loaded(kettle);
  store.patch(store.state.choices[0].uid, { period: 'once' });
  const entry = measureEntry(store.state.choices[0], 'energy', store.state);
  assert.equal(entry.title, resolve(store.state.choices[0], store.state).name);
  assert.equal(entry.choice, store.state.choices[0]);
  assert.equal(measureUnit(entry, 'energy'), 'Wh');
  assert.equal(measureUnit(measureEntry(store.state.choices[0], 'carbon', store.state), 'carbon'), 'kg CO₂e');
});

test('the shared state round-trips with its measure and drops view identities', () => {
  const store = loaded(shower, flight);
  store.setMetric('water');
  store.setGrid('tasmania');
  store.setSharedOnly(true);
  const state = shareState(store.state);
  assert.deepEqual(state.choices, [shower, flight]);
  const restored = parseComparison(serializeComparison(state, validCatalogueChoice, gridIds), validCatalogueChoice, gridIds);
  assert.deepEqual(restored, { choices: [shower, flight], horizon: { amount: 12, unit: 'months' }, sharedOnly: true, grid: 'tasmania', metric: 'water' });
  assert.throws(() => serializeComparison({ ...state, metric: 'unknown' }, validCatalogueChoice, gridIds));
  const wire = JSON.parse(serializeComparison(state, validCatalogueChoice, gridIds));
  assert.throws(() => parseComparison(JSON.stringify({ ...wire, m: 'toString' }), validCatalogueChoice, gridIds));
});

test('scale context entries have positive totals at their illustrative schedules', () => {
  const store = loaded(flight);
  const totals = generalEntries.map(entry => entryTotal(entry, 'carbon', store.state)).filter(value => value !== null);
  assert.ok(totals.length > 50);
  assert.ok(totals.every(value => value > 0));
});

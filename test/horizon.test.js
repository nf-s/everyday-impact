import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultHorizon, validHorizon, horizonLabel, occurrencesFor, calculate, estimateChoice } from '../dist/model.js';

const original = { values: { carbon: 2 } };
const replacement = { values: { carbon: 0.5 } };

test('the default horizon preserves historic yearly schedule totals', () => {
  assert.deepEqual(defaultHorizon, { amount: 12, unit: 'months' });
  for (const [period, count] of [['once', 1], ['daily', 365], ['weekly', 52], ['monthly', 12]]) {
    assert.equal(occurrencesFor(period), count);
    assert.equal(calculate(original, null, 3, period, 'carbon'), 2 * 3 * count);
    assert.equal(occurrencesFor(period, { amount: 1, unit: 'years' }), count);
  }
});

test('custom horizons scale schedules and preserve explicit one-off quantities', () => {
  assert.equal(occurrencesFor('daily', { amount: 2, unit: 'weeks' }), 14);
  assert.equal(occurrencesFor('weekly', { amount: 7, unit: 'days' }), 1);
  assert.equal(occurrencesFor('monthly', { amount: 3, unit: 'months' }), 3);
  assert.equal(occurrencesFor('weekly', { amount: 3, unit: 'months' }), 13);
  assert.equal(estimateChoice(original, replacement, 2, 'weekly', 3, 'carbon', { amount: 2, unit: 'weeks' }), 18);
  assert.equal(estimateChoice(original, null, 4, 'once', 1, 'carbon', { amount: 1000, unit: 'years' }), 8);
  assert.equal(estimateChoice(original, null, 4, 'once', 1, 'carbon', { amount: 1, unit: 'days' }), 8);
  assert.equal(estimateChoice(original, null, 4, 'once', 2, 'carbon', { amount: 1, unit: 'days' }), 16);
});

test('short periods prorate recurring schedules instead of rounding or inventing dates', () => {
  assert.equal(occurrencesFor('weekly', { amount: 1, unit: 'days' }), 1 / 7);
  assert.equal(occurrencesFor('monthly', { amount: 1, unit: 'days' }), 12 / 365);
  assert.equal(estimateChoice(original, null, 1, 'weekly', 1, 'carbon', { amount: 1, unit: 'days' }), 2 / 7);
  assert.equal(estimateChoice(original, null, 1, 'daily', 1, 'energy', { amount: 1, unit: 'days' }), null);
});

test('horizon validation rejects unsupported units, fractions and unsafe values', () => {
  for (const horizon of [null, [], {}, { amount: 0, unit: 'days' }, { amount: -1, unit: 'weeks' },
    { amount: 1.5, unit: 'months' }, { amount: 1001, unit: 'years' }, { amount: NaN, unit: 'days' },
    { amount: Infinity, unit: 'days' }, { amount: '2', unit: 'days' }, { amount: 2, unit: 'day' }]) {
    assert.equal(validHorizon(horizon), false);
    assert.equal(occurrencesFor('daily', horizon), null);
    assert.equal(calculate(original, null, 1, 'once', 'carbon', horizon), null);
    assert.equal(estimateChoice(original, null, 1, 'daily', 1, 'carbon', horizon), null);
  }
  assert.equal(horizonLabel({ amount: 1, unit: 'weeks' }), '1 week');
  assert.equal(horizonLabel({ amount: 2, unit: 'years' }), '2 years');
});

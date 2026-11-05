import test from 'node:test';
import assert from 'node:assert/strict';
import { choiceCoverage, sharedCoverage, sharedWaterNote } from '../dist/coverage.js';
const entry = values => ({ choice: { kind: 'footprint', amount: 1, times: 1 }, before: { values }, after: null });
test('coverage preserves real zero factors and accepts effective scenario factors', () => {
  assert.deepEqual(choiceCoverage(entry({ carbon: 0, energy: 2 })), ['carbon', 'energy']);
  assert.deepEqual(sharedCoverage([entry({ carbon: 1, energy: 2 }), entry({ carbon: 3 })]), ['carbon']);
  assert.deepEqual(sharedCoverage([]), []);
});
test('swaps require estimates on both sides and matching water definitions', () => {
  const swap = { ...entry({ carbon: 1, coolingWater: 2 }), choice: { kind: 'swap', amount: 1, times: 1 }, after: { values: { carbon: 0.5, tapWater: 1 } } };
  assert.deepEqual(choiceCoverage(swap), ['carbon']);
  assert.deepEqual(choiceCoverage({ ...swap, after: null }), ['carbon', 'water']);
  assert.deepEqual(choiceCoverage({ ...swap, after: { values: { coolingWater: 0 } } }), ['water']);
});
test('shared volume coverage identifies differing source scopes', () => {
  const entries = [entry({ coolingWater: 1 }), entry({ consumedWater: 2 })];
  assert.deepEqual(sharedCoverage(entries), ['water']);
  assert.match(sharedWaterNote(entries), /different source scopes/);
  assert.equal(sharedWaterNote([entries[0], entries[0]]), '');
  assert.deepEqual(sharedCoverage([entry({ energy: 1 }), entry({ carbon: 1 })]), []);
});

test('invalid quantities never promise available numeric estimates', () => {
  const invalid = entry({ carbon: 1 });
  invalid.choice.amount = NaN;
  assert.deepEqual(choiceCoverage(invalid), []);
});

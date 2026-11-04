import assert from 'node:assert/strict';
import test from 'node:test';
import { groups } from '../dist/data/catalogue.js';
import { estimateChoice, withGridCarbon } from '../dist/model.js';
import { defaultChoice } from '../dist/entries.js';
import { sharedCoverage } from '../dist/coverage.js';

const group = id => groups.find(item => item.id === id);
const grid = group('au-grid-electricity').options.find(option => option.id === 'national');

test('an explicit grid can bridge image generation and fish without changing either source record', () => {
  const imageGroup = group('ai-image-generation');
  const fishGroup = group('food-portions');
  const image = imageGroup.options[0];
  const fish = fishGroup.options[0];
  const entry = (g, option) => ({ before: option, after: null, choice: defaultChoice(g, option) });
  assert.deepEqual(sharedCoverage([entry(imageGroup, image), entry(fishGroup, fish)]), []);
  const scenario = withGridCarbon(image, grid);
  assert.deepEqual(sharedCoverage([entry(imageGroup, scenario), entry(fishGroup, fish)]), ['carbon']);
  assert.equal(scenario.values.carbon, image.values.energy * grid.values.carbon);
  assert.equal(scenario.gridEstimate, grid);
  assert.equal(image.values.carbon, undefined);
  assert.equal(estimateChoice(scenario, null, 3, 'once', 1, 'carbon'), scenario.values.carbon * 3);
  assert.equal(withGridCarbon(fish, grid), fish);
  assert.equal(withGridCarbon(image, null), image);
  assert.equal(withGridCarbon(null, grid), null);
  assert.equal(withGridCarbon(group('ai-request').options[0], grid), group('ai-request').options[0]);
});

test('serving scenarios weight the six named source records by cooked mass for every measure', () => {
  const records = groups.flatMap(group => group.options);
  for (const [id, codes] of [['fish-portion', ['26038', '26025', '26041']], ['meat-portion', ['36018', '28101', '6200']]]) {
    const portion = group('food-portions').options.find(item => item.id === id);
    const inputs = codes.map(code => records.find(item => item.sourceCode === code));
    assert.deepEqual(portion.sources, inputs.flatMap(item => item.sources));
    assert.deepEqual(portion.genericEvidence.contributors.map(item => item.values), inputs.map(item => item.values));
    for (const [key, value] of Object.entries(portion.values)) assert.equal(value, inputs.reduce((sum, item) => sum + item.values[key], 0) / 3);
    assert.equal(defaultChoice(group('food-portions'), portion).amount, 0.15);
  }
});

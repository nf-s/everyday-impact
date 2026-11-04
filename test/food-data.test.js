import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { foodGroups, agribalyseFoodMetadata } from '../dist/data/food.js';

const foods = foodGroups.flatMap(group => group.options).filter(option => option.sourceCode);
const byCode = code => foods.find(option => option.sourceCode === code);

test('AGRIBALYSE covers the published source rows once and preserves existing selections', async () => {
  assert.equal(foods.length, agribalyseFoodMetadata.sourceCount);
  assert.equal(new Set(foods.map(option => option.sourceCode)).size, foods.length);
  const selected = JSON.parse(await readFile(new URL('../scripts/agribalyse-selection.json', import.meta.url), 'utf8'));
  for (const entry of selected) {
    const group = foodGroups.find(group => group.id === entry.group);
    const item = group?.options.find(option => option.id === entry.id);
    assert.equal(item?.sourceCode, entry.sourceCode);
  }
  for (const food of foods) {
    const source = new URL(food.sources[0].url);
    assert.equal(source.searchParams.get('qs'), 'Code_AGB:"' + food.sourceCode + '"');
    assert.equal(food.categoryPath.length, 3);
    assert.equal(food.categoryPath[0], 'Food');
    assert.ok(food.sourceName && food.sourceFrenchName);
  }
});

test('published benchmark rows retain values, mass denominators and nutrient conversions', () => {
  // ADEME AGRIBALYSE 3.2 Synthèse rows 6200 and 18900, retrieved 4 November 2026.
  assert.deepEqual(byCode('6200')?.values, {
    carbon: 36.6, agribalyseLand: 2390, freshwaterEutrophication: 1.54,
    waterScarcity: 3.05, agribalyseAcidification: 0.51,
    marineEutrophication: 108, fossilResources: 89, smogFormation: 54.9, mineralResources: 50.7
  });
  assert.deepEqual(byCode('18900')?.values, {
    carbon: 0.427, agribalyseLand: 21.6, freshwaterEutrophication: 0.0796,
    waterScarcity: 0.0786, agribalyseAcidification: 0.00143,
    marineEutrophication: 1.12, fossilResources: 6.58, smogFormation: 1.39, mineralResources: 1.48
  });
  assert.equal(byCode('20904')?.values.agribalyseLand, -19.8);
  for (const group of foodGroups.filter(group => group.options.some(option => option.sourceCode))) {
    assert.equal(group.singular, 'kg');
    assert.match(group.sourceNote, /not litres of water/);
  }
});

test('data-quality cautions and packaging proxies do not become invented confidence levels', () => {
  const cardamom = byCode('11075');
  assert.equal(cardamom?.dqr, 4.42);
  assert.match(cardamom.qualityWarning, /above 4 unreliable/);
  for (const food of foods) {
    assert.ok(food.dqr >= 1 && food.dqr <= 5);
    if (food.dqr > 3) assert.match(food.qualityWarning, /caution/);
    else assert.equal(food.qualityWarning, '');
    if (food.packagingApproach === 'PACK PROXY') assert.match(food.note, /Packaging uses the source PACK PROXY/);
    assert.equal(Object.hasOwn(food, 'confidence'), false);
    assert.ok(food.defaultUsage.amount > 0 && food.defaultUsage.amount <= 1);
    assert.ok(['once', 'weekly'].includes(food.defaultUsage.period));
    assert.match(food.defaultUsage.description, /Assumes/);
  }
});

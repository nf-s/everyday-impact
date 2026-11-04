import test from 'node:test';
import assert from 'node:assert/strict';
import { withActivityGenerics } from '../dist/data/activity-generics.js';
import { applianceGroups } from '../dist/data/appliances.js';
import { energyTravelGroups } from '../dist/data/energy-travel.js';
import { goodsGroups } from '../dist/data/goods.js';
import { foodGroups } from '../dist/data/food.js';
import { materialGroups } from '../dist/data/materials.js';

function option(groups, groupId, optionId) {
  const group = groups.find(group => group.id === groupId);
  assert.ok(group);
  const item = group.options.find(item => item.id === optionId);
  assert.ok(item);
  return item;
}

test('dryer uses distinct dated registrations, not the four convenient catalogue examples', () => {
  const item = option(withActivityGenerics(applianceGroups), 'dryer-loads', 'generic-dryer-8kg');
  const evidence = item.genericEvidence;
  assert.equal(evidence.method, 'median');
  assert.equal(evidence.contributors.length, 128);
  assert.equal(new Set(evidence.contributors.map(item => item.id)).size, 128);
  assert.equal(item.values.energy, 146.5 / 52);
  assert.ok(evidence.contributors.every(item => item.url.endsWith('/cd_2026_11_03.csv')));
  assert.match(evidence.selection, /not sales/);
  assert.ok(evidence.contributors.some(item => item.id === 'ACD0929' && item.values.energy === 351 / 52));
});

test('appliance medians keep equal capacity, water scope and independent measure denominators', () => {
  const groups = withActivityGenerics(applianceGroups);
  const dishwasher = option(groups, 'dishwasher-cycles', 'generic-dishwasher-14-place');
  assert.equal(dishwasher.values.energy, (219 / 365 + 243 / 365) / 2);
  assert.equal(dishwasher.values.tapWater, (9.21 + 9.9) / 2);
  assert.equal(dishwasher.values.freshwater, undefined);
  assert.equal(dishwasher.genericEvidence.contributors.length, 2);
  assert.ok(dishwasher.genericEvidence.contributors.every(item => item.label.includes('14 place settings')));
  const tv = option(groups, 'tv-viewing', 'generic-tv-55-inch');
  assert.equal(tv.values.energy, (0.06329 + 0.102) / 2);
  assert.ok(tv.genericEvidence.contributors.every(item => item.label.includes('55″')));
});

test('representative appliance choices retain named evidence and searchable originals', () => {
  const groups = withActivityGenerics(applianceGroups);
  const washer = option(groups, 'washer-cycles', 'generic-washer-9kg');
  const original = option(applianceGroups, 'washer-cycles', 'acw817223759');
  assert.equal(washer.label, 'Washing machine load, 9 kg');
  assert.deepEqual(washer.values, original.values);
  assert.equal(washer.genericEvidence.method, 'representative');
  assert.equal(washer.genericEvidence.contributors[0].label, original.label);
  assert.equal(option(groups, 'washer-cycles', original.id), original);
  assert.equal(option(groups, 'refrigeration', 'generic-fridge-freezer').values.energy, 302 / 365);
  assert.equal(option(groups, 'refrigeration', 'generic-chest-freezer').values.energy, 189 / 365);
});

test('overlay is pure and idempotent; published factors are promoted without changing evidence', () => {
  const raw = [...applianceGroups, ...energyTravelGroups, ...materialGroups];
  const before = JSON.stringify(raw);
  const first = withActivityGenerics(raw);
  assert.equal(JSON.stringify(raw), before);
  assert.deepEqual(withActivityGenerics(first), first);
  const electricity = first.find(group => group.id === 'au-grid-electricity');
  assert.equal(electricity.options[0].id, 'national');
  assert.equal(electricity.options[0].values, option(raw, 'au-grid-electricity', 'national').values);
  const ferry = raw.find(group => group.id === 'uk-ferry-travel');
  assert.equal(first.find(group => group.id === ferry.id), ferry);
  const food = { id: 'unrelated-food', options: [{ id: 'one', values: { carbon: 1 } }] };
  assert.equal(withActivityGenerics([food])[0], food);
  for (const group of first) assert.equal(new Set(group.options.map(item => item.id)).size, group.options.length);
});


test('regional gas and whole-food references preserve exact source scenarios', () => {
  const raw = [...energyTravelGroups, ...foodGroups];
  const groups = withActivityGenerics(raw);
  for (const [groupId, id, memberId] of [
    ['au-pipeline-gas', 'generic-mains-gas-victoria', 'victoria'],
    ['french-meals', 'generic-chicken-meal', 'chicken'],
    ['uk-diets', 'generic-medium-meat-diet', 'medium-meat']
  ]) {
    const reference = option(groups, groupId, id);
    const original = option(raw, groupId, memberId);
    assert.equal(reference.values, original.values);
    assert.ok(reference.note.includes(original.note));
    assert.equal(reference.genericEvidence.contributors.length, 1);
    assert.equal(option(groups, groupId, memberId), original);
  }
});

test('electronic references reuse original records at runtime with report links and licence context', () => {
  const groups = withActivityGenerics(goodsGroups);
  for (const [id, originalId] of [['generic-smartphone', 'smartphone'], ['generic-tablet', 'tablet'], ['generic-laptop', 'laptop'], ['generic-desktop', 'desktop-home']]) {
    const item = option(groups, 'digital-devices', id);
    const original = option(goodsGroups, 'digital-devices', originalId);
    assert.equal(item.values, original.values);
    assert.equal(item.sourceProductName, original.sourceProductName);
    assert.equal(item.sourceReportDate, original.sourceReportDate);
    assert.ok(item.sources.some(source => source.url.includes('apple.com/environment/pdf/products/')));
    assert.ok(item.sources.some(source => source.url.includes('boavizta-data-us.csv')));
    assert.match(item.note, /Single-model reference/);
    assert.equal(option(groups, 'digital-devices', originalId), original);
  }
  const packaging = withActivityGenerics(materialGroups).find(group => group.id === 'packaging');
  assert.deepEqual(packaging.options.filter(item => item.generic).map(item => item.id), ['paper-primary', 'cardboard-primary', 'glass-primary']);
});

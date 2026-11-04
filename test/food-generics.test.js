import test from 'node:test';
import { defaultUsage } from '../dist/defaults.js';
import assert from 'node:assert/strict';
import { agribalyseFoodGroups } from '../dist/data/agribalyse-runtime.js';
import { genericFoodGroups } from '../dist/data/food-generics.js';

const sources = agribalyseFoodGroups.flatMap(group => group.options);
const byCode = new Map(sources.map(option => [option.sourceCode, option]));
const groupByCode = new Map(agribalyseFoodGroups.flatMap(group => group.options.map(option => [option.sourceCode, group])));
const options = genericFoodGroups.flatMap(group => group.options);

test('common foods cover every source leaf without replacing original records', () => {
  assert.equal(new Set(options.map(option => option.id)).size, options.length);
  assert.deepEqual(
    [...new Set(options.map(option => option.categoryPath.join(' > ')))].sort(),
    [...new Set(sources.map(option => option.categoryPath.join(' > ')))].sort()
  );
  assert.equal(new Set(options.map(option => option.representativeSourceCode)).size, options.length);
  for (const option of options) {
    assert.equal(option.generic, true);
    assert.equal(option.replacementBasis, 'agribalyse');
    assert.equal(option.sourceCode, undefined);
    assert.ok(!sources.some(source => source.id === option.id));
  }
});

test('each generic measure is an unchanged named source result with accessible provenance', () => {
  for (const option of options) {
    const source = byCode.get(option.representativeSourceCode);
    assert.ok(source, option.id);
    assert.deepEqual(option.values, source.values, option.id);
    assert.equal(Object.keys(option.values).length, 9);
    assert.deepEqual(option.categoryPath, source.categoryPath);
    assert.deepEqual(defaultUsage(genericFoodGroups[0], option), defaultUsage(groupByCode.get(source.sourceCode), source));
    assert.deepEqual(option.sources, source.sources);
    assert.equal(option.genericEvidence.method, 'representative');
    assert.equal(option.genericEvidence.contributors.length, 1);
    const contributor = option.genericEvidence.contributors[0];
    assert.deepEqual(contributor.values, option.values);
    assert.equal(contributor.url, source.sources[0].url);
    assert.ok(contributor.label.includes(source.sourceName));
    assert.match(option.genericEvidence.selection, /without averaging or weighting/);
    assert.ok(option.note.includes(source.note));
    assert.equal(option.dqr, source.dqr);
    assert.equal(option.qualityWarning, source.qualityWarning);
    assert.equal(option.packagingApproach, source.packagingApproach);
  }
});

test('everyday terms distinguish foods and retain material quality and preparation limits', () => {
  const find = id => options.find(option => option.id === 'generic-food-' + id);
  for (const id of ['beef', 'rice', 'apple', 'chicken', 'pasta', 'coffee', 'milk', 'tofu']) {
    assert.ok(find(id), id);
  }
  assert.equal(find('beef').representativeSourceCode, '6201');
  assert.equal(find('rice').representativeSourceCode, '9104');
  assert.equal(find('rice-dry').representativeSourceCode, '9100');
  for (const id of ['rice', 'pasta', 'coffee', 'sugar']) {
    assert.ok(find(id).dqr > 3);
    assert.match(find(id).note, /publisher recommends caution/);
  }
  assert.ok(!options.some(option => /^(fruit|meat|vegetables|diet)$/i.test(option.label)));
  const leafCounts = new Map();
  for (const option of options) {
    const path = option.categoryPath.join(' > ');
    leafCounts.set(path, (leafCounts.get(path) || 0) + 1);
  }
  assert.ok([...leafCounts.values()].every(count => count <= 5));
});


test('plain names expose material source assumptions in short hints', () => {
  const expected = {
    apple: ['Apple', 'Raw, with skin'],
    rice: ['Rice', 'Cooked, unsalted'],
    coffee: ['Coffee', 'Brewed, not instant, without sugar'],
    'beef-cooked': ['Beef', 'Grilled steak'],
    'chicken-cooked': ['Chicken', 'Cooked breast, without skin'],
    milk: ['Milk', 'Whole, pasteurised'],
    bread: ['Bread', 'Wholemeal, flour type 150']
  };
  for (const [id, [label, hint]] of Object.entries(expected)) {
    const option = options.find(item => item.id === 'generic-food-' + id);
    assert.ok(option);
    assert.equal(option.label, label);
    assert.equal(option.genericHint, hint);
  }
});

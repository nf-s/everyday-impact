import test from 'node:test';
import assert from 'node:assert/strict';
import { groups } from '../dist/data/catalogue.js';
import { validCatalogueChoice as validChoice } from '../dist/entries.js';
import { serializeComparison, parseComparison, comparisonURL, comparisonFromURL, portableShareBase, ShareLimitError } from '../dist/share-state.js';
import { setupSharing } from '../dist/share.js';

const byId = new Map(groups.map(group => [group.id, group]));
const grids = byId.get('au-grid-electricity').options.map(item => item.id);
const state = {
  choices: [
    { group: 'generic-foods', before: 'generic-food-beef-cooked', after: 'tofu', afterGroup: 'food-products', kind: 'swap', amount: 0.125, period: 'weekly', times: 3 },
    null,
    { group: 'return-flight', before: 'paris-new-york-return', after: null, kind: 'skip', amount: 1, period: 'once', times: 1 },
    { group: 'everyday-electricity', before: 'kettle-three-minutes', after: null, kind: 'footprint', amount: 2.5, period: 'daily', times: 1.5 }
  ],
  horizon: { amount: 3, unit: 'weeks' }, sharedOnly: true, grid: 'tasmania'
};

test('versioned shares preserve ordered choices, replacements, empty cards, quantities, cadence, horizon and toggles', () => {
  const encoded = serializeComparison(state, validChoice, grids);
  assert.equal(JSON.parse(encoded).v, 1);
  const restored = parseComparison(encoded, validChoice, grids);
  assert.deepEqual(restored, state);
  restored.choices[0].amount = 999;
  assert.equal(state.choices[0].amount, 0.125);
  for (const unit of ['days', 'weeks', 'months', 'years']) {
    const value = { ...state, horizon: { amount: 1000, unit }, grid: '', sharedOnly: false };
    const wire = serializeComparison(value, validChoice, grids);
    assert.equal(Object.hasOwn(JSON.parse(wire), 'g'), false);
    assert.deepEqual(parseComparison(wire, validChoice, grids), value);
  }
});

test('fresh-tab URLs contain only calculator state, retain legacy preset URLs, and reject duplicate share payloads', () => {
  const url = comparisonURL('https://example.com/calculator/?example=food-water&question=private&tracking=abc#labour', { ...state, question: 'never share this' }, validChoice, grids);
  const parsed = new URL(url);
  assert.deepEqual([...parsed.searchParams.keys()], ['comparison']);
  assert.equal(parsed.hash, '#compare');
  assert.equal(parsed.pathname, '/calculator/');
  assert.ok(!url.includes('private') && !url.includes('never'));
  assert.deepEqual(comparisonFromURL(url, validChoice, grids), state);
  assert.equal(comparisonFromURL('https://example.com/?example=food-water', validChoice, grids), null);
  parsed.searchParams.append('comparison', parsed.searchParams.get('comparison'));
  assert.throws(() => comparisonFromURL(parsed.href, validChoice, grids));
});

test('malformed, oversized, unavailable and incompatible state fails before hydration', () => {
  const source = JSON.parse(serializeComparison(state, validChoice, grids));
  const bad = [null, [], {}, { ...source, v: 2 }, { ...source, s: 1 }, { ...source, g: 'unknown' },
    { ...source, c: [] }, { ...source, c: Array(51).fill(null) }, { ...source, h: [0, 'years'] },
    { ...source, h: [1.5, 'months'] }, { ...source, h: [1001, 'days'] }, { ...source, h: [1, 'centuries'] },
    { ...source, question: 'unexpected' }, { ...source, c: [{ group: 'x' }] }];
  for (const mutate of [
    row => { row[0] = 'unknown'; }, row => { row[1] = 'missing'; },
    row => { row[2] = 'smartphone'; row[7] = 'digital-devices'; },
    row => { row[4] = 0; }, row => { row[4] = 1000001; }, row => { row[4] = '1'; },
    row => { row[5] = 'yearly'; }, row => { row[5] = 'once'; row[6] = 2; },
    row => { row[3] = 'skip'; }, row => { row.push('extra'); }
  ]) {
    const value = structuredClone(source);
    mutate(value.c[0]);
    bad.push(value);
  }
  for (const value of bad) assert.throws(() => parseComparison(JSON.stringify(value), validChoice, grids));
  assert.throws(() => parseComparison('{bad json', validChoice, grids));
  assert.throws(() => parseComparison('x'.repeat(16001), validChoice, grids));
  assert.throws(() => parseComparison('{"__proto__":{"polluted":true}}', validChoice, grids));
  assert.equal({}.polluted, undefined);
  assert.throws(() => serializeComparison({ ...state, choices: [{ ...state.choices[0], amount: Infinity }] }, validChoice, grids));
});

function ui(clipboard) {
  const elements = Object.fromEntries(['share-comparison', 'share-status', 'share-fallback', 'share-url'].map(id => [id, {
    hidden: true, dataset: {}, addEventListener(type, callback) { this.click = callback; },
    focus() { this.focused = true; }, select() { this.selected = true; }
  }]));
  const document = { getElementById: id => elements[id] };
  elements.api = setupSharing(() => state, validChoice, grids, { document, clipboard, href: () => 'https://example.com/' });
  return elements;
}

test('Share copies a restorable link and provides a selected readonly URL fallback on clipboard denial', async () => {
  let copied;
  const copiedUi = ui({ writeText: async value => { copied = value; } });
  await copiedUi['share-comparison'].click();
  assert.deepEqual(comparisonFromURL(copied, validChoice, grids), state);
  assert.match(copiedUi['share-status'].textContent, /copied/);
  const fallback = ui({ writeText: async () => { throw new Error('Denied'); } });
  await fallback['share-comparison'].click();
  assert.equal(fallback['share-fallback'].hidden, false);
  assert.equal(fallback['share-url'].selected, true);
  assert.equal(fallback['share-url'].focused, true);
  assert.deepEqual(comparisonFromURL(fallback['share-url'].value, validChoice, grids), state);
});


test('size/count limits are actionable and displayed share links are cleared when state changes', async () => {
  assert.throws(() => serializeComparison({ ...state, choices: Array(51).fill(null) }, validChoice, grids), error =>
    error instanceof ShareLimitError && /up to 50 choices/.test(error.message));
  const longChoice = { group: 'a'.repeat(160), before: 'b'.repeat(160), after: null, kind: 'footprint', amount: 1, period: 'once', times: 1 };
  assert.throws(() => serializeComparison({ ...state, choices: Array(50).fill(longChoice) }, () => true, grids), error =>
    error instanceof ShareLimitError && /too long.*Remove some choices/.test(error.message));
  const fallback = ui({ writeText: async () => { throw new Error('Denied'); } });
  await fallback['share-comparison'].click();
  assert.equal(fallback['share-fallback'].hidden, false);
  fallback.api.invalidate();
  assert.equal(fallback['share-fallback'].hidden, true);
  assert.equal(fallback['share-url'].value, '');
  assert.equal(fallback['share-status'].textContent, '');
});


test('loopback sharing uses the configured public base while other deployments keep their own host', () => {
  const canonical = 'https://everyday-impact.pages.dev/';
  for (const base of ['http://127.0.0.1:8000/', 'http://127.0.0.2:8080/subpath/', 'http://localhost:8000/', 'http://[::1]:8000/', 'http://dev.localhost:8000/']) {
    const url = comparisonURL(portableShareBase(base, canonical), state, validChoice, grids);
    assert.equal(new URL(url).origin, 'https://everyday-impact.pages.dev');
    assert.deepEqual(comparisonFromURL(url, validChoice, grids), state);
  }
  for (const base of ['https://preview.example.com/subpath/', 'https://everyday-impact.pages.dev/', 'http://192.168.1.10:8000/', 'https://127.example.com/']) {
    assert.equal(portableShareBase(base, canonical), base);
  }
  assert.throws(() => portableShareBase('http://localhost/', 'javascript:alert(1)'));
});

test('a zero-difference manual replacement remains shareable', () => {
  const choice = { ...state.choices[0], after: state.choices[0].before, afterGroup: state.choices[0].group };
  const comparison = { ...state, choices: [choice] };
  assert.deepEqual(parseComparison(serializeComparison(comparison, validChoice, grids), validChoice, grids), comparison);
});

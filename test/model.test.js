import test from 'node:test';
import assert from 'node:assert/strict';
import { groups } from '../dist/data/catalogue.js';
import { defaultUsage } from '../dist/defaults.js';
import { metrics, comparisonMetrics, metricForOption, estimateChoice, displayImpact, formatEstimate, calculate, availableMetrics } from '../dist/model.js';

const option = (group, id) => groups.find(entry => entry.id === group).options.find(item => item.id === id);

test('every factor has numeric values, a defined unit and publicly traceable evidence', () => {
  assert.equal(new Set(groups.map(group => group.id)).size, groups.length);
  for (const group of groups) {
    assert.ok(group.unit && group.plural && group.singular && group.sourceNote && group.defaultAmount > 0, group.id);
    assert.equal(new Set(group.options.map(item => item.id)).size, group.options.length);
    for (const item of group.options) {
      const use = defaultUsage(group, item);
      assert.ok(use.description && use.amount > 0 && use.times > 0, item.id);
      assert.ok(['once', 'daily', 'weekly', 'monthly'].includes(use.period), item.id);
      assert.ok(item.label && item.id && Object.keys(item.values).length);
      assert.ok(group.sources.length || item.sources?.length);
      for (const source of [...group.sources, ...(item.sources || [])]) {
        assert.ok(source.label && new URL(source.url).protocol === 'https:');
        if (source.measure) assert.ok(Object.hasOwn(comparisonMetrics, source.measure));
      }
      for (const [metric, amount] of Object.entries(item.values)) {
        assert.ok(Object.hasOwn(metrics, metric), metric);
        assert.ok(Number.isFinite(amount), item.id);
      }
    }
  }
});

test('appliance estimates recover label-year electricity and keep per-cycle water and on-mode power distinct', () => {
  const dishwasher = option('dishwasher-cycles', 'adw1264');
  assert.equal(estimateChoice(dishwasher, null, 1, 'daily', 1, 'energy'), 219);
  assert.equal(estimateChoice(dishwasher, null, 1, 'once', 1, 'water'), 9.21);
  assert.equal(estimateChoice(option('dryer-loads', 'acd0929'), null, 1, 'weekly', 1, 'energy'), 351);
  assert.equal(estimateChoice(option('tv-viewing', 'atv6105'), null, 2, 'once', 1, 'energy'), 0.0526);
});

test('purchasing a 200 g garment converts the per-tonne procurement factors to the chosen mass', () => {
  const primary = option('clothing-material', 'clothing-primary');
  const reused = option('clothing-material', 'clothing-reused');
  const change = estimateChoice(primary, reused, 0.2, 'once', 1, 'carbon');
  assert.ok(Math.abs(change - (22310 - 152.25) * 0.2 / 1000) < 1e-9);
});

test('table and calculation details express changes in the same units and direction', () => {
  assert.equal(formatEstimate(0.4745, 'water', 'footprint'), '0.475 L');
  assert.equal(formatEstimate(-1.5, 'carbon', 'swap'), '1.5 kg CO₂e higher');
  assert.equal(formatEstimate(1.5, 'carbon', 'skip'), '1.5 kg CO₂e lower');
  assert.equal(formatEstimate(0, 'energy', 'swap'), '0 kWh');
  assert.equal(formatEstimate(-0.002907, 'energy', 'swap', 'Wh'), '2.91 Wh higher');
});

test('a missing factor stays unknown while a skipped item has a zero replacement footprint', () => {
  const shower = option('shower', 'efficient-6l');
  const ai = option('ai-request', 'gemini-text-2025');
  assert.deepEqual(availableMetrics(ai, shower), []);
  assert.equal(calculate(ai, shower, 1, 'once', 'coolingWater'), null);
  assert.equal(calculate(shower, null, 4, 'daily', 'tapWater'), 8760);
  assert.equal(calculate(shower, null, NaN, 'daily', 'tapWater'), null);
});

test('swaps distinguish increases from decreases and apply quantity and recurrence once', () => {
  const beef = option('french-meals', 'beef');
  const vegan = option('french-meals', 'vegan');
  assert.ok(Math.abs(calculate(beef, vegan, 3, 'weekly', 'carbon') - 691.08) < 1e-6);
  assert.ok(calculate(vegan, beef, 1, 'once', 'carbon') < 0);
  assert.equal(calculate(beef, beef, 1, 'once', 'carbon'), 0);
  assert.equal(calculate(option('return-flight', 'paris-new-york-return'), null, 1, 'once', 'carbon'), 1273.71070808);
});

test('comparison rows stay fixed while each item retains its source water measure', () => {
  const ai = option('ai-request', 'gemini-text-2025');
  const beef = option('us-beef', 'consumed-beef');
  const steak = option('food-products', 'beef-steak');
  assert.equal(metricForOption(steak, 'water'), null);
  assert.equal(estimateChoice(steak, null, 1, 'once', 1, 'waterScarcity'), 3.05);
  assert.equal(comparisonMetrics.water.unit, 'L');
  assert.equal(metricForOption(ai, 'water'), 'coolingWater');
  assert.equal(metricForOption(beef, 'water'), 'consumedWater');
  assert.equal(estimateChoice(ai, null, 1, 'once', 1, 'water'), 0.00026);
  assert.equal(estimateChoice(beef, null, 1, 'once', 1, 'water'), 5126);
  assert.equal(metricForOption(ai, 'agribalyseLand'), null);
  assert.equal(estimateChoice(ai, null, 1, 'once', 1, 'agribalyseLand'), null);
  assert.equal(displayImpact(0.00026, 'water'), '0.26 mL');
  assert.equal(displayImpact(1501, 'water'), '1,500 L');
});

test('water swaps require the same source measure and missing factors stay unknown', () => {
  const ai = option('ai-request', 'gemini-text-2025');
  const shower = option('shower', 'efficient-6l');
  const regularShower = option('shower', 'standard-7-5l');
  assert.equal(estimateChoice(ai, shower, 1, 'once', 1, 'water'), null);
  assert.equal(estimateChoice(ai, shower, 1, 'once', 1, 'carbon'), null);
  assert.equal(estimateChoice(regularShower, shower, 4, 'daily', 1, 'water'), 2190);
  assert.equal(metricForOption({ values: { freshwater: 0 } }, 'water'), 'freshwater');
  assert.equal(estimateChoice({ values: { freshwater: 0 } }, null, 1, 'once', 1, 'water'), 0);
  assert.equal(metricForOption({ values: { coolingWater: NaN } }, 'water'), null);
  assert.equal(metricForOption({ values: { coolingWater: 1, tapWater: 2 } }, 'water'), null);
  assert.equal(metricForOption(ai, 'unknown'), null);
});

test('chat reports retain their original units, evidence and distinct water boundaries', () => {
  const gemini = option('ai-request', 'gemini-text-2025');
  const leChat = option('ai-chat-reports', 'mistral-le-chat-400');
  const chatGPT = option('ai-chat-reports', 'chatgpt-query-2025');
  assert.equal(leChat.values.carbon, 0.00114);
  assert.equal(leChat.values.mineralResources, 0.16);
  assert.equal(estimateChoice(leChat, null, 1, 'once', 1, 'water'), 0.045);
  assert.equal(estimateChoice(leChat, null, 1, 'once', 1, 'energy'), null);
  assert.equal(chatGPT.values.energy, 0.00034);
  assert.equal(chatGPT.evidenceLabel, 'Limited disclosure');
  assert.ok(Math.abs(estimateChoice(chatGPT, null, 1, 'once', 1, 'water') - 0.00032176) < 0.00000001);
  assert.equal(estimateChoice(chatGPT, leChat, 1, 'once', 1, 'water'), null);
  assert.equal(estimateChoice(leChat, gemini, 1, 'once', 1, 'water'), null);
});

test('everyday electricity scenarios use electrical input and minutes per use', () => {
  const group = groups.find(entry => entry.id === 'everyday-electricity');
  for (const [id, kWh] of [['led-hour', 0.01], ['kettle-three-minutes', 0.1], ['microwave-three-minutes', 0.06], ['laptop-hour', 0.035]]) {
    const item = option(group.id, id);
    const usage = defaultUsage(group, item);
    assert.equal(item.evidenceLabel, 'Modelled scenario');
    assert.ok(Math.abs(estimateChoice(item, null, usage.amount, usage.period, usage.times, 'energy') - kWh) < 1e-12);
    assert.equal(estimateChoice(item, null, 1, 'once', 1, 'carbon'), null);
  }
});

test('comparison estimates apply occurrence counts once and reject invalid inputs', () => {
  const ai = option('ai-request', 'gemini-text-2025');
  assert.equal(estimateChoice(ai, null, 2, 'weekly', 3, 'energy'), ai.values.energy * 2 * 52 * 3);
  assert.equal(estimateChoice(ai, null, 2, 'once', 3, 'energy'), ai.values.energy * 2 * 3);
  assert.equal(estimateChoice(ai, null, 2, 'monthly', 0.5, 'energy'), ai.values.energy * 2 * 12 * 0.5);
  for (const times of [0, -1, NaN, Infinity, undefined, '2']) {
    assert.equal(estimateChoice(ai, null, 1, 'once', times, 'energy'), null);
  }
  assert.equal(estimateChoice(ai, null, NaN, 'once', 1, 'energy'), null);
  assert.equal(estimateChoice(ai, null, 1, 'unknown', 1, 'energy'), null);
});

test('the general toilet example applies the WELS flush mix once per flush', () => {
  const group = groups.find(entry => entry.id === 'toilet-flush');
  const toilet = option(group.id, 'dual-flush-mix');
  const { amount, times, period } = defaultUsage(group, toilet);
  assert.equal(toilet.values.tapWater, 3.3);
  assert.equal(estimateChoice(toilet, null, amount, period, times, 'water'), (4 * 3 + 4.5) * 365);
});

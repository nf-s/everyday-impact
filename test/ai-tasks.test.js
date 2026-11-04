import test from 'node:test';
import assert from 'node:assert/strict';
import { aiTaskGroups } from '../dist/data/ai-tasks.js';

const options = aiTaskGroups.flatMap(group => group.options);
const byId = new Map(options.map(option => [option.id, option]));

test('2024 published task means convert from 1000 inferences to one output', () => {
  // Independent transcription of the selected rows in corrected paper Table 2.
  const sourceRows = [
    ['image-generation', 2.907, 3.31],
    ['summarisation', 0.049, 0.01],
    ['text-classification', 0.002, 0.001],
    ['image-classification', 0.007, 0.001],
    ['object-detection', 0.038, 0.02],
    ['image-captioning', 0.063, 0.02],
    ['extractive-qa', 0.003, 0.001],
    ['short-text', 0.047, 0.03]
  ];
  for (const [id, mean, std] of sourceRows) {
    const option = byId.get('luccioni-2024-' + id);
    assert.ok(option, id);
    assert.equal(option.publishedMeanKwhPer1000, mean);
    assert.equal(option.publishedStdKwhPer1000, std);
    assert.equal(option.values.energy, mean / 1000);
    assert.match(option.reasoning, /kWh ÷ 1,000/);
  }
  const shortText = byId.get('luccioni-2024-short-text');
  assert.match(shortText.note, /Ten new tokens/);
  assert.match(byId.get('luccioni-2024-object-detection').note, /whole image/);
});

test('video factors sum source component means once and retain clip configurations', () => {
  // Source Tables 2 and 4; dimensions are height first in the paper.
  const rows = [
    ['ltx-0-9-7', 512, 704, 121, 24, 40, 3.16, 0.32, 0.19, 0.00367],
    ['cogvideox-5b', 480, 720, 49, 8, 50, 21.6, 2.4, 1.3, 0.0253],
    ['wan-1-3b', 720, 1280, 81, 15, 50, 78.8, 7.4, 4.3, 0.0905],
    ['wan-14b', 720, 1280, 81, 15, 50, 359.7, 35.6, 19.8, 0.4151]
  ];
  for (const [id, height, width, frames, fps, steps, gpu, cpu, ram, energy] of rows) {
    const option = byId.get('video-2025-' + id);
    assert.ok(option, id);
    assert.deepEqual(option.publishedComponentWh, { gpu, cpu, ram });
    assert.equal(option.values.energy, energy);
    assert.deepEqual(
      Object.fromEntries(Object.entries(option.videoConfiguration).filter(([key]) => key !== 'model')),
      { height, width, frames, fps, steps }
    );
    assert.match(option.note, /RAM is estimated/);
    assert.match(option.reasoning, /per clip/);
  }
});

test('benchmarks keep denominators, scope, original links and licence subsets distinct', () => {
  assert.equal(new Set(aiTaskGroups.map(group => group.id)).size, aiTaskGroups.length);
  assert.equal(byId.size, options.length);
  for (const group of aiTaskGroups) {
    assert.ok(group.unit && group.singular && group.plural);
    assert.ok(group.energyScope);
    for (const option of group.options) {
      assert.equal(option.evidenceLabel, group.id === 'ai-long-reasoning' ? 'Published model' : 'Benchmark');
      assert.deepEqual(option.categoryPath.slice(0, 2), ['Digital', 'AI']);
      assert.match(option.categoryPath[2], /^[A-Z]/);
      assert.ok(option.reasoning);
      assert.deepEqual(Object.keys(option.values), ['energy']);
      assert.ok(Number.isFinite(option.values.energy) && option.values.energy > 0);
      assert.ok(option.sources.every(source => new URL(source.url).protocol === 'https:'));
      assert.ok(option.defaultUsage.amount > 0);
      assert.ok(option.defaultUsage.times > 0);
    }
    if (group.id === 'ai-long-reasoning') {
      assert.match(group.sourceNote, /one prompt-completion event/);
      assert.match(group.sourceNote, /CC BY-SA 4.0/);
    } else if (group.id === 'ai-video-generation') {
      assert.equal(group.singular, 'clip');
      assert.match(group.sourceNote, /RAM energy estimated/);
      assert.match(group.sourceNote, /CC BY 4.0/);
      assert.ok(group.sources.some(source => source.url.includes('2509.19222v1#S5.T4')));
      assert.ok(!group.sources.some(source => source.url.includes('/by-sa/')));
    } else {
      assert.match(group.sourceNote, /idle draw from the other GPUs/);
      assert.match(group.sourceNote, /standard deviation describes variation/);
      assert.match(group.sourceNote, /CC BY-SA 4.0/);
      assert.ok(group.sources.some(source => source.url.includes('2311.16863v3#S4.T2')));
    }
  }
});

test('long reasoning uses a published simulation median with its actual event denominator', () => {
  const option = byId.get('oviedo-2026-deepseek-r1-long');
  assert.ok(option);
  assert.equal(option.values.energy, 0.0106);
  assert.equal(option.publishedMedianWh, 10.6);
  assert.deepEqual(option.publishedIqrWh, [4.29, 21.7]);
  assert.equal(option.evidenceLabel, 'Published model');
  assert.match(option.reasoning, /median for each query/);
  assert.match(option.note, /middle half of simulated queries/);
  const group = aiTaskGroups.find(item => item.id === 'ai-long-reasoning');
  assert.equal(group.singular, 'query');
  assert.match(group.sourceNote, /including facility overhead/);
  assert.match(group.sourceNote, /500 input tokens and a median of 5,000 output tokens/);
  assert.match(group.sourceNote, /Tool execution, orchestration/);
});

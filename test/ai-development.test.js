import test from 'node:test';
import assert from 'node:assert/strict';
import { aiDevelopmentGroups } from '../dist/data/ai-development.js';

const benchmark = aiDevelopmentGroups.find(group => group.id === 'ai-code-generation');
const scenarios = aiDevelopmentGroups.find(group => group.id === 'ai-web-app-development');

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12, actual + ' differs from ' + expected);
}

test('measured coding factors retain exact configuration and convert joules to kWh once', () => {
  assert.ok(benchmark);
  assert.equal(benchmark.defaultAmount, 1000);
  const expected = [
    { id: 'qwen3-coder-30b-b200', gpus: 1, j: 0.8442158286231319, output: 249.5546875, request: 210.67801729459924 },
    { id: 'qwen3-coder-480b-fp8-b200', gpus: 4, j: 19.601410817113816, output: 260.91796875, request: 5114.360295035614 }
  ];
  for (const row of expected) {
    const item = benchmark.options.find(item => item.id === row.id);
    assert.ok(item);
    assert.equal(item.evidenceLabel, 'Benchmark');
    assert.equal(item.benchmark.maxNumSeqs, 8);
    assert.equal(item.benchmark.numGpus, row.gpus);
    assert.equal(item.benchmark.meanOutputTokensPerRequest, row.output);
    near(item.values.energy * 3600000, row.j);
    near(item.values.energy * 1000, row.j / 3600);
    near(item.benchmark.joulesPerRequest, row.request);
    near(row.request / row.output, row.j);
  }
});

test('app scenarios expose authored stage totals and scale the matching benchmark, including revisions', () => {
  assert.ok(benchmark);
  assert.ok(scenarios);
  assert.equal(scenarios.options.length, 4);
  for (const item of scenarios.options) {
    const scenario = item.scenario;
    assert.equal(item.evidenceLabel, 'Modelled scenario');
    assert.match(scenario.author, /AI-authored/);
    assert.equal(scenario.stages.reduce((sum, stage) => sum + stage.outputTokens, 0), scenario.outputTokens);
    assert.ok(scenario.stages.some(stage => stage.label === 'Write tests' && stage.outputTokens > 0));
    assert.ok(scenario.stages.some(stage => stage.label === 'Revise' && stage.outputTokens > 0));
    const factor = benchmark.options.find(option => option.benchmark.model === scenario.benchmarkModel);
    assert.ok(factor);
    near(item.values.energy, scenario.outputTokens * factor.values.energy);
    assert.ok([20000, 100000].includes(scenario.outputTokens));
    assert.match(item.reasoning, /3,600,000/);
  }
  // Same serving setup: five times as many generated tokens, exactly five times the electricity.
  near(scenarios.options[1].values.energy, scenarios.options[0].values.energy * 5);
  near(scenarios.options[3].values.energy, scenarios.options[2].values.energy * 5);
});

test('GPU-only evidence does not acquire invented carbon, water, full-app or proprietary-service claims', () => {
  assert.ok(benchmark);
  assert.ok(scenarios);
  assert.match(benchmark.sourceNote, /includes input processing/);
  assert.match(benchmark.sourceNote, /Input-token lengths are not published/);
  assert.match(scenarios.sourceNote, /AI-authored output-token budget/);
  assert.match(scenarios.sourceNote, /much larger contexts/);
  assert.match(scenarios.sourceNote, /Test execution/);
  for (const group of [benchmark, scenarios]) {
    const ids = new Set();
    for (const item of group.options) {
      assert.ok(!ids.has(item.id));
      ids.add(item.id);
      assert.deepEqual(Object.keys(item.values), ['energy']);
      assert.ok(Number.isFinite(item.values.energy) && item.values.energy > 0);
      assert.ok(item.sources.some(source => source.url.includes('2bdd0070186956688e1f842dc28077980fe64013')));
      assert.ok(item.sources.some(source => source.url.includes('benchmark-v3/blob/f4db020')));
    }
  }
});

test('genuine agent result counts one attempt including failures and preserves its incremental CPU/GPU scope', () => {
  const group = aiDevelopmentGroups.find(group => group.id === 'ai-coding-agent-bug-fix');
  assert.ok(group);
  assert.equal(group.singular, 'attempt');
  assert.equal(group.defaultAmount, 1);
  assert.equal(group.options.length, 1);
  const item = group.options[0];
  near(item.values.energy, 208.42 / 3600);
  assert.equal(item.energyScope, 'CPU and GPU above idle');
  assert.equal(group.energyScope, item.energyScope);
  assert.match(group.sourceNote, /2 of 50/);
  assert.match(group.sourceNote, /including failures/);
  assert.ok(item.sources.every(source => source.url.includes('2512.09543v2')));
  assert.equal(item.evidenceLabel, 'Benchmark');
  assert.equal(item.values.carbon, undefined);
  assert.match(item.reasoning, /0.05789 kWh/);
  assert.equal(benchmark.energyScope, 'GPU only');
  assert.equal(scenarios.energyScope, 'GPU-only proxy');
  assert.match(benchmark.options[0].reasoning, /0.8442 J/);
  assert.ok(!benchmark.options[0].reasoning.includes('0.8442158286231319'));
});

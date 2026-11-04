// Selected ML.ENERGY v3 measurements, converted and combined with authored scenarios.
// Apache-2.0 applies only to the ML.ENERGY measurements below.
// SWEnergy contributes one cited factual result and outcome; no open licence claimed.
// No prompts, publication text, model weights, tables or code outputs copied.
const revision = '2bdd0070186956688e1f842dc28077980fe64013';
const dataRoot = 'https://raw.githubusercontent.com/ml-energy/leaderboard/' + revision + '/public/data/models/';
const dataset = 'https://huggingface.co/datasets/ml-energy/benchmark-v3/blob/f4db020a045a92cc212199f889e57d55f9fa6391/README.md';
const methodology = 'https://github.com/ml-energy/benchmark/blob/master/docs/analyzing-results.md';
const models = [
  {
    id: 'qwen3-coder-30b-b200', label: 'Qwen3-Coder 30B · 1 B200',
    model: 'Qwen/Qwen3-Coder-30B-A3B-Instruct', precision: 'bfloat16', gpus: 1,
    joulesPerOutputToken: 0.8442158286231319,
    meanOutputTokensPerRequest: 249.5546875, joulesPerRequest: 210.67801729459924,
    observedAverageBatch: 7.813953488372093,
    url: dataRoot + 'Qwen__Qwen3-Coder-30B-A3B-Instruct__sourcegraph-fim.json'
  },
  {
    id: 'qwen3-coder-480b-fp8-b200', label: 'Qwen3-Coder 480B FP8 · 4 B200s',
    model: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8', precision: 'FP8', gpus: 4,
    joulesPerOutputToken: 19.601410817113816,
    meanOutputTokensPerRequest: 260.91796875, joulesPerRequest: 5114.360295035614,
    observedAverageBatch: 7.453157529493407,
    url: dataRoot + 'Qwen__Qwen3-Coder-480B-A35B-Instruct-FP8__sourcegraph-fim.json'
  }
];

const sharedSources = [
  { label: 'ML.ENERGY v3 dataset · authors, schema and Apache-2.0 licence', url: dataset },
  { label: 'ML.ENERGY · steady-state energy measurement and token denominator', url: methodology },
  { label: 'ML.ENERGY · code-completion workload and vLLM 0.11.1 runtime', url: 'https://github.com/ml-energy/benchmark/blob/master/docs/overview.md' },
  { label: 'Apache License 2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0' }
];
const scope = 'ML.ENERGY v3 measured GPU electricity during steady-state code completion using Sourcegraph fill-in-the-middle requests, vLLM 0.11.1 and up to eight concurrent sequences. The factor divides GPU energy by generated output tokens. It includes input processing during the measurement window. Input-token lengths are not published in the selected records. Warm-up, other server components, facility overhead, training and hardware manufacture are outside the measurement.';
const attribution = 'Adapted from Jae-Won Chung and coauthors, The ML.ENERGY Benchmark (2025), v3 dataset, Apache-2.0. The linked records preserve the measured configurations and original units.';

function modelSources(model) {
  return [{ label: 'ML.ENERGY · exact model configurations JSON', url: model.url }, ...sharedSources];
}

function displayNumber(value) {
  return String(Number(value.toPrecision(4)));
}

function configuration(model) {
  return model.model + ', ' + model.precision + ', ' + model.gpus + ' NVIDIA B200 GPU(s), max_num_seqs=8. Observed mean batch ' + displayNumber(model.observedAverageBatch) + ', mean output ' + displayNumber(model.meanOutputTokensPerRequest) + ' tokens per request. Mean energy per request is ' + displayNumber(model.joulesPerRequest) + ' J.';
}

const budgets = [
  {
    id: 'prototype', label: 'Prototype draft',
    stages: [{ label: 'Plan', outputTokens: 2000 }, { label: 'Implement', outputTokens: 10000 }, { label: 'Write tests', outputTokens: 4000 }, { label: 'Revise', outputTokens: 4000 }],
    output: 'A small interactive prototype with a form, tests and one round of revisions.'
  },
  {
    id: 'extended-build', label: 'Build with more tests and revisions',
    stages: [{ label: 'Plan', outputTokens: 10000 }, { label: 'Implement', outputTokens: 40000 }, { label: 'Write tests', outputTokens: 20000 }, { label: 'Revise', outputTokens: 30000 }],
    output: 'An app with several views, input validation, tests and repeated revisions.'
  }
];

export const aiDevelopmentGroups = [
  {
    id: 'ai-code-generation', label: 'AI code generation benchmark', category: 'Digital', energyScope: 'GPU only',
    unit: 'per generated output token', singular: 'output token', plural: 'output tokens', defaultAmount: 1000,
    sourceNote: scope + ' ' + attribution,
    sources: sharedSources,
    options: models.map(model => ({
      id: model.id, label: 'Generate code · ' + model.label, categoryPath: ['Digital', 'AI', 'Coding'], evidenceLabel: 'Benchmark', energyScope: 'GPU only',
      values: { energy: model.joulesPerOutputToken / 3600000 },
      reasoning: 'The benchmark measured GPU electricity during code completion. ' + displayNumber(model.joulesPerOutputToken) + ' J per output token ÷ 3,600,000 J/kWh. Generating 1,000 tokens at this rate uses ' + displayNumber(1000 * model.joulesPerOutputToken / 3600000) + ' kWh of GPU electricity.',
      note: configuration(model), sources: modelSources(model),
      benchmark: { task: 'sourcegraph-fim', model: model.model, gpuModel: 'B200', numGpus: model.gpus, maxNumSeqs: 8, joulesPerOutputToken: model.joulesPerOutputToken, meanOutputTokensPerRequest: model.meanOutputTokensPerRequest, joulesPerRequest: model.joulesPerRequest }
    }))
  },
  {
    id: 'ai-web-app-development', label: 'AI web-app development scenarios', category: 'Digital', energyScope: 'GPU-only proxy',
    unit: 'per illustrative build', singular: 'build', plural: 'builds', defaultAmount: 1,
    sourceNote: 'The calculator applies an AI-authored output-token budget to a measured code-completion factor. It counts planning, generated tests and revisions, including discarded output. Real agents can process much larger contexts and use different caching and batching. Test execution, local development and hosting are outside the estimate. ' + scope + ' ' + attribution,
    sources: [...sharedSources, { label: 'Bai et al. (2026) · observed agent context growth and token variability', url: 'https://arxiv.org/abs/2604.22750v1' }],
    options: models.flatMap(model => budgets.map(budget => {
      const outputTokens = budget.stages.reduce((total, stage) => total + stage.outputTokens, 0);
      const stageText = budget.stages.map(stage => stage.label + ' ' + stage.outputTokens.toLocaleString('en-US')).join(' + ');
      return {
        id: budget.id + '-' + model.id,
        label: 'Build a web app · ' + budget.label.toLowerCase() + ' · ' + (outputTokens / 1000) + 'k tokens · ' + (model.gpus === 1 ? '30B proxy' : '480B FP8 proxy'),
        categoryPath: ['Digital', 'AI', 'Coding'], evidenceLabel: 'Modelled scenario', energyScope: 'GPU-only proxy', values: { energy: outputTokens * model.joulesPerOutputToken / 3600000 },
        reasoning: 'We estimate GPU electricity from a code-completion benchmark. Local tools, facility overhead and hosting are outside its scope. The assumed output-token budget is ' + stageText + ' = ' + outputTokens.toLocaleString('en-US') + '. GPU electricity = ' + outputTokens.toLocaleString('en-US') + ' output tokens × ' + displayNumber(model.joulesPerOutputToken) + ' J/token ÷ 3,600,000 J/kWh.',
        defaultUsage: { amount: 1, times: 1, period: 'once', description: 'Assumes one build this year. ' + budget.output },
        note: budget.output + ' ' + configuration(model),
        sources: modelSources(model),
        scenario: { author: 'AI-authored illustrative assumptions', outputTokens, stages: budget.stages.map(stage => ({ ...stage })), benchmarkModel: model.model, joulesPerOutputToken: model.joulesPerOutputToken }
      };
    }))
  },
  {
    id: 'ai-coding-agent-bug-fix', label: 'Ask a coding agent to fix a bug', category: 'Digital',
    energyScope: 'CPU and GPU above idle', unit: 'per issue-resolution attempt',
    singular: 'attempt', plural: 'attempts', defaultAmount: 1,
    sourceNote: 'Tripathy, Harshit and Vaidhyanathan measured 50 SWE-bench Verified Mini issues three times each. Their AutoCodeRover and Qwen-3 1.7B configuration resolved an average of 2 of 50 issues. Table 1 includes every attempt, including failures. The authors measured CPU and GPU energy above the idle baseline on a Xeon w3-2435 and RTX A2000. Each run had a 30-minute limit and a 32K context window.',
    sources: [{ label: 'SWEnergy · original study, Table 1 and measurement method', url: 'https://arxiv.org/html/2512.09543v2#S5.T1' }],
    options: [{
      id: 'autocoderover-qwen3-1-7b-attempt', label: 'Ask a coding agent to fix a bug · one small-model attempt',
      categoryPath: ['Digital', 'AI', 'Coding'], evidenceLabel: 'Benchmark', energyScope: 'CPU and GPU above idle',
      values: { energy: 208.42 / 3600 },
      reasoning: '208.42 kJ per attempt ÷ 3,600 kJ/kWh ≈ 0.05789 kWh. This includes failed attempts. AutoCodeRover with Qwen-3 1.7B solved an average of 2 out of 50 issues.',
      sources: [{ label: 'SWEnergy · AutoCodeRover / Qwen mean, Table 1', url: 'https://arxiv.org/html/2512.09543v2#S5.T1' }]
    }]
  }
];

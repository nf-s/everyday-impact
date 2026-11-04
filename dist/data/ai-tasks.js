// Numerical adaptation of Table 2, Luccioni, Jernite & Strubell (2024),
// Power Hungry Processing: Watts Driving the Cost of AI Deployment?
// https://arxiv.org/html/2311.16863v3#S4.T2
// Adapted 2026-11-04: selected rows; kWh/1,000 inferences divided by 1,000.
// This adapted benchmark subset (taskBenchmarks and its expanded groups) is
// licensed CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/ .
// Raw repository logs and benchmark input datasets are not redistributed.
// Permission for this subset comes from the paper, not repository availability.
// The separately attributed video subset below is CC BY 4.0, not CC BY-SA.

const paper = 'https://arxiv.org/html/2311.16863v3';
const taskSources = [
  { label: 'Luccioni, Jernite & Strubell (2024) · corrected paper, Table 2', url: paper + '#S4.T2' },
  { label: 'Measurement protocol · corrected eight-GPU node boundary', url: paper + '#S3.SS2' },
  { label: 'Paper licence · CC BY-SA 4.0', url: 'https://arxiv.org/abs/2311.16863v3' },
  { label: 'Adapted task benchmark subset · CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' }
];
const taskScope = 'Luccioni, Jernite and Strubell report mean energy for task-specific models in Table 2 of the corrected paper. CodeCarbon estimated CPU, RAM and GPU electricity for sequential requests. One A100 ran inference on an eight-GPU node, and the total includes idle draw from the other GPUs. Training, hardware manufacture, facility overhead and user devices are outside this benchmark. The published standard deviation describes variation in the study. The adapted records are available under CC BY-SA 4.0.';

// ID, action, picker group, output unit, published mean and SD (kWh/1,000), scope.
const taskBenchmarks = [
  ['image-generation', 'Generate an image with AI', 'Image tasks', 'image', 2.907, 3.31, 'Image dimensions and generation settings vary across tested models.'],
  ['summarisation', 'Summarise text with AI', 'Text tasks', 'summary', 0.049, 0.01, 'Dataset-specific texts and summary lengths.'],
  ['text-classification', 'Classify the sentiment of a text', 'Text tasks', 'classification', 0.002, 0.001, 'The model assigns a sentiment label to the supplied text.'],
  ['image-classification', 'Classify an image with AI', 'Image tasks', 'classification', 0.007, 0.001, 'One image classified per inference.'],
  ['object-detection', 'Detect objects in an image', 'Image tasks', 'image', 0.038, 0.02, 'One inference analyses the whole image regardless of the number of objects.'],
  ['image-captioning', 'Caption an image with AI', 'Image tasks', 'caption', 0.063, 0.02, 'One caption per input image.'],
  ['extractive-qa', 'Find an answer in a passage', 'Text tasks', 'answer', 0.003, 0.001, 'Extracts an answer from supplied text.'],
  ['short-text', 'Generate a short text completion', 'Text tasks', 'completion', 0.047, 0.03, 'Ten new tokens per input text.']
];

function taskGroup([id, label, category, output, publishedMean, publishedStd, scope]) {
  const perOutput = publishedMean / 1000;
  const conversion = 'For 1,000 inferences the study reports a mean of ' + publishedMean + ' kWh and a standard deviation of ' + publishedStd +
    ' kWh. ' + publishedMean + ' kWh ÷ 1,000 = ' + Number(perOutput.toPrecision(6)) + ' kWh per ' + output + '.';
  return {
    id: 'ai-' + id, label, category: 'Digital', energyScope: 'CPU, RAM and GPUs', unit: 'per benchmark ' + output,
    singular: output, plural: output === 'summary' ? 'summaries' : output + 's', defaultAmount: 1,
    sourceNote: taskScope, sources: taskSources,
    options: [{
      id: 'luccioni-2024-' + id, label, evidenceLabel: 'Benchmark',
      genericHint: '2024 task-specific model mean',
      categoryPath: ['Digital', 'AI', category],
      values: { energy: perOutput },
      publishedMeanKwhPer1000: publishedMean, publishedStdKwhPer1000: publishedStd,
      note: scope, reasoning: conversion, sources: taskSources,
      defaultUsage: { amount: 1, times: 1, period: 'daily', description: 'Assumes one ' + output + ' each day at the benchmark mean.' }
    }]
  };
}

// Distinct numerical adaptation: Delavande, Pierrard & Luccioni (2025),
// Video Killed the Energy Budget, arXiv:2509.19222v1, Tables 2 and 4.
// https://arxiv.org/html/2509.19222v1
// Video subset licensed CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ .
// Adapted 2026-11-04: named configurations selected; published GPU + CPU + RAM
// component means summed and converted from Wh to kWh. No figures/text copied.
const videoPaper = 'https://arxiv.org/html/2509.19222v1';
const videoSources = [
  { label: 'Delavande, Pierrard & Luccioni (2025) · component results, Table 4', url: videoPaper + '#S5.T4' },
  { label: 'Default output configurations · Table 2', url: videoPaper + '#S4.T2' },
  { label: 'Video paper and CC BY 4.0 licence', url: 'https://arxiv.org/abs/2509.19222v1' },
  { label: 'Video subset · CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' }
];
const videoScope = 'Delavande, Pierrard and Luccioni benchmarked 50 prompts on a dedicated H100 SXM 80 GB and an eight-core AMD EPYC 7R13. The totals combine GPU and CPU energy with RAM energy estimated by CodeCarbon. Tables 2 and 4 give the default settings and mean electricity. Clip sizes and quality vary between models. The benchmark excludes training, manufacture, facility overhead and user devices. The adapted records are available under CC BY 4.0.';

// id, model, height, width, frames, fps, steps, GPU Wh, CPU Wh, RAM Wh.
const videoBenchmarks = [
  ['ltx-0-9-7', 'LTX-Video-0.9.7-dev', 512, 704, 121, 24, 40, 3.16, 0.32, 0.19],
  ['cogvideox-5b', 'CogVideoX-5B', 480, 720, 49, 8, 50, 21.6, 2.4, 1.3],
  ['wan-1-3b', 'WAN2.1-T2V-1.3B', 720, 1280, 81, 15, 50, 78.8, 7.4, 4.3],
  ['wan-14b', 'WAN2.1-T2V-14B', 720, 1280, 81, 15, 50, 359.7, 35.6, 19.8]
];

function videoOption([id, model, height, width, frames, fps, steps, gpu, cpu, ram]) {
  const wh = Number((gpu + cpu + ram).toPrecision(12));
  const output = width + ' × ' + height + ', ' + frames + ' frames, ' + fps + ' fps, ' + steps + ' steps';
  return {
    id: 'video-2025-' + id, label: 'Generate a video clip · ' + model, evidenceLabel: 'Benchmark',
    genericHint: output, categoryPath: ['Digital', 'AI', 'Video generation'],
    values: { energy: wh / 1000 },
    publishedComponentWh: { gpu, cpu, ram },
    videoConfiguration: { model, height, width, frames, fps, steps },
    note: output + '. RAM is estimated.',
    reasoning: '(' + gpu + ' GPU + ' + cpu + ' CPU + ' + ram + ' RAM) Wh ÷ 1,000 = ' + (wh / 1000) + ' kWh per clip.',
    sources: videoSources,
    defaultUsage: { amount: 1, times: 1, period: 'weekly', description: 'Assumes one clip each week at this model’s benchmark configuration.' }
  };
}

// Independent adapted result: Oviedo et al., Energy Use of AI Inference,
// Efficiency Pathways, and Test-Time Scaling (2026), arXiv:2509.20241v2,
// Table 1 and Methods. This long-reasoning subset is CC BY-SA 4.0.
// Changes: selected published median and IQR; Wh converted to kWh.
const reasoningSources = [
  { label: 'Oviedo et al. (2026) · version, authors and CC BY-SA 4.0 licence', url: 'https://arxiv.org/abs/2509.20241v2' },
  { label: 'Primary paper · Table 1 and Methods, pages 2–6', url: 'https://arxiv.org/pdf/2509.20241v2' },
  { label: 'Joule publication · DOI 10.1016/j.joule.2026.102430', url: 'https://doi.org/10.1016/j.joule.2026.102430' },
  { label: 'Adapted long-reasoning subset · CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' }
];
const longReasoning = {
  id: 'ai-long-reasoning', label: 'Long AI reasoning', category: 'Digital', energyScope: 'Server and facility overhead',
  unit: 'per modelled prompt-completion event', singular: 'query', plural: 'queries', defaultAmount: 1,
  sourceNote: 'Oviedo and coauthors model one prompt-completion event on batched FP8 H100 servers, including facility overhead. They assume 500 input tokens and a median of 5,000 output tokens for a long query. Throughput is held constant beyond 4,000 output tokens, which may underestimate energy for longer responses. Tool execution, orchestration, training and user devices are outside the model. The adapted record is available under CC BY-SA 4.0.',
  sources: reasoningSources,
  options: [{
    id: 'oviedo-2026-deepseek-r1-long', label: 'Long AI reasoning · DeepSeek-R1', evidenceLabel: 'Published model',
    genericHint: 'Simulated long query · 5,000 median output tokens',
    categoryPath: ['Digital', 'AI', 'Text tasks'], values: { energy: 0.0106 },
    publishedMedianWh: 10.6, publishedIqrWh: [4.29, 21.7],
    note: 'The middle half of simulated queries used 4.29–21.7 Wh.',
    reasoning: 'Published DeepSeek-R1 median 10.6 Wh/query ÷ 1,000 = 0.0106 kWh/query. The calculator uses this median for each query in the selected schedule.',
    sources: reasoningSources,
    defaultUsage: { amount: 1, times: 1, period: 'daily', description: 'Assumes one long query each day at the published model median.' }
  }]
};

export const aiTaskGroups = [
  longReasoning,
  ...taskBenchmarks.map(taskGroup),
  {
    id: 'ai-video-generation', label: 'AI video generation', category: 'Digital', energyScope: 'GPU, CPU and estimated RAM',
    unit: 'per clip at the specified configuration', singular: 'clip', plural: 'clips', defaultAmount: 1,
    sourceNote: videoScope, sources: videoSources, options: videoBenchmarks.map(videoOption)
  }
];

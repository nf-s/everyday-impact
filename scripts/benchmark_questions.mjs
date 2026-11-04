// Opt-in live benchmark. Credentials are read locally and never written to the report.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { generatePlan, shortlistQuestion, buildPlannerRequest, parsePlannerResponse } from '../lib/question-planner.js';

const args = process.argv.slice(2);
function argument(key, fallback) { const index = args.indexOf(key); return index < 0 ? fallback : args[index + 1]; }
const endpoint = argument('--endpoint', '');
const model = argument('--model', '@cf/ibm-granite/granite-4.0-h-micro');
const output = argument('--output', '/tmp/question-benchmark.json');
const only = argument('--only', '').split(',').filter(Boolean);
const casesPath = argument('--cases', 'scripts/question-benchmark-cases.json');
const definition = JSON.parse(readFileSync(casesPath, 'utf8'));
const definedCases = Array.isArray(definition) ? definition : JSON.parse(readFileSync(new URL(definition.base, new URL('../' + casesPath, import.meta.url)), 'utf8')).map(item => definition.overrides[item.id] ? { ...item, expected: definition.overrides[item.id] } : item);
const cases = definedCases.filter(item => !only.length || only.includes(item.id));
const limit = Number(argument('--limit', '24'));
if (!Number.isInteger(limit) || limit < 1 || limit > 24 || cases.length > limit) throw new Error('Use --only or a limit of 1–24; maximum 24 cases per run.');
if (!args.includes('--live')) throw new Error('Pass --live to authorize this bounded, metered benchmark.');
let bearer, account;
if (!endpoint) {
  account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!account || !/^[a-f0-9]{32}$/.test(account)) throw new Error('Set CLOUDFLARE_ACCOUNT_ID.');
  bearer = process.env.CLOUDFLARE_API_TOKEN || JSON.parse(execFileSync('./node_modules/.bin/wrangler', ['auth', 'token', '--json'], { encoding: 'utf8' })).token;
}
function digest(file) { return createHash('sha256').update(readFileSync(file)).digest('hex'); }
function assess(expected, actual, error) {
  if (expected.error) return error === expected.error ? [] : ['Expected error ' + expected.error + ', received ' + (error || 'a plan')];
  if (error) return ['Unexpected error: ' + error];
  const issues = [];
  if (actual?.choices?.length !== expected.choices.length) issues.push('Choice count ' + actual?.choices?.length + ' vs ' + expected.choices.length);
  expected.choices.forEach((choice, index) => {
    for (const [key, value] of Object.entries(choice)) if (typeof value === 'number' ? Math.abs((actual?.choices?.[index]?.[key] ?? Infinity) - value) > 1e-9 : actual?.choices?.[index]?.[key] !== value) issues.push('Choice ' + (index + 1) + ' ' + key + ': ' + JSON.stringify(actual?.choices?.[index]?.[key]) + ' vs ' + JSON.stringify(value));
  });
  if (JSON.stringify(actual?.horizon) !== JSON.stringify(expected.horizon)) issues.push('Horizon: ' + JSON.stringify(actual?.horizon) + ' vs ' + JSON.stringify(expected.horizon));
  return issues;
}
const report = { started: new Date().toISOString(), mode: endpoint ? 'endpoint' : 'real-workers-ai-local-planner', model: endpoint ? 'production-configured' : model, endpoint: endpoint || undefined, options: { noThinking: args.includes('--no-thinking'), forceInference: args.includes('--force-inference') }, sourceDigests: Object.fromEntries([casesPath, 'lib/question-planner.js', 'lib/question-schedule.js'].map(path => [path, digest(path)])), results: [] };
let calls = 0;
for (const item of cases) {
  const start = performance.now();
  let actual, error, message, raw, usage, status;
  try {
    if (endpoint) {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: item.question }), signal: AbortSignal.timeout(45000) });
      calls++; status = response.status; actual = await response.json();
      if (!response.ok) { message = actual.error; error = actual.code || (response.status === 429 ? 'quota' : 'http_' + response.status); }
    } else {
      const infer = async input => {
        if (args.includes('--no-thinking')) input = { ...input, messages: input.messages.map((message, index) => index === input.messages.length - 1 ? { ...message, content: message.content + '\n/no_think' } : message) };
        calls++;
        const response = await fetch('https://api.cloudflare.com/client/v4/accounts/' + account + '/ai/run/' + model, { method: 'POST', headers: { Authorization: 'Bearer ' + bearer, 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(45000) });
        status = response.status;
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error('Inference HTTP ' + response.status + ': ' + JSON.stringify(data.errors));
        const result = data.result;
        raw = result.choices?.[0]?.message?.content ?? result.response;
        usage = result.usage;
        return result;
      };
      if (args.includes('--force-inference')) { const shortlist = shortlistQuestion(item.question); actual = parsePlannerResponse(await infer(buildPlannerRequest(shortlist)), shortlist); }
      else actual = await generatePlan(item.question, infer);
    }
  } catch (failure) { error = failure.code || failure.name; message = failure.message; }
  const issues = assess(item.expected, actual, error);
  const result = { id: item.id, question: item.question, expected: item.expected, actual, error, message, status, raw, usage, durationMs: Math.round(performance.now() - start), pass: !issues.length, issues };
  report.results.push(result);
  report.calls = calls;
  report.passed = report.results.filter(result => result.pass).length;
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ id: item.id, pass: result.pass, issues, error, durationMs: result.durationMs }) + '\n');
}
report.finished = new Date().toISOString();
report.totals = { cases: cases.length, passed: report.passed, calls, promptTokens: report.results.reduce((sum, item) => sum + (item.usage?.prompt_tokens || 0), 0), completionTokens: report.results.reduce((sum, item) => sum + (item.usage?.completion_tokens || 0), 0), neurons: report.results.reduce((sum, item) => sum + (item.usage?.neurons || 0), 0) };
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
process.stdout.write(JSON.stringify(report.totals) + '\n');

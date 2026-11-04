import test from 'node:test';
import assert from 'node:assert/strict';
import { setupQuestionForm } from '../dist/question.js';

class Control {
  value = '';
  textContent = '';
  hidden = false;
  disabled = false;
  dataset = {};
  attributes = new Map();
  listeners = new Map();
  setAttribute(name, value) { this.attributes.set(name, value); }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  async emit(type) {
    await Promise.all((this.listeners.get(type) || []).map(callback => callback({ preventDefault() {} })));
  }
  focus() { this.focused = true; }
}

function fixture(fetch, onApply = () => {}, extra = {}) {
  const form = new Control();
  const controls = Object.fromEntries(['question-input', 'question-cancel', 'question-status', 'question-voice', 'question-voice-note', 'question-voice-status'].map(id => [id, new Control()]));
  const submit = new Control();
  form.querySelector = selector => selector === '[type="submit"]' ? submit : controls[selector.slice(1)];
  const document = { documentElement: { lang: 'en-AU' }, querySelector: () => form };
  const api = setupQuestionForm(onApply, { document, fetch, ...extra });
  return { form, submit, api, ...controls, input: controls['question-input'], status: controls['question-status'] };
}
const plan = { choices: [{ group: 'test', before: 'one', after: null, kind: 'footprint', amount: 1, times: 1, period: 'once' }] };
const ok = payload => ({ ok: true, json: async () => payload });
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

test('explicit submit sends only a validated question and preserves input', async () => {
  let calls = 0;
  const applied = [];
  const f = fixture(async (url, init) => {
    calls += 1;
    assert.equal(url, '/api/compare');
    assert.equal(init.method, 'POST');
    assert.deepEqual(JSON.parse(init.body), { question: 'Compare apples and beef' });
    return ok(plan);
  }, result => applied.push(result));
  await f.form.emit('submit');
  assert.equal(calls, 0);
  assert.equal(f.input.attributes.get('aria-invalid'), 'true');
  f.input.value = 'x'.repeat(501);
  await f.form.emit('submit');
  assert.equal(calls, 0);
  f.input.value = ' Compare apples and beef ';
  await f.form.emit('submit');
  assert.equal(calls, 1);
  assert.deepEqual(applied, [plan]);
  assert.equal(f.input.value, ' Compare apples and beef ');
  assert.equal(f.form.attributes.get('aria-busy'), 'false');
});

test('manual invalidation, typing, cancellation and newer submissions reject stale responses', async () => {
  for (const action of ['manual', 'typing', 'cancel', 'newer']) {
    const pending = deferred();
    const applied = [];
    let calls = 0;
    const f = fixture(() => ++calls === 1 ? pending.promise : Promise.resolve(ok(plan)), result => applied.push(result));
    f.input.value = 'First question';
    const first = f.form.emit('submit');
    assert.equal(f.submit.disabled, true);
    if (action === 'manual') f.api.invalidate();
    if (action === 'typing') { f.input.value = 'Changed question'; await f.input.emit('input'); }
    if (action === 'cancel') await f['question-cancel'].emit('click');
    if (action === 'newer') { f.input.value = 'Second question'; await f.form.emit('submit'); }
    pending.resolve(ok({ choices: [{ before: 'stale' }] }));
    await first;
    assert.equal(applied.length, action === 'newer' ? 1 : 0, action);
    assert.equal(f.submit.disabled, false);
    assert.equal(f.form.attributes.get('aria-busy'), 'false');
  }
});

test('HTTP failures, malformed JSON, invalid response and application rejection remain recoverable', async () => {
  const failures = [
    ...[400, 422, 429, 503, 500].map(status => async () => ({ ok: false, status })),
    async () => { throw new Error('Network unavailable.'); },
    async () => ({ ok: true, json: async () => { throw new Error('Invalid JSON.'); } }),
    async () => ok({ choices: [] }),
    async () => ok({ choices: Array.from({ length: 7 }, () => ({})) }),
    async () => ok({ choices: [null] }),
    async () => ok({ choices: [{}], horizon: 'invalid' })
  ];
  for (const fetch of failures) {
    let applied = false;
    const f = fixture(fetch, () => { applied = true; });
    f.input.value = 'A comparison';
    await f.form.emit('submit');
    assert.equal(applied, false);
    assert.equal(f.status.dataset.error, 'true');
    assert.match(f.status.textContent, /Your choices were kept/);
    assert.equal(f.submit.disabled, false);
    assert.equal(f.input.value, 'A comparison');
  }
  const f = fixture(async () => ok(plan), () => { throw new Error('Unknown catalogue entry.'); });
  f.input.value = 'A comparison';
  await f.form.emit('submit');
  assert.match(f.status.textContent, /Unknown catalogue entry/);
  assert.equal(f.submit.disabled, false);
});

test('per-tab cache copies applied plans and evicts beyond eight exact questions', async () => {
  let calls = 0;
  const seen = [];
  const f = fixture(async () => { calls += 1; return ok(plan); }, result => {
    seen.push(result.choices[0].amount);
    result.choices[0].amount = 900;
  });
  f.input.value = 'Same question';
  await f.form.emit('submit');
  await f.form.emit('submit');
  assert.equal(calls, 1);
  assert.deepEqual(seen, [1, 1]);
  for (let index = 0; index < 8; index += 1) {
    f.input.value = 'Question ' + index;
    await f.form.emit('submit');
  }
  f.input.value = 'Same question';
  await f.form.emit('submit');
  assert.equal(calls, 10);
});

test('voice is optional, appends editable final text once and never submits', async () => {
  let session;
  class Recognition {
    constructor() { session = this; }
    start() { this.onstart(); }
    stop() { this.onend(); }
    abort() { this.onend(); }
  }
  let requests = 0;
  const f = fixture(async () => { requests += 1; return ok(plan); }, () => {}, { SpeechRecognition: Recognition });
  f.input.value = 'Compare';
  await f['question-voice'].emit('click');
  assert.equal(f['question-voice'].attributes.get('aria-pressed'), 'true');
  const result = [{ transcript: 'apples and beef' }];
  result.isFinal = true;
  session.onresult({ resultIndex: 0, results: [result] });
  session.onresult({ resultIndex: 0, results: [result] });
  assert.equal(f.input.value, 'Compare apples and beef');
  assert.equal(requests, 0);
  f.input.value = 'Manually edited question';
  await f.form.emit('submit');
  assert.equal(requests, 1);
  assert.equal(f.input.value, 'Manually edited question');
  assert.equal(f['question-voice'].attributes.get('aria-pressed'), 'false');
  const unsupported = fixture(async () => ok(plan));
  assert.equal(unsupported['question-voice'].hidden, true);
});

test('a response body arriving after manual edits cannot apply', async () => {
  const body = deferred();
  let applied = false;
  const f = fixture(async () => ({ ok: true, json: () => body.promise }), () => { applied = true; });
  f.input.value = 'Compare something';
  const pending = f.form.emit('submit');
  await Promise.resolve();
  await Promise.resolve();
  f.api.invalidate();
  body.resolve(plan);
  await pending;
  assert.equal(applied, false);
});

test('timeout restores controls without applying a late body', async () => {
  let applied = false;
  const f = fixture((url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  }), () => { applied = true; }, { timeoutMs: 1 });
  f.input.value = 'Compare something';
  await f.form.emit('submit');
  assert.equal(applied, false);
  assert.match(f.status.textContent, /timed out/);
  assert.equal(f.submit.disabled, false);
});

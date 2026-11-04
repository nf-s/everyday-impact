import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { onRequest } from '../functions/api/compare.js';
import { reservationSQL } from '../lib/question-budget.js';

const origin = 'https://example.test';
function submit(question) {
  return new Request(origin + '/api/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
}

test('invalid and unmatched requests never reserve or run inference', async () => {
  for (const [request, status] of [
    [new Request(origin + '/api/compare'), 405],
    [new Request(origin, { method: 'POST', body: 'hello' }), 415],
    [submit('x'.repeat(501)), 400],
    [new Request(origin, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: ' '.repeat(5000) }), 413],
    [submit('xyzzyplugh'), 422]
  ]) {
    const response = await onRequest({ request, env: {} });
    assert.equal(response.status, status);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  const crossOrigin = submit('beef');
  crossOrigin.headers.set('Origin', 'https://other.test');
  assert.equal((await onRequest({ request: crossOrigin, env: {} })).status, 403);
});

test('inference fails closed at the budget limit and when storage is unavailable', async () => {
  const env = { USAGE: { prepare: () => ({ bind: () => ({ run: async () => ({ meta: { changes: 0 } }) }) }) } };
  assert.equal((await onRequest({ request: submit('fish fingers'), env })).status, 429);
  assert.equal((await onRequest({ request: submit('fish fingers'), env: {} })).status, 503);
});

test('the shared budget counts at most 12 attempts per minute and 200 per UTC day', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(readFileSync(new URL('../migrations/0001_question_budget.sql', import.meta.url), 'utf8'));
    const update = db.prepare(reservationSQL);
    const reserve = (day, minute) => Number(update.run({ 1: day, 2: minute }).changes);
    for (let i = 0; i < 12; i++) assert.equal(reserve(100, 144000), 1);
    assert.equal(reserve(100, 144000), 0);
    for (let i = 0; i < 188; i++) assert.equal(reserve(100, 144001 + i), 1);
    assert.equal(reserve(100, 145001), 0);
    assert.equal(reserve(101, 145440), 1);
    assert.equal(reserve(100, 145439), 0);
    assert.equal(db.prepare('SELECT count(*) AS n FROM question_budget').get().n, 1);
  } finally {
    db.close();
  }
});


test('deterministic references do not reserve inference, while ambiguous rows reserve exactly one call', async () => {
  const fast = await onRequest({ request: submit('compare AI with fish'), env: {} });
  assert.equal(fast.status, 200);
  const fastBody = await fast.json();
  assert.deepEqual(fastBody.choices.map(choice => choice.before), ['gemini-text-2025', 'fish-portion']);
  assert.ok(fastBody.assumptions.every(text => typeof text === 'string' && text.length <= 220));
  let reserved = 0, inferred = 0;
  const env = {
    USAGE: { prepare: () => ({ bind: () => ({ run: async () => { reserved++; return { meta: { changes: 1 } }; } }) }) },
    AI: { run: async (model, input) => { inferred++; return { response: { A: input.response_format.json_schema.properties.A.enum[0] } }; } }
  };
  const ambiguous = await onRequest({ request: submit('fish fingers'), env });
  assert.equal(ambiguous.status, 200);
  assert.equal(reserved, 1);
  assert.equal(inferred, 1);
});

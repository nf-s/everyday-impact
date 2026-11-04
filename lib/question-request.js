const jsonHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function reply(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: { ...jsonHeaders, ...headers } });
}

export async function readQuestion(request) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) throw new RequestError(403, 'Submit questions from the calculator.');
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new RequestError(415, 'Send the question as JSON.');
  }
  // Enforce a byte limit even when a caller streams a body without Content-Length.
  const maxBytes = 4096;
  if (Number(request.headers.get('Content-Length')) > maxBytes) throw new RequestError(413, 'The question is too long.');
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'Enter a question.');
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new RequestError(413, 'The question is too long.');
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
  let body;
  try { body = JSON.parse(text + decoder.decode()); }
  catch { throw new RequestError(400, 'Enter a question as JSON.'); }
  if (typeof body?.question !== 'string' || Object.keys(body).length !== 1) throw new RequestError(400, 'Send one question.');
  const question = body.question.trim();
  if (!question || question.length > 500) throw new RequestError(400, 'Enter a question of up to 500 characters.');
  return question;
}

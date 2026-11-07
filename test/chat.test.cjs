const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/chat');
const originalFetch = global.fetch;
const originalKey = process.env.GEMINI_API_KEY;
afterEach(() => {
  global.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
});
async function request(body, method = 'POST') {
  const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await handler({ method, body }, res);
  return res;
}
test('rejects unsupported methods', async () => {
  assert.equal((await request(undefined, 'GET')).code, 405);
});
test('rejects invalid message histories before contacting the provider', async () => {
  global.fetch = () => { throw new Error('Unexpected provider request'); };
  for (const messages of [undefined, [], [null], [{ role: 'system', text: 'hello' }], [{ role: 'user', text: 1 }], [{ role: 'user', text: ' ' }], [{ role: 'user', text: 'x'.repeat(2001) }], [{ role: 'assistant', text: 'hello' }], Array.from({ length: 21 }, () => ({ role: 'user', text: 'hello' }))]) {
    assert.equal((await request({ messages })).code, 400);
  }
  assert.equal((await request(undefined)).code, 400);
});
test('reports missing configuration without exposing variable details', async () => {
  delete process.env.GEMINI_API_KEY;
  const res = await request({ messages: [{ role: 'user', text: 'Projects?' }] });
  assert.equal(res.code, 503);
  assert.doesNotMatch(JSON.stringify(res.body), /GEMINI_API_KEY/);
});
test('maps conversation roles and sends credentials in a header', async () => {
  process.env.GEMINI_API_KEY = 'test-only-placeholder';
  global.fetch = async (url, options) => {
    assert.ok(!url.includes('key='));
    assert.equal(options.headers['x-goog-api-key'], 'test-only-placeholder');
    assert.ok(options.signal instanceof AbortSignal);
    assert.deepEqual(JSON.parse(options.body).contents.map(m => m.role), ['user', 'model', 'user']);
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'Portfolio reply' }] } }] }) };
  };
  const res = await request({ messages: [{ role: 'user', text: 'Hi' }, { role: 'assistant', text: 'Hello' }, { role: 'user', text: 'Projects?' }] });
  assert.equal(res.code, 200);
  assert.equal(res.body.reply, 'Portfolio reply');
});
test('handles provider failures without exposing upstream content', async () => {
  process.env.GEMINI_API_KEY = 'test-only-placeholder';
  global.fetch = async () => ({ ok: false, status: 429 });
  const res = await request({ messages: [{ role: 'user', text: 'Projects?' }] });
  assert.equal(res.code, 502);
  assert.deepEqual(res.body, { error: 'Failed to generate response.' });
});

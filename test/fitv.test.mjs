// Runs the skill's script against a local mock of the API (real response shapes; no network). `node --test test/`
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';

const SCRIPT = new URL('../skills/free-image-to-video/scripts/fitv.mjs', import.meta.url).pathname;
const seen = [];
let replies = {};
const server = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c)).on('end', () => {
    seen.push({ path: req.url, auth: req.headers.authorization, body: JSON.parse(body || '{}') });
    const [status, json] = (replies[req.url] || []).shift() ?? [404, {}];
    res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(json));
  });
});
await new Promise((r) => server.listen(0, r));
test.after(() => server.close());
const base = `http://127.0.0.1:${server.address().port}`;

const run = (...args) =>
  new Promise((resolve) =>
    execFile(process.execPath, [SCRIPT, ...args], { env: { ...process.env, FREEIMAGETOVIDEO_API_KEY: 'sk-test', FREEIMAGETOVIDEO_BASE_URL: base } },
      (err, stdout) => resolve({ code: err ? err.code : 0, json: JSON.parse(stdout) }))
  );

test('submit image to video sends the documented body', async () => {
  seen.length = 0;
  replies = { '/api/ai/generate': [[200, { code: 0, message: 'ok', data: { id: 't1', status: 'pending' } }]] };
  const r = await run('submit', 'the camera orbits', '--image', 'https://x/y.jpg', '--duration', '6', '--aspect', '9:16');
  assert.equal(r.code, 0);
  assert.equal(r.json.id, 't1');
  assert.equal(seen[0].auth, 'Bearer sk-test');
  assert.deepEqual(seen[0].body, {
    provider: 'auto', mediaType: 'video', model: 'minimax-h3', scene: 'image-to-video', prompt: 'the camera orbits',
    options: { sound: true, duration: 6, aspect_ratio: '9:16', image_input: ['https://x/y.jpg'] },
  });
});

test('HTTP 200 with a non-zero code is a refusal, classified', async () => {
  for (const [json, kind] of [
    [{ code: -1, message: 'API runs need a paid plan', data: { reason: 'plan_required' } }, 'plan'],
    [{ code: -1, message: 'Not enough credits', data: { reason: 'insufficient_credits' } }, 'quota'],
    [{ code: -1, message: 'Too many runs', data: { reason: 'concurrency' } }, 'busy'],
    [{ code: -2, message: 'Prompt refused' }, 'rejected'],
    [{ code: -1, message: 'no auth' }, 'auth'],
  ]) {
    replies = { '/api/ai/generate': [[200, json]] };
    const r = await run('submit', 'x');
    assert.equal(r.code, 1);
    assert.equal(r.json.error, kind);
  }
});

test('status and credits', async () => {
  replies = {
    '/api/ai/query': [[200, { code: 0, data: { id: 't1', status: 'success', videos: ['https://cdn/v.mp4'] } }], [200, { code: 0, data: { id: 't1', status: 'failed', errorMessage: 'provider error' } }]],
    '/api/user/get-user-credits': [[200, { code: 0, data: { remainingCredits: 42 } }]],
  };
  assert.equal((await run('status', 't1')).json.video, 'https://cdn/v.mp4');
  const failed = await run('wait', 't1');
  assert.equal(failed.code, 1);
  assert.equal(failed.json.error, 'generation');
  assert.equal((await run('credits')).json.remainingCredits, 42);
});

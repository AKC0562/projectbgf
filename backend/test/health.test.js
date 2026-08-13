import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../src/app.js';

test('reports liveness without requiring external services', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/v1/health/live`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { success: true, status: 'live' });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

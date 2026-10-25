import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/index';

describe('health and errors', () => {
  it('answers liveness and readiness', async () => {
    expect((await request(app).get('/health/')).status).toBe(200);
    const ready = await request(app).get('/health/ready');
    expect(ready.status).toBe(200);
    expect(ready.body.database).toBe('ok');
  });
  it('returns a structured 404 with a request id', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('not_found');
    expect(res.headers['x-request-id']).toBeTruthy();
  });
  it('rejects malformed JSON with 400', async () => {
    const res = await request(app).post('/api/auth/login/').set('Content-Type', 'application/json').send('{not json');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('bad_json');
  });
});

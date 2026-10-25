import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../src/index';
import { createTestUser, resetDatabase, tokenFor } from './setup';

describe('auth', () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it('registers and returns a token', async () => {
    const res = await request(app).post('/api/auth/register/').send({ username: 'newuser', email: 'new@example.com', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });
  it('logs in with the right password and refuses the wrong one', async () => {
    const { user, password } = await createTestUser();
    const ok = await request(app).post('/api/auth/login/').send({ username: user.username, password });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();
    const bad = await request(app).post('/api/auth/login/').send({ username: user.username, password: 'wrong' });
    expect(bad.status).toBe(401);
  });
  it('guards the profile', async () => {
    const { user } = await createTestUser();
    expect((await request(app).get('/api/auth/profile/')).status).toBe(401);
    const res = await request(app).get('/api/auth/profile/').set('Authorization', `Bearer ${tokenFor(user.id)}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
  });
  it('refuses a weak password', async () => {
    const res = await request(app).post('/api/auth/register/').send({ username: 'weak', email: 'weak@example.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('validation_error');
  });
  it('rotates the refresh token and revokes it on logout', async () => {
    const reg = await request(app).post('/api/auth/register/').send({ username: 'rot', email: 'rot@example.com', password: 'secret123' });
    const first = reg.body.refreshToken as string;
    expect(first).toBeTruthy();
    const turned = await request(app).post('/api/auth/refresh/').send({ refreshToken: first });
    expect(turned.status).toBe(200);
    expect(turned.body.token).toBeTruthy();
    expect((await request(app).post('/api/auth/refresh/').send({ refreshToken: first })).status).toBe(401);
    const second = turned.body.refreshToken as string;
    const auth = `Bearer ${turned.body.token}`;
    expect((await request(app).post('/api/auth/logout/').set('Authorization', auth).send({ refreshToken: second })).status).toBe(200);
    expect((await request(app).post('/api/auth/refresh/').send({ refreshToken: second })).status).toBe(401);
  });
});

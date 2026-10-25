import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// Google itself is faked; every check of the flow (the state, the cookie, a verified email, the one-use handoff, an
// existing account losing its password and sessions) runs as built.
const google = vi.hoisted(() => ({ claims: {} as Record<string, unknown> }));
vi.mock('google-auth-library', () => {
  class OAuth2Client {
    async generateCodeVerifierAsync() { return { codeVerifier: 'test-verifier', codeChallenge: 'test-challenge' }; }
    generateAuthUrl(opts: { state?: string }) { return 'https://accounts.google.com/o/oauth2/v2/auth?state=' + (opts.state || ''); }
    async getToken() { return { tokens: { id_token: 'test-id-token' } }; }
    async verifyIdToken() { return { getPayload: () => google.claims }; }
  }
  return { OAuth2Client, CodeChallengeMethod: { S256: 'S256' } };
});

import app from '../src/index';
import { createTestUser, prisma, resetDatabase } from './setup';

function cookieOf(res: request.Response): string {
  const raw = res.headers['set-cookie'] as unknown as string[] | string | undefined;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.map((c) => c.split(';')[0]).join('; ');
}

function fragment(res: request.Response): URLSearchParams {
  return new URLSearchParams(String(res.headers.location || '').split('#')[1] || '');
}

async function signIn(forgedState?: string) {
  const start = await request(app).get('/api/auth/google/');
  const state = forgedState ?? (new URL(start.headers.location).searchParams.get('state') || '');
  return request(app).get(`/api/auth/google/callback/?code=test-code&state=${state}`).set('Cookie', cookieOf(start));
}

const refresh = (refreshToken: unknown) => request(app).post('/api/auth/refresh/').send({ refreshToken });

describe('Google sign-in', () => {
  beforeEach(async () => {
    await resetDatabase();
    google.claims = { sub: 'google-1', email: 'new@example.com', email_verified: true, given_name: 'New', family_name: 'User' };
  });

  it('sends the browser to Google with a state kept in a short httpOnly cookie', async () => {
    const res = await request(app).get('/api/auth/google/');
    expect(res.status).toBe(302);
    expect(new URL(res.headers.location).searchParams.get('state')).toBeTruthy();
    expect(String(res.headers['set-cookie'])).toContain('HttpOnly');
  });

  it('creates the user and hands over a token the refresh route accepts once', async () => {
    const rt = fragment(await signIn()).get('rt');
    expect(rt).toBeTruthy();
    expect((await refresh(rt)).status).toBe(200);
    expect((await refresh(rt)).status).toBe(401);
    const user = await prisma.user.findFirst({ where: { email: 'new@example.com' } });
    expect(user?.googleId).toBe('google-1');
  });

  it('refuses a state that does not match the cookie', async () => {
    expect(fragment(await signIn('forged-state')).get('error')).toBe('state');
    expect(await prisma.user.count()).toBe(0);
  });

  it('refuses a callback without the cookie', async () => {
    const res = await request(app).get('/api/auth/google/callback/?code=test-code&state=anything');
    expect(fragment(res).get('error')).toBe('expired');
  });

  it('refuses a Google account whose email is not verified', async () => {
    google.claims = { ...google.claims, email_verified: false };
    expect(fragment(await signIn()).get('error')).toBe('unverified');
    expect(await prisma.user.count()).toBe(0);
  });

  it('linking an existing password account replaces its password and ends its sessions', async () => {
    const { password } = await createTestUser({ username: 'owner', email: 'new@example.com' });
    const before = await request(app).post('/api/auth/login/').send({ username: 'owner', password });
    expect(before.status).toBe(200);
    expect(fragment(await signIn()).get('rt')).toBeTruthy();
    expect((await request(app).post('/api/auth/login/').send({ username: 'owner', password })).status).toBe(401);
    expect((await refresh(before.body.refreshToken)).status).toBe(401);
  });
});

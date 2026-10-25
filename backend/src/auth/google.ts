import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import prisma from '../database';
import { config } from '../config';
import { logger } from '../lib/logger';
import { CodeChallengeMethod, googleClient, googleConfigured } from '../lib/google';
import { hashToken } from '../routes/auth';

// Scaffold-owned: Google sign-in (OpenID Connect, the authorization code flow with PKCE). The start route keeps the
// state and the PKCE verifier in a short signed httpOnly cookie; the callback checks the state, swaps the code with
// the client secret, verifies the id token (signature, audience, issuer, expiry) and accepts only a verified email.
// The browser gets a one-use refresh token valid for two minutes after '#', which no server or log sees; the page
// /auth/google/done swaps it for a normal session through POST /api/auth/refresh/.
const router = Router();
const COOKIE = 'google_oauth';
const COOKIE_PATH = '/api/auth/google';
const COOKIE_TTL_S = 600;
const HANDOFF_MS = 2 * 60 * 1000;

type Saved = { state: string; codeVerifier: string };

// The cookie is signed with its own key, so it can never pass as an access token.
function cookieSecret(): string {
  return config.jwtSecret + ':google-oauth';
}

function frontendBase(): string {
  return (config.frontendUrl || config.publicUrl).replace(/[/]+$/, '');
}

function readCookie(req: Request, name: string): string {
  for (const part of (req.headers.cookie || '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

function sameText(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

async function freeUsername(email: string): Promise<string> {
  const base = (email.split('@')[0] || '').replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 30) || 'user';
  for (let n = 1; n <= 50; n++) {
    const name = n === 1 ? base : base + n;
    if (!(await prisma.user.findFirst({ where: { username: name } }))) return name;
  }
  return base + '-' + randomBytes(4).toString('hex');
}

// The account for a Google identity: the one already linked to it; else the one with its verified email, linked now;
// else a new one. Sign-up never verified an email, so whoever set the password of the account found by email may not
// own the address: linking replaces that password and ends every session. An email linked to another Google account
// is refused (null).
async function googleUser(sub: string, email: string, firstName: string, lastName: string) {
  const linked = await prisma.user.findUnique({ where: { googleId: sub } });
  if (linked) return linked;
  const password = await bcrypt.hash(randomBytes(32).toString('base64url'), 10);
  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    if (existing.googleId) return null;
    await prisma.refreshToken.updateMany({ where: { userId: existing.id, revokedAt: null }, data: { revokedAt: new Date() } });
    return prisma.user.update({ where: { id: existing.id }, data: { googleId: sub, password } });
  }
  const username = await freeUsername(email);
  return prisma.user.create({ data: { username, email, password, googleId: sub, firstName, lastName } });
}

// GET /api/auth/google/status/: whether Google sign-in is set up (the button reads it).
router.get('/status/', (_req: Request, res: Response) => {
  res.json({ configured: googleConfigured() });
});

// GET /api/auth/google/: send the browser to Google.
router.get('/', async (_req: Request, res: Response) => {
  if (!googleConfigured()) {
    return res.status(503).json({ error: 'Google sign-in is not set up', code: 'google_not_configured' });
  }
  const client = googleClient();
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
  const saved: Saved = { state: randomBytes(24).toString('base64url'), codeVerifier };
  res.cookie(COOKIE, jwt.sign(saved, cookieSecret(), { expiresIn: COOKIE_TTL_S }), {
    httpOnly: true, secure: config.isProduction, sameSite: 'lax', maxAge: COOKIE_TTL_S * 1000, path: COOKIE_PATH,
  });
  res.redirect(302, client.generateAuthUrl({
    access_type: 'online', scope: ['openid', 'email', 'profile'], prompt: 'select_account', state: saved.state,
    code_challenge_method: CodeChallengeMethod.S256, code_challenge: codeChallenge,
  }));
});

// GET /api/auth/google/callback/: Google sends the browser back here with a code.
router.get('/callback/', async (req: Request, res: Response) => {
  const finish = (fragment: string) => {
    res.clearCookie(COOKIE, { path: COOKIE_PATH });
    res.redirect(302, frontendBase() + '/auth/google/done#' + fragment);
  };
  if (!googleConfigured()) return finish('error=not_configured');
  if (typeof req.query.error === 'string') return finish('error=denied');
  let saved: Saved;
  try {
    saved = jwt.verify(readCookie(req, COOKIE), cookieSecret()) as unknown as Saved;
  } catch {
    return finish('error=expired');
  }
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  if (!state || !code || !sameText(state, String(saved.state || ''))) return finish('error=state');
  try {
    const client = googleClient();
    const { tokens } = await client.getToken({ code, codeVerifier: saved.codeVerifier });
    if (!tokens.id_token) return finish('error=google');
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: config.googleClientId });
    const claims = ticket.getPayload();
    if (!claims || !claims.sub || !claims.email || claims.email_verified !== true) return finish('error=unverified');
    const user = await googleUser(claims.sub, claims.email, claims.given_name || '', claims.family_name || '');
    if (!user) return finish('error=conflict');
    const handoff = randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + HANDOFF_MS);
    await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: hashToken(handoff), expiresAt } });
    logger.info({ userId: user.id }, 'google sign-in');
    return finish('rt=' + encodeURIComponent(handoff));
  } catch (error) {
    logger.warn({ reason: error instanceof Error ? error.name : 'unknown' }, 'google sign-in failed');
    return finish('error=google');
  }
});

export default router;

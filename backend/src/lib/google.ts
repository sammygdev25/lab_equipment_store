import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

export { CodeChallengeMethod } from 'google-auth-library';

// Scaffold-owned: the only file that builds a Google client. The client id and secret come from the environment
// (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) and the redirect address from PUBLIC_URL, never from the request.
export const GOOGLE_CALLBACK_PATH = '/api/auth/google/callback/';

export function googleConfigured(): boolean {
  return Boolean(config.googleClientId && config.googleClientSecret && config.publicUrl);
}

export function googleClient(): OAuth2Client {
  return new OAuth2Client({
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret,
    redirectUri: config.publicUrl.replace(/[/]+$/, '') + GOOGLE_CALLBACK_PATH,
  });
}

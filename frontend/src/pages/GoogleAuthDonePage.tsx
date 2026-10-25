import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const REASONS: Record<string, string> = {
  denied: 'Google sign-in was cancelled.',
  expired: 'The sign-in took too long. Please try again.',
  state: 'The sign-in could not be confirmed. Please try again.',
  unverified: 'Your Google account has no verified email.',
  conflict: 'This email is already linked to another Google account.',
  not_configured: 'Google sign-in is not set up for this app yet.',
  google: 'Google sign-in failed. Please try again.',
};

// Scaffold-owned: the end of Google sign-in. The backend puts a one-use token, valid for two minutes, after '#', which
// no server receives; it is cleared from the address at once and swapped for a normal session by the refresh route.
// deep_links.py moves a plain /auth/google/done into the hash route first, so the token follows the last '#'.
export default function GoogleAuthDonePage() {
  const [error, setError] = useState('');
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const raw = window.location.hash;
    const params = new URLSearchParams(raw.slice(raw.lastIndexOf('#') + 1));
    window.history.replaceState(null, '', window.location.pathname + '#/auth/google/done');
    const rt = params.get('rt');
    if (!rt) {
      setError(REASONS[params.get('error') || ''] || REASONS.google);
      return;
    }
    fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('refresh refused');
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        window.location.replace('/');
      })
      .catch(() => setError(REASONS.expired));
  }, []);
  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '2rem', textAlign: 'center' }}>
      {error ? (
        <>
          <p style={{ color: 'var(--color-error, #ef4444)', marginBottom: '1rem' }}>{error}</p>
          <Link to="/login" style={{ color: 'var(--color-primary)' }}>Back to sign in</Link>
        </>
      ) : (
        <p style={{ color: 'var(--color-text-secondary)' }}>Signing you in...</p>
      )}
    </div>
  );
}

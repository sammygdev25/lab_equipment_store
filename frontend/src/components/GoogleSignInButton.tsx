import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Scaffold-owned: a full-page visit to the backend, which sends the browser on to Google (backend/src/auth/google.ts).
export default function GoogleSignInButton() {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => {
    fetch(`${API_BASE}/auth/google/status/`)
      .then((res) => (res.ok ? res.json() : { configured: false }))
      .then((data) => setReady(Boolean(data.configured)))
      .catch(() => setReady(false));
  }, []);
  return (
    <div style={{ marginTop: '1rem' }}>
      <button type="button" disabled={!ready} onClick={() => { window.location.href = `${API_BASE}/auth/google/`; }}
        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)',
          background: 'var(--color-surface)', color: 'var(--color-text)', fontWeight: 600, cursor: ready ? 'pointer' : 'not-allowed' }}>
        Sign in with Google
      </button>
      {ready === false && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Google sign-in is not set up for this app yet.
        </p>
      )}
    </div>
  );
}

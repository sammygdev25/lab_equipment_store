import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>Login</h1>
      {error && <div style={{ color: 'var(--color-error, #ef4444)', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Username or Email</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
        </div>
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <GoogleSignInButton />
      <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        {"Don't have an account? "}<Link to="/register" style={{ color: 'var(--color-primary)' }}>Register</Link>
      </p>
    </div>
  );
}

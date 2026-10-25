import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>Register</h1>
      {error && <div style={{ color: 'var(--color-error, #ef4444)', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Username</label>
          <input type="text" value={form.username} onChange={update('username')} required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Email</label>
          <input type="email" value={form.email} onChange={update('email')} required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Password</label>
          <input type="password" value={form.password} onChange={update('password')} required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
        </div>
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login</Link>
      </p>
    </div>
  );
}

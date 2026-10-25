import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>Profile</h1>
      <div style={{ background: 'var(--color-surface)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--color-border)' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Username</p>
        <p style={{ color: 'var(--color-text)', marginBottom: '1rem', fontWeight: 600 }}>{user.username}</p>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Email</p>
        <p style={{ color: 'var(--color-text)', marginBottom: '1.5rem', fontWeight: 600 }}>{user.email}</p>
        <button onClick={handleLogout}
          style={{ padding: '0.75rem 2rem', borderRadius: '8px', background: 'var(--color-error, #ef4444)', color: 'white', border: 'none', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </div>
  );
}

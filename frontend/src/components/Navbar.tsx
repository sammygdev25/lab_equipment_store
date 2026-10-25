import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { path: '/', label: 'Home', auth: false },
  { path: '/categories', label: 'Categories', auth: false },
  { path: '/cart', label: 'Cart', auth: true },
  { path: '/orders', label: 'Order History', auth: true },
  { path: '/staff/inventory', label: 'Inventory Management', auth: true },
  { path: '/staff/login', label: 'Staff Login' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: '0 var(--space-lg)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '60px',
      }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 'var(--text-lg)', whiteSpace: 'nowrap',
          color: 'var(--color-primary)', textDecoration: 'none' }}>
          Lab Equipment Store
        </Link>
        <div className="ds-nav-links">
          {NAV_LINKS.filter(link => !link.auth || isAuthenticated).map(link => (
            <Link key={link.path} to={link.path} style={{
              padding: '6px 12px', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', fontWeight: 500, whiteSpace: 'nowrap',
              color: location.pathname === link.path ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              background: location.pathname === link.path ? 'var(--color-primary-light)' : 'transparent',
              textDecoration: 'none', transition: 'all var(--transition-fast)',
            }}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ds-nav-actions">
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                {user?.username || user?.email || 'Account'}
              </span>
              <button className="btn btn-secondary" onClick={handleLogout}
                style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary"
                style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary"
                style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
        <button type="button" className="ds-nav-toggle" aria-label="Menu" aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(open => !open)}>
          {mobileOpen ? '\u2715' : '\u2630'}
        </button>
      </div>
      <div className={'ds-nav-mobile' + (mobileOpen ? ' open' : '')} style={{ padding: '0 var(--space-lg)' }}>
        {NAV_LINKS.filter(link => !link.auth || isAuthenticated).map(link => (
          <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} style={{
            padding: '10px 4px', fontSize: 'var(--text-base)', fontWeight: 500, textDecoration: 'none',
            color: location.pathname === link.path ? 'var(--color-primary)' : 'var(--color-text)',
          }}>
            {link.label}
          </Link>
        ))}
        {isAuthenticated ? (
          <button className="btn btn-secondary" onClick={handleLogout}>Sign Out</button>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary" onClick={() => setMobileOpen(false)}>Sign In</Link>
            <Link to="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

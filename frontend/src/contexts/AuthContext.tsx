import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  password_hash: string | null;
  name: string | null;
  role: string;
  google_id: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function refreshSession(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.token as string;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      if (res.ok) {
        setUser(await res.json());
        setLoading(false);
        return;
      }
      if (res.status === 401) {
        const fresh = await refreshSession();
        if (fresh) {
          setToken(fresh); // the effect fetches the profile again with the new token
          return;
        }
      }
    } catch {
      // the session is cleared below
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (regData: RegisterData) => {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const current = localStorage.getItem('token');
    if (current) {
      fetch(`${API_BASE}/auth/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${current}` },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;

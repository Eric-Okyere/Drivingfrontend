'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, licenseClassGoal: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  error: string | null;
  setError: (e: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ds_token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('ds_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // One-time session check on mount, restoring the user from a saved token.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      localStorage.setItem('ds_token', data.token);
      setUser(data.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
      throw err;
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, licenseClassGoal: string) => {
      setError(null);
      try {
        const data = await api.post<{ token: string; user: User }>('/auth/register', {
          name,
          email,
          password,
          licenseClassGoal,
        });
        localStorage.setItem('ds_token', data.token);
        setUser(data.user);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Registration failed');
        throw err;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('ds_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

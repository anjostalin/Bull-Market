import React, { createContext, useContext, useState } from 'react';
import type { AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'TRADER' | 'VIEWER';
}

interface AuthContextShape {
  user: AuthUser | null;
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextShape>({} as AuthContextShape);

function loadStoredUser(): AuthUser | null {
  const stored = localStorage.getItem('sts_user');
  if (!stored) return null;
  try { return JSON.parse(stored) as AuthUser; } catch { return null; }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize synchronously from localStorage so a direct navigation or hard refresh
  // to a protected route does not bounce to /login before an effect runs.
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  const login = async (email: string, password: string, totpCode?: string) => {
    const { data } = await authApi.login(email, password, totpCode);
    persist(data);
  };

  const persist = (data: AuthResponse) => {
    localStorage.setItem('sts_token', data.token);
    const u: AuthUser = {
      userId: data.userId, fullName: data.fullName, email: data.email, role: data.role,
    };
    localStorage.setItem('sts_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('sts_token');
    localStorage.removeItem('sts_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

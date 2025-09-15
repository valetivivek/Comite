// Copyright © 2025 Vishnu Vivek Valeti. All rights reserved.
// Licensed under ComiTe Proprietary License 1.0. See LICENSE.txt.
// Fixed TypeScript build errors - removed unused roleMap state

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type AuthRole = 'owner' | 'admin' | 'editor' | 'moderator' | 'user' | 'banned';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role: AuthRole;
  status?: 'active' | 'banned';
  createdAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const OWNER_EMAIL = 'ultimategamervivek@gmail.com';

  useEffect(() => {
    // Seed role map with single owner if empty
    try {
      const storedMap = localStorage.getItem('comite-role-map');
      if (storedMap) {
        const parsed = JSON.parse(storedMap) as Record<string, AuthRole>;
        if (!parsed[OWNER_EMAIL] || parsed[OWNER_EMAIL] !== 'owner') {
          parsed[OWNER_EMAIL] = 'owner';
          localStorage.setItem('comite-role-map', JSON.stringify(parsed));
        }
      } else {
        const initial: Record<string, AuthRole> = { [OWNER_EMAIL]: 'owner' };
        localStorage.setItem('comite-role-map', JSON.stringify(initial));
      }
    } catch {}

    // Hydrate user and compute role strictly from roleMap
    try {
      const stored = localStorage.getItem('manga-reader-user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const email: string = parsed.email || '';
        const mappedRole: AuthRole = (JSON.parse(localStorage.getItem('comite-role-map') || '{}') as Record<string, AuthRole>)[email] || 'user';
        const role: AuthRole = email === OWNER_EMAIL ? 'owner' : mappedRole;
        setUser({
          id: parsed.id || 'user-unknown',
          email: parsed.email || '',
          username: parsed.username,
          name: parsed.name,
          role,
          status: parsed.status || 'active',
          createdAt: parsed.createdAt,
        });
      }
    } catch {}
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'owner',
    isOwner: user?.role === 'owner',
    login: (u: AuthUser) => {
      // Compute role strictly from role map and owner email
      try {
        const storedMap = localStorage.getItem('comite-role-map');
        const map: Record<string, AuthRole> = storedMap
          ? (JSON.parse(storedMap) as Record<string, AuthRole>)
          : { [OWNER_EMAIL]: 'owner' };
        const effectiveRole: AuthRole = u.email === OWNER_EMAIL ? 'owner' : (map[u.email] ?? 'user');
        const merged = { ...u, role: effectiveRole };
        setUser(merged);
        const existing = localStorage.getItem('manga-reader-user');
        const parsed = existing ? JSON.parse(existing) : {};
        localStorage.setItem('manga-reader-user', JSON.stringify({ ...parsed, ...merged }));
      } catch {
        setUser({ ...u, role: u.email === OWNER_EMAIL ? 'owner' : 'user' });
      }
    },
    logout: () => {
      setUser(null);
      try {
        localStorage.removeItem('manga-reader-user');
      } catch {}
    }
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};



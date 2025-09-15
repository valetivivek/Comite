// Copyright © 2025 Vishnu Vivek Valeti. All rights reserved.
// Licensed under ComiTe Proprietary License 1.0. See LICENSE.txt.

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type AuthRole = 'user' | 'admin';

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
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const OWNER_EMAIL = 'ultimategamervivek@gmail.com';

  useEffect(() => {
    // Seed admin allowlist with owner if empty
    try {
      const storedAdmins = localStorage.getItem('comite-admin-emails');
      if (storedAdmins) {
        const parsed = JSON.parse(storedAdmins);
        setAdminEmails(parsed);
      } else {
        localStorage.setItem('comite-admin-emails', JSON.stringify([OWNER_EMAIL]));
        setAdminEmails([OWNER_EMAIL]);
      }
    } catch {}

    try {
      const stored = localStorage.getItem('manga-reader-user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const email: string = parsed.email || '';
        const isAdminEmail = (adminEmails.length ? adminEmails : [OWNER_EMAIL]).includes(email);
        const role: AuthRole = isAdminEmail || parsed.role === 'admin' ? 'admin' : 'user';
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
  }, [adminEmails.length]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOwner: !!user && user.email === 'ultimategamervivek@gmail.com',
    login: (u: AuthUser) => {
      // Ensure role alignment with allowlist
      try {
        const storedAdmins = localStorage.getItem('comite-admin-emails');
        const list = storedAdmins ? (JSON.parse(storedAdmins) as string[]) : [OWNER_EMAIL];
        const effectiveRole: AuthRole = list.includes(u.email) ? 'admin' : u.role;
        const merged = { ...u, role: effectiveRole };
        setUser(merged);
        const existing = localStorage.getItem('manga-reader-user');
        const parsed = existing ? JSON.parse(existing) : {};
        localStorage.setItem('manga-reader-user', JSON.stringify({ ...parsed, ...merged }));
      } catch {
        setUser(u);
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



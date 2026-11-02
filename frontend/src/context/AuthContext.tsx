import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, onUnauthorized, tokenStore } from '../services/api';
import { CurrentUser } from '../types';

interface AuthState {
  user: CurrentUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  acceptTerms: () => Promise<void>;
  can: (permission: string) => boolean;
  canActOnBureau: (bureauId?: string | null) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  useEffect(() => {
    onUnauthorized(() => setUser(null));
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.set(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.login(username, password);
    tokenStore.set(res.access_token);
    setUser({ ...res.user, permissions: res.permissions });
  };

  const acceptTerms = async () => {
    const res = await api.acceptTerms();
    setUser((u) => (u ? { ...u, terms_accepted_at: res.terms_accepted_at } : u));
  };

  const can = (permission: string) => !!user?.permissions.includes(permission);

  const canActOnBureau = (bureauId?: string | null) =>
    can('case:act:any') || (can('case:act:own_bureau') && !!bureauId && user?.bureau_id === bureauId);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, acceptTerms, can, canActOnBureau }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const roleLabel = (role?: string) =>
  ({
    SUPER_ADMIN: 'Super Admin',
    SENIOR_MANAGEMENT: 'Senior Management',
    BUREAU_OFFICER: 'Bureau Officer',
    REGIONAL_OFFICER: 'Regional Officer (read-only)',
  } as Record<string, string>)[role || ''] || role || '';

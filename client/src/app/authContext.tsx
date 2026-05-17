import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Organization } from '../types';
import { authApi } from '../features/auth/services/authApi';
import { connectSocket, disconnectSocket } from '../lib/socket';
import i18n from '../i18n';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  organizations: Organization[];
  isLoading: boolean;
  login: (token: string, user: User, orgs: Organization[]) => void;
  logout: () => void;
  switchOrg: (orgId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    try {
      const stored = localStorage.getItem('organizations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('token'));

  const persist = (newToken: string, newUser: User, orgs: Organization[]) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('organizations', JSON.stringify(orgs));
    setToken(newToken);
    setUser(newUser);
    setOrganizations(orgs);
    if (newUser.locale) i18n.changeLanguage(newUser.locale);
    connectSocket(newToken);
  };

  const login = (newToken: string, newUser: User, orgs: Organization[]) => {
    persist(newToken, newUser, orgs);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organizations');
    setToken(null);
    setUser(null);
    setOrganizations([]);
    disconnectSocket();
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const res = await authApi.me();
    persist(res.data.data.token, res.data.data.user, res.data.data.organizations);
  }, [token]);

  const switchOrg = async (orgId: string) => {
    const res = await authApi.switchOrg(orgId);
    persist(res.data.data.token, res.data.data.user, res.data.data.organizations);
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    connectSocket(token);
    authApi
      .me()
      .then((res) => persist(res.data.data.token, res.data.data.user, res.data.data.organizations))
      .catch(() => logout())
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, organizations, isLoading, login, logout, switchOrg, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nova_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('nova_auth_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (e) {
          console.warn('Session expired or invalid, clearing credentials.');
          localStorage.removeItem('nova_auth_token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('nova_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => {
    const res = await api.register(payload);
    localStorage.setItem('nova_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('nova_auth_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await api.updateUser(user.id, data);
    setUser(updated);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

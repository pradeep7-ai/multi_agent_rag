import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string, isAdmin: boolean, username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    return adminStatus === 'true';
  });
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));

  const login = (newToken: string, adminStatus: boolean, usernameValue: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('isAdmin', adminStatus.toString());
    localStorage.setItem('username', usernameValue);
    setToken(newToken);
    setIsAdmin(adminStatus);
    setUsername(usernameValue);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    localStorage.removeItem('chatId');
    setToken(null);
    setIsAdmin(false);
    setUsername(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated, isAdmin, username }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

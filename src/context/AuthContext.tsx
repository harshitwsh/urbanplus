import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthProviderService, UserSession, DEMO_ACCOUNTS } from '../services/AuthProvider';
import { UserRole } from '../types/urbanpulse';

interface AuthContextType {
  session: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => UserSession;
  logout: () => void;
  demoAccounts: typeof DEMO_ACCOUNTS;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(() => AuthProviderService.getSession());

  useEffect(() => {
    const existing = AuthProviderService.getSession();
    if (existing) {
      setSession(existing);
    }
  }, []);

  const login = (email: string, role?: UserRole): UserSession => {
    const newSession = AuthProviderService.login(email, role);
    setSession(newSession);
    return newSession;
  };

  const logout = () => {
    AuthProviderService.logout();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session),
        login,
        logout,
        demoAccounts: DEMO_ACCOUNTS
      }}
    >
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

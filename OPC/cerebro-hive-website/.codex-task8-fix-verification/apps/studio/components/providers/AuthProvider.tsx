'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  name: string;
};

type Workspace = {
  id: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  workspace: Workspace | null;
  isLoading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In the future: Fetch current session from Next.js server actions (/api/me)
    const initAuth = async () => {
      try {
        // const session = await getSession();
        // setUser(session.user);
        // setWorkspace(session.workspace);
      } catch (e) {
        console.error("Session missing or expired");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const logout = async () => {
    // await logoutAction(); // Clears HttpOnly cookie
    setUser(null);
    setWorkspace(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, workspace, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

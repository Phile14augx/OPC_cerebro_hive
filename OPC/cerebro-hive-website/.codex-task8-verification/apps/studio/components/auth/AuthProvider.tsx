import React, { createContext, useContext, useEffect, useState } from 'react';
import { IdentityProvider, UserSession } from '../../lib/auth/IdentityProvider';

interface AuthContextValue {
  session: UserSession | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
  provider: IdentityProvider;
}

export function AuthProvider({ children, provider }: AuthProviderProps) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    provider.getSession()
      .then((sess) => setSession(sess))
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false));
  }, [provider]);

  const signIn = async () => {
    await provider.signIn();
  };

  const signOut = async () => {
    await provider.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

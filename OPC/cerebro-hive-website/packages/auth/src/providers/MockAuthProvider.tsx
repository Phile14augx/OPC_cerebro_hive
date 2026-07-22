import React, { useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { User } from '../types';
import { IAuthProvider } from '../interfaces';

const MOCK_USER: User = {
  id: 'usr_mock_123',
  name: 'Admin User',
  email: 'admin@cerebrohive.ai',
  tenantId: 'tnt_default',
  organizationId: 'org_internal',
  roles: ['PlatformAdmin'],
  permissions: ['forge.deploy', 'forge.delete', 'flow.execute', 'studio.publish', 'archive.upload', 'ops.admin', 'platform.settings'],
  features: ['beta.new_agents'],
  preferences: {
    theme: 'dark',
    locale: 'en-US'
  }
};

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial session load
    const timer = setTimeout(() => {
      setUser(MOCK_USER);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(MOCK_USER);
      setIsLoading(false);
    }, 500);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

import { createContext } from 'react';
import type { Session } from '../types';

export interface AuthContextType extends Session {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

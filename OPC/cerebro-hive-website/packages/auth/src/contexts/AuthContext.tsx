import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '../types';
import { IAuthProvider } from '../interfaces';

export interface AuthContextType extends Session {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

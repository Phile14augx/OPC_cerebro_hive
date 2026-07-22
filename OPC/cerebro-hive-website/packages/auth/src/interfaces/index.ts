import { User } from '../types';

export interface IAuthProvider {
  login(): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

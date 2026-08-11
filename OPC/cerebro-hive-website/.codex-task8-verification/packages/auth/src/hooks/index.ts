import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Permission } from '../types';

export const useSession = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const { user } = useSession();
  return user;
};

export const usePermissions = () => {
  const { user } = useSession();
  const permissions = user?.permissions || [];

  const can = (permission: Permission) => permissions.includes(permission);
  const hasAll = (perms: Permission[]) => perms.every(p => permissions.includes(p));
  const hasAny = (perms: Permission[]) => perms.some(p => permissions.includes(p));

  return { can, hasAll, hasAny, permissions };
};

// Server Component — fetches the user profile securely before rendering the shell.
import React from 'react';
import { getMe } from '@/app/actions/user';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = await getMe();

  return (
    <DashboardShell
      user={user ?? { id: '', email: '', full_name: 'Guest' }}
    >
      {children}
    </DashboardShell>
  );
}

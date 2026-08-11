import type { Metadata, Viewport } from 'next';
import '@/shared/ui/globals.css';
import AppShell from '@/shared/ui/AppShell';

export const metadata: Metadata = {
  title: 'CerebroSphere — Unified AEOS Dashboard',
  description: 'Real-time command dashboard for the CerebroHive AI Enterprise Operating System.',
};

export const viewport: Viewport = {
  themeColor: '#050507',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

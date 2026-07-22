'use client';
import './globals.css';
import { ThemeProvider, EnterpriseShell } from '@cerebro/ui';
import { MockAuthProvider } from '@cerebro/auth';

const forgeSidebar = [
  { label: 'Dashboard', href: '/' },
  { label: 'Agents', href: '/agents' },
  { label: 'Tools', href: '/tools' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Components', href: '/components' },
  { label: 'Settings', href: '/settings' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <MockAuthProvider>
            <EnterpriseShell appName="HiveForge" sidebarConfig={forgeSidebar}>
              {children}
            </EnterpriseShell>
          </MockAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

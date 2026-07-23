'use client';
import './globals.css';
import { ThemeProvider, EnterpriseShell } from '@cerebro/ui';
import { MockAuthProvider } from '@cerebro/auth';

const forgeSidebar = [
  { label: 'Forge Overview',       href: '/' },
  { label: 'AI Planner',           href: '/planner' },
  { label: 'Requirements Studio',  href: '/requirements' },
  { label: 'Architecture Studio',  href: '/architect' },
  { label: 'UI/UX Studio',         href: '/ui-studio' },
  { label: 'Code Generation',      href: '/codegen' },
  { label: 'Backend Studio',       href: '/backend' },
  { label: 'Database Studio',      href: '/database' },
  { label: 'API Studio',           href: '/api' },
  { label: 'Mobile Studio',        href: '/mobile' },
  { label: 'Web Studio',           href: '/web' },
  { label: 'Desktop Studio',       href: '/desktop' },
  { label: 'CerebroBots',          href: '/bots' },
  { label: 'Testing Intelligence', href: '/testing' },
  { label: 'AI Code Review',       href: '/review' },
  { label: 'Deployment Studio',    href: '/deploy' },
  { label: 'Repository Manager',   href: '/repos' },
  { label: 'AI Documentation',     href: '/docs' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <MockAuthProvider>
            <EnterpriseShell appName="CerebroForge™" sidebarConfig={forgeSidebar}>
              {children}
            </EnterpriseShell>
          </MockAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

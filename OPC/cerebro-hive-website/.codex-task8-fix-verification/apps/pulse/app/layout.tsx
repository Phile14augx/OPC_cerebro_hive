import '../shared/ui/globals.css';
import { Metadata, Viewport } from 'next';
import { AppShell } from '../shared/ui/AppShell';

export const metadata: Metadata = {
  title: { default: 'HivePulse', template: '%s · HivePulse' },
  description: 'Executive AI Command Centre — real-time enterprise health, autonomous briefings, and strategic alert coordination.',
  robots: { index: false }, // Internal product — not indexed
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }}>
      <body style={{ margin: 0 }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import '../shared/ui/globals.css';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HivePulse Command Center',
  description: 'Enterprise AI Platform',
}

import { AppShell } from '../shared/ui/AppShell';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}

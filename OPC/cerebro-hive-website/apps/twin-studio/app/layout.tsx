import type { ReactNode } from 'react';
import './globals.css';
export const metadata = {
  title: 'Twin Studio · CerebroHive',
  description: 'Durable, provenance-aware digital twin operations.',
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { ReactNode } from 'react';
import './globals.css';
import './industry.css';
export const metadata = { title: 'Twin Studio · Factory Alpha', description: 'Cerebro Hive Digital Twin Studio' };
export default function Layout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }

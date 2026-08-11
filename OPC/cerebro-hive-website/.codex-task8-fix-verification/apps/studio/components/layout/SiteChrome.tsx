'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { JsonLd } from '@/components/discovery';
import { buildOrganizationSchema, buildWebsiteSchema } from '@/lib/discovery';

const WORKSPACE_PREFIXES = ['/app', '/archive', '/studio'];

const SITE_SCHEMA = [buildOrganizationSchema(), buildWebsiteSchema()];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const isWorkspace = WORKSPACE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isWorkspace) {
    return <>{children}</>;
  }

  return (
    <>
      <JsonLd schema={SITE_SCHEMA} />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

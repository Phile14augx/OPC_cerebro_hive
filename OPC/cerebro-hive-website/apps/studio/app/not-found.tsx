'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    // Log the 404 to analytics/monitoring
    console.warn(`404 Not Found at path: ${pathname}`);
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-6 text-center px-4">
      <h2 className="text-4xl font-space font-bold">404 - Node Disconnected</h2>
      <p className="text-text-secondary max-w-md">
        The requested resource could not be found within the CerebroHive network.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary-accent text-background font-bold rounded-lg hover:brightness-110 transition-all"
      >
        Return to Core
      </Link>
    </div>
  );
}

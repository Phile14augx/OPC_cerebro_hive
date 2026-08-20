'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WorkspaceShell } from '@cerebro/experience';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));
  
  useEffect(() => {
    // Example: synchronize URL changes back into the store if needed
    console.log('Path changed:', pathname);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceShell>
        {children}
      </WorkspaceShell>
    </QueryClientProvider>
  );
}

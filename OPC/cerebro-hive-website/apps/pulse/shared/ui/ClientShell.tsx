'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WorkspaceShell, useWorkspaceStore } from '@cerebro/experience';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Here we would bind the RouterAdapter to the WorkspaceStore 
  // ensuring that state transitions can update the URL, and vice versa.
  
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

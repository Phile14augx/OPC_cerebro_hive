'use client';
import { MotionProvider } from '@/components/motion/foundation/MotionProvider';
import { LanguageProvider } from '@/components/layout/LanguageContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <MotionProvider>
          {children}
        </MotionProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}



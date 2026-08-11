'use client';
import { MotionProvider } from '@/components/motion/foundation/MotionProvider';
import { LanguageProvider } from '@/components/layout/LanguageContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { AuthProvider } from '@/components/auth/AuthProvider';
import { cognitoProvider } from '@/lib/auth/CognitoProvider';

// Initialize Cognito on client load
cognitoProvider.initialize({
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
  userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
  region: 'ap-south-1',
});

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
    <AuthProvider provider={cognitoProvider}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <MotionProvider>
            {children}
          </MotionProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}




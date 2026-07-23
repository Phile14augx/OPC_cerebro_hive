'use client';

import { useSyncTrustData } from '@/lib/trust/hooks';

export default function TrustLayout({ children }: { children: React.ReactNode }) {
  // Hydrate all trust stores at the layout level
  useSyncTrustData();

  return (
    <div className="h-full w-full overflow-y-auto">
      {children}
    </div>
  );
}

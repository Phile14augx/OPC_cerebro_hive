"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function MarketingWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide marketing layout elements on the authenticated platform routes
  if (pathname && pathname.startsWith("/app")) {
    return null;
  }

  return <>{children}</>;
}

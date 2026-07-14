"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      forcedTheme="dark"
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}

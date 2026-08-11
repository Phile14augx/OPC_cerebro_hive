import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroArchive | Enterprise Knowledge",
  description: "Enterprise Knowledge Intelligence Platform",
};

import { SidebarProvider } from "../app/components/SidebarContext";
import { PlatformLayoutClient } from "../app/components/PlatformLayoutClient";

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PlatformLayoutClient>
        {children}
      </PlatformLayoutClient>
    </SidebarProvider>
  );
}

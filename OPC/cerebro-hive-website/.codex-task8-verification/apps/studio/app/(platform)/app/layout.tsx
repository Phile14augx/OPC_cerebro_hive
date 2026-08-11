import React from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HivePulse | Enterprise AI Management",
  description: "Enterprise AI Management Platform powered by Cerebro X",
};

import { SidebarProvider } from "./components/SidebarContext";
import { PlatformLayoutClient } from "./components/PlatformLayoutClient";

export default function PlatformLayout({
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

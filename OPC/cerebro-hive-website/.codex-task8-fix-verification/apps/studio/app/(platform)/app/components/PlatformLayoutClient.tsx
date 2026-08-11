"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { configurePlatformApiWorkspace } from "@/lib/platform/api-client";
import { useWorkspaceStore } from "@/src/store/useWorkspaceStore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useSidebar } from "./SidebarContext";
import { cn } from "./ui/utils";

export function isOperatingSystemRoute(pathname: string): boolean {
  return pathname === "/app/brain";
}

export function PlatformLayoutClient({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const selectedWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const isOperatingSystem = isOperatingSystemRoute(pathname);

  useEffect(() => {
    configurePlatformApiWorkspace(async () => selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  return (
    <>
      <Sidebar />
      {/*
        Sidebar is fixed-position and only occupies real layout space at the
        lg breakpoint (it's an off-canvas drawer below that). So padding-left
        must be 0 on mobile/tablet and only kick in at lg+, driven entirely by
        Tailwind's responsive classes — never an inline style, which can't be
        media-query aware.
      */}
      <div
        className={cn(
          "flex-1 flex h-dvh min-h-0 flex-col min-w-0 w-full overflow-hidden transition-all duration-300",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-[280px]"
        )}
      >
        <Topbar />
        <main
          className={cn(
            "relative flex-1 min-h-0",
            isOperatingSystem
              ? "overflow-hidden p-0"
              : "overflow-y-auto custom-scrollbar p-4 pb-20 sm:p-6 sm:pb-20 lg:p-8 lg:pb-20",
          )}
        >
          <div className="w-full h-full min-h-0">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

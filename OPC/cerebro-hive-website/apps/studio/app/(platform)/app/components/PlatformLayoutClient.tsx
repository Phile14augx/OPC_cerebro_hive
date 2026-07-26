"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useSidebar } from "./SidebarContext";
import { cn } from "./ui/utils";

export function PlatformLayoutClient({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

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
          "flex-1 flex flex-col min-w-0 w-full transition-all duration-300",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-[280px]"
        )}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 pb-20 relative">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

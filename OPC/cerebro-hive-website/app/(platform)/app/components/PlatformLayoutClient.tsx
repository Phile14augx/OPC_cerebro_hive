"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useSidebar } from "./SidebarContext";

export function PlatformLayoutClient({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <>
      <Sidebar />
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ paddingLeft: isCollapsed ? '72px' : '280px' }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 pb-20 relative">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

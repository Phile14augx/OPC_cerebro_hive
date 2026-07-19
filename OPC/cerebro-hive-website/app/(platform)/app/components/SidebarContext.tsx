"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setCollapsed] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse: () => setCollapsed(p => !p), setCollapsed }}>
      <div className={`min-h-screen bg-background flex font-inter text-text-primary overflow-hidden ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}

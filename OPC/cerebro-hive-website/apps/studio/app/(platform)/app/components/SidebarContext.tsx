"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  /** Desktop (lg+) collapsed/expanded width toggle. */
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (v: boolean) => void;
  /** Mobile (<lg) off-canvas drawer open state. */
  isMobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapse: () => setCollapsed(p => !p),
        setCollapsed,
        isMobileOpen,
        toggleMobile: () => setMobileOpen(p => !p),
        closeMobile: () => setMobileOpen(false),
      }}
    >
      <div className={`min-h-screen bg-background flex font-inter text-text-primary overflow-x-hidden ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
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

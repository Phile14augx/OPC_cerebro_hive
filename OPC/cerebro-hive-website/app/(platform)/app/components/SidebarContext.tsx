"use client";

/**
 * SidebarContext — shared state for the platform shell's sidebar.
 *
 * Usage:
 *   // Wrap a layout section with <SidebarProvider>
 *   // Any child can call useSidebar() to read or toggle sidebar open state.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SidebarContextValue {
  /** Whether the sidebar is currently expanded (visible on mobile / full width on desktop). */
  isOpen: boolean;
  /** Toggle sidebar between open / closed. */
  toggle: () => void;
  /** Force sidebar open. */
  open: () => void;
  /** Force sidebar closed. */
  close: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: true,
  toggle: () => {},
  open: () => {},
  close: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

interface SidebarProviderProps {
  children: ReactNode;
  /** Initial state — defaults to open on desktop, closed on mobile.
   *  Caller can pass `false` to start collapsed. */
  defaultOpen?: boolean;
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const open   = useCallback(() => setIsOpen(true),      []);
  const close  = useCallback(() => setIsOpen(false),     []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/** Consume sidebar state in any client component that's a child of SidebarProvider. */
export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext);
}

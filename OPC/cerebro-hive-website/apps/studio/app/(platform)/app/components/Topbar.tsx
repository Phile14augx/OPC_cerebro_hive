"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { CommandPalette } from "./ui/CommandPalette";
import { HiveAssistant } from "./ui/HiveAssistant";
import { cn } from "./ui/utils";
import { useSidebar } from "./SidebarContext";

// ── Mock data (self-contained — no backend wiring yet) ──────────────────────────

const WORKSPACES = [
  { id: "prod", name: "CerebroHive", env: "Production" },
  { id: "dev", name: "CerebroHive", env: "Development" },
  { id: "research", name: "CerebroHive", env: "Research" },
  { id: "personal", name: "CerebroHive", env: "Personal" },
];

type Notification = {
  id: string;
  title: string;
  body: string;
  ts: string;
  read: boolean;
  tone: "info" | "success" | "warning";
};

const SEED_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "HiveSwarm run completed", body: "Goal ‘Build REST API’ finished in 3 waves — 4 tasks.", ts: "2m ago", read: false, tone: "success" },
  { id: "2", title: "Agent registered", body: "OrchestratorAgent v0.1.0 joined the swarm.", ts: "14m ago", read: false, tone: "info" },
  { id: "3", title: "Evaluation threshold", body: "CriticAgent quality score dropped below 0.70.", ts: "1h ago", read: true, tone: "warning" },
  { id: "4", title: "Deployment finished", body: "HA PostgreSQL cluster is live in West India.", ts: "3h ago", read: true, tone: "success" },
];

// ── Shared: click-outside + escape close ────────────────────────────────────────

function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return ref;
}

const panelMotion = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { duration: 0.15 },
};

// ── Workspace switcher ───────────────────────────────────────────────────────────

function WorkspaceMenu() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("prod");
  const ref = useDismiss(open, () => setOpen(false));
  const active = WORKSPACES.find((w) => w.id === activeId) ?? WORKSPACES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-surface rounded-lg transition-colors border border-transparent hover:border-border"
      >
        <div className="w-6 h-6 rounded bg-primary-accent/10 flex items-center justify-center">
          <Building2 size={14} className="text-primary-accent" />
        </div>
        <span className="text-sm font-medium text-text-primary">{active.name}</span>
        <ChevronDown size={14} className={cn("text-text-muted transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-2xl shadow-elevated overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Switch workspace</p>
            </div>
            {WORKSPACES.map((ws) => (
              <button
                key={ws.id}
                onClick={() => { setActiveId(ws.id); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                    <Building2 size={13} className="text-text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary leading-tight">{ws.name}</p>
                    <p className="text-xs text-text-secondary leading-tight">{ws.env}</p>
                  </div>
                </div>
                {ws.id === activeId && <Check size={14} className="text-primary-accent shrink-0" />}
              </button>
            ))}
            <div className="border-t border-border px-4 py-2.5">
              <Link
                href="/app/organizations"
                onClick={() => setOpen(false)}
                className="text-xs text-text-secondary hover:text-primary-accent transition-colors"
              >
                Manage organizations →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────────

const TONE_DOT: Record<Notification["tone"], string> = {
  info: "bg-blue-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
};

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const ref = useDismiss(open, () => setOpen(false));
  const unread = notes.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full transition-colors relative"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-2xl shadow-elevated overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-text-primary">Notifications</p>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-accent/10 text-primary-accent text-[10px] font-bold">
                    {unread}
                  </span>
                )}
              </div>
              <button
                onClick={() => setNotes((n) => n.map((x) => ({ ...x, read: true })))}
                className="text-[11px] font-medium text-text-muted hover:text-primary-accent transition-colors"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-border">
              {notes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNotes((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface transition-colors",
                    n.read && "opacity-60"
                  )}
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", TONE_DOT[n.tone])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{n.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-text-muted mt-1">{n.ts}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-border px-4 py-2.5">
              <Link
                href="/app/support"
                onClick={() => setOpen(false)}
                className="text-xs text-text-secondary hover:text-primary-accent transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── User menu ────────────────────────────────────────────────────────────────────

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "p-1 hover:bg-surface rounded-full transition-colors",
          open && "bg-surface"
        )}
      >
        <UserCircle size={28} className="text-text-secondary" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-2xl shadow-elevated overflow-hidden z-50"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <div className="w-9 h-9 rounded-full bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center text-primary-accent text-sm font-bold shrink-0">
                P
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">Phil</p>
                <p className="text-xs text-text-secondary truncate">philemonvnath@gmail.com</p>
              </div>
            </div>

            <div className="py-1">
              <Link
                href="/app/organizations"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
              >
                <Settings size={14} /> Account settings
              </Link>
              <Link
                href="/app/business/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
              >
                <CreditCard size={14} /> Billing
              </Link>
              <Link
                href="/app/security"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
              >
                <Shield size={14} /> Security
              </Link>
            </div>

            <div className="border-t border-border py-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} /> Sign out
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Topbar ───────────────────────────────────────────────────────────────────────

export function Topbar() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { toggleMobile } = useSidebar();

  // Global Ctrl+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
        {/* Mobile menu toggle + Organization Switcher (Left) */}
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <WorkspaceMenu />
        </div>

        {/* Command Palette / Search (Center) */}
        <div className="flex-1 min-w-0 max-w-xl px-2 sm:px-4">
          <button
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-surface border border-border hover:border-primary-accent/40 rounded-xl text-text-muted transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search size={16} className="shrink-0 group-hover:text-primary-accent transition-colors" />
              <span className="text-sm truncate whitespace-nowrap">
                <span className="hidden sm:inline">Search, command, or jump to...</span>
                <span className="sm:hidden">Search</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold shrink-0">
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">K</kbd>
            </div>
          </button>
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setAssistantOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-accent/10 hover:bg-primary-accent/20 text-primary-accent rounded-lg transition-colors border border-primary-accent/20"
          >
            <Sparkles size={16} />
            <span className="text-sm font-bold hidden sm:inline">Hive Assistant</span>
          </button>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <NotificationsMenu />
          <UserMenu />
        </div>
      </header>

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
      <HiveAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}

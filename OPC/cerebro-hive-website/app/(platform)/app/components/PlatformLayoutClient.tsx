"use client";

/**
 * PlatformLayoutClient — the app shell that wraps every platform page.
 *
 * Renders:
 *   TopBar   — fixed header with workspace switcher, command palette,
 *              Hive Assistant, notifications, and user menu.
 *   Sidebar  — collapsible left-nav (controlled via SidebarContext).
 *   Content  — the page's {children}, scrollable main area.
 *
 * Usage (from any (platform)/ layout.tsx):
 *   <SidebarProvider>
 *     <PlatformLayoutClient>{children}</PlatformLayoutClient>
 *   </SidebarProvider>
 */

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  BookOpen,
  Bot,
  LayoutDashboard,
  Menu,
  Shield,
  Zap,
  Command,
  X,
} from "lucide-react";

import TopBar from "@/components/layout/TopBar";
import { useSidebar } from "./SidebarContext";

// ── Sidebar navigation items ──────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Overview",        href: "/platform",            icon: LayoutDashboard },
  { label: "HiveAgents™",     href: "/platform/agents",     icon: Bot             },
  { label: "HiveAutomation™", href: "/platform/automation", icon: Zap             },
  { label: "HiveForge™",      href: "/platform/forge",      icon: Command         },
  { label: "HiveKnowledge™",  href: "/platform/knowledge",  icon: BookOpen        },
  { label: "HiveAnalytics™",  href: "/platform/analytics",  icon: BarChart2       },
  { label: "HiveGovern™",     href: "/platform/govern",     icon: Shield          },
  { label: "CerebroArchive™", href: "/platform/archive",    icon: BookOpen        },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-[56px] left-0 bottom-0 z-30
          flex flex-col
          border-r border-white/10 bg-[#0A0D14]
          transition-all duration-200 ease-in-out
          ${isOpen ? "w-56 translate-x-0" : "w-0 md:w-14 -translate-x-full md:translate-x-0"}
          overflow-hidden
        `}
      >
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/platform" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm
                  transition-colors group relative
                  ${active
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
                title={!isOpen ? label : undefined}
              >
                <Icon size={16} className="shrink-0" />
                <span
                  className={`truncate transition-opacity duration-150 ${
                    isOpen ? "opacity-100" : "opacity-0 md:opacity-0 pointer-events-none w-0"
                  }`}
                >
                  {label}
                </span>
                {/* Tooltip when collapsed (desktop) */}
                {!isOpen && (
                  <span className="
                    absolute left-14 px-2 py-1 rounded-md text-xs text-white
                    bg-[#1a1f2e] border border-white/10 shadow-xl
                    opacity-0 pointer-events-none
                    group-hover:opacity-100
                    transition-opacity duration-100
                    whitespace-nowrap z-50
                  ">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

// ── Layout client ─────────────────────────────────────────────────────────────

interface PlatformLayoutClientProps {
  children: ReactNode;
}

export function PlatformLayoutClient({ children }: PlatformLayoutClientProps) {
  const { isOpen, toggle } = useSidebar();

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      {/* TopBar is fixed — it renders its own spacer div */}
      <TopBar />

      {/* Sidebar toggle button — rendered inside TopBar's space by CSS */}
      <button
        onClick={toggle}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="
          fixed top-[56px] left-0 z-40
          flex items-center justify-center
          w-8 h-8 mt-3 ml-2
          rounded-lg text-slate-500 hover:text-white hover:bg-white/8
          transition-colors
        "
      >
        {isOpen ? <X size={15} /> : <Menu size={15} />}
      </button>

      <div className="flex">
        <Sidebar />

        {/* Main content — shifts right based on sidebar width */}
        <main
          className={`
            flex-1 min-w-0
            transition-all duration-200 ease-in-out
            ${isOpen ? "md:ml-56" : "md:ml-14"}
            ml-0
          `}
        >
          <div className="p-6 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

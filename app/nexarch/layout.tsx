/**
 * Cerebro Nexarch — Agentic OS Command Center
 * Root layout: persistent sidebar + top bar
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
  BrainCircuit, LayoutDashboard, Bot, Target, CheckSquare,
  ShieldCheck, Network, BarChart3, Zap, Settings2, Activity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nexarch Command Center | Cerebro",
  description: "Agentic OS — operate your AI workforce",
};

const NAV = [
  {
    label: "Platform",
    items: [
      { href: "/nexarch",             icon: LayoutDashboard, label: "Command Center" },
      { href: "/nexarch/topology",    icon: Network,         label: "Live Topology" },
    ],
  },
  {
    label: "Workforce",
    items: [
      { href: "/nexarch/agents",      icon: Bot,             label: "Agents" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/nexarch/missions",    icon: Target,          label: "Missions" },
      { href: "/nexarch/approvals",   icon: CheckSquare,     label: "Approvals" },
    ],
  },
  {
    label: "Governance",
    items: [
      { href: "/nexarch/governance",  icon: ShieldCheck,     label: "Policies & Budgets" },
    ],
  },
  {
    label: "Observability",
    items: [
      { href: "/nexarch/observability", icon: BarChart3,     label: "Metrics & Audit" },
    ],
  },
];

export default function NexarchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-gray-900 border-r border-gray-800">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-800">
          <BrainCircuit className="w-6 h-6 text-violet-400" />
          <div>
            <p className="text-sm font-bold text-white leading-none">Nexarch</p>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">Agentic OS</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV.map(section => (
            <div key={section.label}>
              <p className="px-2 mb-1 text-[10px] font-semibold tracking-wider text-gray-600 uppercase">
                {section.label}
              </p>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded text-sm text-gray-400
                             hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-gray-500">System healthy</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

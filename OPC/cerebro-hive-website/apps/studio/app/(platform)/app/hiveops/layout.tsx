"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GitBranch, Rocket, Shield, DollarSign,
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ARCH-LINT: Deferred
  Server, GitMerge, ChevronRight,
} from "lucide-react";

const HIVEOPS_NAV = [
  { title: "Overview",     href: "/app/hiveops",             icon: LayoutDashboard },
  { title: "Pipelines",    href: "/app/hiveops/pipelines",   icon: GitBranch },
  { title: "Deployments",  href: "/app/hiveops/deployments", icon: Rocket },
  { title: "Security",     href: "/app/hiveops/security",    icon: Shield },
  { title: "AI Costs",     href: "/app/hiveops/costs",       icon: DollarSign },
  { title: "Clusters",     href: "/app/hiveops/clusters",    icon: Server },
  { title: "GitOps",       href: "/app/hiveops/gitops",      icon: GitMerge },
];

export default function HiveOpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-nav */}
      <div className="flex items-center gap-1 flex-wrap border-b border-border pb-4">
        <span className="text-xs text-text-muted mr-2 font-semibold uppercase tracking-widest">HiveOps</span>
        {HIVEOPS_NAV.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-teal-500/15 text-teal-400 border border-teal-500/30"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
              }`}
            >
              <Icon size={13} />
              {item.title}
            </Link>
          );
        })}
      </div>

      {/* Page content */}
      <div>{children}</div>
    </div>
  );
}

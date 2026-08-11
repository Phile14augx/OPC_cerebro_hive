import { LayoutDashboard, Shield, ShieldCheck, Activity, Scale, Server, FileText, Bell, AlertTriangle, PlayCircle } from "lucide-react";
import React from "react";

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type ModuleNavigation = {
  id: string;
  basePath: string;
  title: string;
  groups: NavGroup[];
};

// Trust & Governance Module
export const TrustNavigation: ModuleNavigation = {
  id: "trust",
  basePath: "/app/trust",
  title: "Trust Console",
  groups: [
    {
      label: "Overview",
      items: [
        { label: "Executive Dashboard", href: "/app/trust", icon: LayoutDashboard },
        { label: "Alert Center", href: "/app/trust/alerts", icon: Bell },
      ]
    },
    {
      label: "Governance",
      items: [
        { label: "Security Posture", href: "/app/trust/security", icon: Shield },
        { label: "Compliance", href: "/app/trust/compliance", icon: ShieldCheck },
        { label: "Policies", href: "/app/trust/policies", icon: FileText },
        { label: "AI Safety", href: "/app/trust/safety", icon: Scale },
      ]
    },
    {
      label: "Operations",
      items: [
        { label: "Risk Heatmap", href: "/app/trust/risk", icon: AlertTriangle },
        { label: "Incidents", href: "/app/trust/incidents", icon: Activity },
        { label: "Audit Timeline", href: "/app/trust/audit", icon: Server },
        { label: "Provider Health", href: "/app/trust/providers", icon: PlayCircle },
      ]
    }
  ]
};

// Analytics Module (Example placeholder)
export const AnalyticsNavigation: ModuleNavigation = {
  id: "analytics",
  basePath: "/app/analytics",
  title: "Analytics",
  groups: [
    {
      label: "Dashboards",
      items: [
        { label: "Overview", href: "/app/analytics" },
        { label: "Usage", href: "/app/analytics/usage" },
      ]
    }
  ]
};

// Global Registry
export const NavigationRegistry: ModuleNavigation[] = [
  TrustNavigation,
  AnalyticsNavigation,
];

export function getNavigationForPath(pathname: string): ModuleNavigation | null {
  // Find the most specific match first (longest basePath)
  const sorted = [...NavigationRegistry].sort((a, b) => b.basePath.length - a.basePath.length);
  for (const nav of sorted) {
    if (pathname === nav.basePath || pathname.startsWith(nav.basePath + "/")) {
      return nav;
    }
  }
  return null;
}

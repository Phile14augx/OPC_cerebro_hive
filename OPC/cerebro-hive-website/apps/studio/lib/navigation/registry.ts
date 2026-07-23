import { LayoutDashboard, Shield, ShieldCheck, Activity, Scale, Server, FileText, Bell, AlertTriangle, PlayCircle } from "lucide-react";
import React from "react";

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ElementType;
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
  basePath: "/trust",
  title: "Trust Console",
  groups: [
    {
      label: "Overview",
      items: [
        { label: "Executive Dashboard", href: "/trust", icon: LayoutDashboard },
        { label: "Alert Center", href: "/trust/alerts", icon: Bell },
      ]
    },
    {
      label: "Governance",
      items: [
        { label: "Security Posture", href: "/trust/security", icon: Shield },
        { label: "Compliance", href: "/trust/compliance", icon: ShieldCheck },
        { label: "Policies", href: "/trust/policies", icon: FileText },
        { label: "AI Safety", href: "/trust/safety", icon: Scale },
      ]
    },
    {
      label: "Operations",
      items: [
        { label: "Risk Heatmap", href: "/trust/risk", icon: AlertTriangle },
        { label: "Incidents", href: "/trust/incidents", icon: Activity },
        { label: "Audit Timeline", href: "/trust/audit", icon: Server },
        { label: "Provider Health", href: "/trust/providers", icon: PlayCircle },
      ]
    }
  ]
};

// Analytics Module (Example placeholder)
export const AnalyticsNavigation: ModuleNavigation = {
  id: "analytics",
  basePath: "/analytics",
  title: "Analytics",
  groups: [
    {
      label: "Dashboards",
      items: [
        { label: "Overview", href: "/analytics" },
        { label: "Usage", href: "/analytics/usage" },
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

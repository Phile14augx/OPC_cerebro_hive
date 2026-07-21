"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Box, 
  Cpu, 
  Database, 
  Globe, 
  Hexagon, 
  LayoutDashboard, 
  LineChart, 
  Network, 
  Rocket, 
  Settings, 
  Shield, 
  Zap,
  DollarSign,
  Workflow,
  Server,
  CloudLightning,
  ChevronDown,
  ChevronRight,
  Terminal,
  Clock,
  Key
} from "lucide-react";

interface SidebarGroup {
  name: string;
  items: SidebarItem[];
}

interface SidebarItem {
  name: string;
  href: string;
  icon: any; // Using any for icon since it is a Lucide component
}

const sidebarConfig: SidebarGroup[] = [
  {
    name: "Overview",
    items: [
      { name: "Mission Control", href: "/platform/hiveops", icon: LayoutDashboard },
      { name: "Digital Twin", href: "/platform/hiveops/digital-twin", icon: Hexagon },
    ],
  },
  {
    name: "Infrastructure",
    items: [
      { name: "Clusters", href: "/platform/hiveops/clusters", icon: Server },
      { name: "Regions", href: "/platform/hiveops/regions", icon: Globe },
      { name: "Storage", href: "/platform/hiveops/storage", icon: Database },
      { name: "Networks", href: "/platform/hiveops/networks", icon: Network },
    ],
  },
  {
    name: "Compute",
    items: [
      { name: "GPU Fleet", href: "/platform/hiveops/compute/gpu", icon: Cpu },
      { name: "CPU Fleet", href: "/platform/hiveops/compute/cpu", icon: Box },
      { name: "Scheduling", href: "/platform/hiveops/compute/scheduling", icon: Clock },
    ],
  },
  {
    name: "Deployment",
    items: [
      { name: "Pipelines", href: "/platform/hiveops/pipelines", icon: Workflow },
      { name: "Releases", href: "/platform/hiveops/releases", icon: Rocket },
    ],
  },
  {
    name: "AI Runtime",
    items: [
      { name: "Model Serving", href: "/platform/hiveops/ai/models", icon: Zap },
      { name: "Vector Services", href: "/platform/hiveops/ai/vectors", icon: Database },
      { name: "Inference", href: "/platform/hiveops/ai/inference", icon: Activity },
    ],
  },
  {
    name: "Observability",
    items: [
      { name: "Metrics", href: "/platform/hiveops/observability/metrics", icon: LineChart },
      { name: "Logs", href: "/platform/hiveops/observability/logs", icon: Terminal },
      { name: "Incidents", href: "/platform/hiveops/incidents", icon: CloudLightning },
    ],
  },
  {
    name: "Optimization",
    items: [
      { name: "Cost Explorer", href: "/platform/hiveops/costs", icon: DollarSign },
      { name: "Capacity", href: "/platform/hiveops/capacity", icon: Box },
    ],
  },
  {
    name: "Security",
    items: [
      { name: "IAM & Secrets", href: "/platform/hiveops/security/iam", icon: Key },
      { name: "Compliance", href: "/platform/hiveops/security/compliance", icon: Shield },
    ],
  },
  {
    name: "Administration",
    items: [
      { name: "Settings", href: "/platform/hiveops/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-full bg-[#0B0D14] border-r border-emerald-500/10 flex flex-col flex-shrink-0">
      <div className="p-4 flex items-center gap-3 border-b border-emerald-500/10">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
          <Hexagon className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-emerald-50 leading-tight">HiveOps™</h1>
          <p className="text-xs text-emerald-500/70 leading-tight">Control Plane</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {sidebarConfig.map((group, idx) => (
          <div key={idx} className="mb-6 px-3">
            <h3 className="px-3 mb-2 text-xs font-semibold text-emerald-500/50 uppercase tracking-wider">
              {group.name}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20"
                        : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/5 border border-transparent"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-emerald-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

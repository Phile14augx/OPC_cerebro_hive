"use client";

import React, { useEffect } from "react";
import { Sidebar } from "@/components/platform/hiveforge/Sidebar";
import { Topbar } from "@/components/platform/hiveforge/Topbar";
import { Inspector } from "@/components/platform/hiveforge/Inspector";
import { CommandPalette } from "@/components/platform/hiveforge/CommandPalette";
import { DatabaseCloudPlugin } from "./clouds/database-cloud/manifest";
import { kernel } from "./core/kernel/Kernel";

export default function HiveForgeLayout({ children }: { children: React.ReactNode }) {
  
  // A simple boot sequence for the registry
  useEffect(() => {
    const boot = async () => {
      console.log("[HiveForge] OS Kernel Booting...");
      try {
        await kernel.loadPlugin(new DatabaseCloudPlugin());
      } catch (err) {
        console.error("Failed to load core clouds", err);
      }
    };
    boot();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-text-primary">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar with Breadcrumbs and Quick Actions */}
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {children}
        </main>
      </div>

      {/* Right-Hand Inspector Panel */}
      <Inspector />

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}

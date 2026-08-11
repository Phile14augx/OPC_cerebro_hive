"use client";

import React from "react";
import { Sidebar } from "@/components/platform/hiveops/Sidebar";
import { Topbar } from "@/components/platform/hiveops/Topbar";
import { Copilot } from "@/components/platform/hiveops/Copilot";

export default function HiveOpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0B0D14] text-slate-300 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Topbar */}
        <Topbar />
        
        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Floating Operations Copilot */}
      <Copilot />
    </div>
  );
}

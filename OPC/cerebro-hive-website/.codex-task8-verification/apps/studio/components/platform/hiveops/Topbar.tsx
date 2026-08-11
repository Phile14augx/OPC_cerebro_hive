"use client";

import React from "react";
import { Bell, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";

export function Topbar() {
  const pathname = usePathname();

  // Create breadcrumbs based on pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  
  return (
    <div className="h-16 border-b border-emerald-500/10 bg-[#0B0D14]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">HiveOps</span>
        {pathSegments.slice(2).map((segment, idx) => (
          <React.Fragment key={idx}>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 capitalize">{segment.replace("-", " ")}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search operations..."
            className="w-64 bg-slate-900/50 border border-emerald-500/20 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-500"
          />
        </div>

        <button className="relative p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#0B0D14]"></span>
        </button>

        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center cursor-pointer hover:bg-emerald-500/30 transition-colors">
          <User className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}

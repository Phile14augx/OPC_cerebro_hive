"use client";

import React, { useState } from "react";
import {
  Monitor, Sparkles, CheckCircle2, Loader2, HardDrive,
  Printer, Wifi, Database, Package, ChevronRight, Download,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useForgeProject } from "@/lib/forge/hooks";

const frameworks = [
  { name: "Electron",   stack: "JS / TypeScript",  selected: true, platform: "Windows, Mac, Linux" },
  { name: "Tauri",      stack: "Rust + JS",         selected: false, platform: "Windows, Mac, Linux" },
  { name: ".NET MAUI",  stack: "C#",                selected: false, platform: "Windows + Mac" },
];

const nativeFeatures = [
  { name: "Native Menus & Tray", icon: Monitor,   done: true },
  { name: "File System Access",  icon: HardDrive, done: true },
  { name: "Local SQLite DB",     icon: Database,  done: true },
  { name: "Print Support",       icon: Printer,   done: false },
  { name: "Offline Mode",        icon: Wifi,      done: true },
  { name: "Auto Updates",        icon: Package,   done: false },
];

export default function DesktopStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";
  const { project } = useForgeProject(projectId);
  const [selected, setSelected] = useState(0);
  const [building, setBuilding] = useState(false);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Monitor size={20} className="text-orange-400" />
          <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs">Desktop Studio</Badge>
          <Badge variant="secondary" className="text-xs">Phase 8</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Desktop Studio</h1>
        <p className="text-text-secondary mt-1">
          AI generates native desktop applications with Electron, Tauri, or .NET MAUI — including offline databases, system tray, and auto-updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Framework */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Framework</h2>
          <div className="space-y-3">
            {frameworks.map((f, i) => (
              <button key={i} onClick={() => setSelected(i)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${i === selected ? "bg-orange-500/10 border-orange-500/30" : "bg-surface border-border hover:bg-surface-elevated"}`}>
                <h3 className={`font-bold text-sm ${i === selected ? "text-orange-400" : "text-text-primary"}`}>{f.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{f.stack}</p>
                <p className="text-[10px] text-text-muted mt-1">{f.platform}</p>
              </button>
            ))}
          </div>

          {/* Desktop Preview */}
          <div className="w-full rounded-xl bg-background border-2 border-surface-elevated overflow-hidden">
            <div className="h-6 bg-surface-elevated flex items-center px-3 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <div className="flex-1 h-3 rounded bg-background/60 mx-4" />
            </div>
            <div className="flex h-40">
              <div className="w-20 bg-surface-elevated/50 border-r border-border p-2 space-y-1">
                {[...Array(5)].map((_, n) => (
                  <div key={n} className={`h-5 rounded ${n === 0 ? "bg-orange-500/30" : "bg-border/50"}`} />
                ))}
              </div>
              <div className="flex-1 p-3 space-y-2">
                <div className="h-4 rounded bg-surface-elevated w-1/2" />
                <div className="grid grid-cols-3 gap-1.5">
                  {[...Array(6)].map((_, n) => (
                    <div key={n} className="h-10 rounded bg-surface-elevated border border-border/50" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features + Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Native Capabilities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {nativeFeatures.map((cap, i) => (
                <Card key={i} className={`p-4 flex flex-col items-start gap-2 ${cap.done ? "border-orange-500/10" : ""}`}>
                  <cap.icon size={18} className={cap.done ? "text-orange-400" : "text-text-muted"} />
                  <p className="text-xs font-bold text-text-primary">{cap.name}</p>
                  <Badge variant={cap.done ? "warning" : "secondary"} className="text-[9px]">
                    {cap.done ? "Integrated" : "Planned"}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Screens"    value="8"     change="Desktop optimized" icon={Monitor}   trend="up" />
            <StatCard label="Bundle"     value="128MB" change="Electron build"    icon={Package}   trend="up" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => { setBuilding(true); setTimeout(() => setBuilding(false), 3000); }}
              disabled={building}
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
              {building ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {building ? "Building App..." : "Generate Desktop App"}
            </Button>
            <Button variant="secondary" className="gap-2"><Download size={14} /> Export Installer</Button>
            <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold" onClick={() => router.push(`/app/forge/codegen?projectId=${projectId}`)}>
              <ChevronRight size={16} /> Proceed to Code Generation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

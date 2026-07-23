"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone, Sparkles, Play, CheckCircle2, Loader2,
  Battery, Wifi, MapPin, Camera, Bell, CreditCard,
  ChevronRight, Download, Zap, Globe,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useForgeProject } from "@/lib/forge/hooks";

const platforms = [
  { name: "React Native", icon: "RN", desc: "Cross-platform JS", selected: true },
  { name: "Flutter",      icon: "FL", desc: "Dart / Skia",        selected: false },
  { name: "Android",      icon: "AN", desc: "Kotlin / Jetpack",   selected: false },
  { name: "iOS",          icon: "iOS",desc: "SwiftUI",             selected: false },
  { name: "Expo",         icon: "EX", desc: "Managed workflow",    selected: false },
  { name: "PWA",          icon: "PW", desc: "Progressive Web App", selected: false },
];

const capabilities = [
  { name: "Push Notifications", icon: Bell,       done: true  },
  { name: "Camera & Media",     icon: Camera,     done: true  },
  { name: "GPS & Maps",         icon: MapPin,     done: true  },
  { name: "Offline Mode",       icon: Wifi,       done: true  },
  { name: "Payments",           icon: CreditCard, done: false },
  { name: "Biometrics",         icon: Battery,    done: false },
];

const screens = [
  "Splash Screen", "Onboarding", "Login / Register", "Home Dashboard",
  "Patient Search", "Appointment Booking", "Doctor Profile", "Notifications",
  "Pharmacy Order", "Lab Results", "Billing", "Profile & Settings",
];

export default function MobileStudioPage() {
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
          <Smartphone size={20} className="text-green-400" />
          <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs">Mobile Studio</Badge>
          <Badge variant="secondary" className="text-xs">Phase 6</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Mobile Studio</h1>
        <p className="text-text-secondary mt-1">
          AI builds fully native or cross-platform mobile apps with navigation, state, offline, and device integrations.
        </p>
      </div>

      {/* Platform Selector */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Target Platform</h2>
        <div className="flex flex-wrap gap-3">
          {platforms.map((p, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${i === selected ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-surface border-border text-text-secondary hover:bg-surface-elevated"}`}>
              <span className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-xs font-black">{p.icon}</span>
              <div className="text-left">
                <p className={i === selected ? "text-green-400" : "text-text-primary"}>{p.name}</p>
                <p className="text-[10px] font-normal opacity-70">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mobile Preview */}
        <div className="flex justify-center">
          <div className="w-48 h-96 rounded-3xl bg-background border-4 border-surface-elevated shadow-2xl overflow-hidden relative">
            <div className="h-8 bg-surface-elevated flex items-center justify-between px-4">
              <div className="w-8 h-1.5 rounded bg-border" />
              <div className="w-3 h-3 rounded-full border-2 border-border" />
            </div>
            <div className="flex-1 p-3 space-y-2">
              <div className="h-6 rounded bg-green-500/20 border border-green-500/20 flex items-center px-2">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                <div className="w-16 h-1.5 rounded bg-green-400/40" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[1,2,3,4].map(n => (
                  <div key={n} className="h-20 rounded-xl bg-surface-elevated border border-border" />
                ))}
              </div>
              <div className="h-1.5 rounded bg-surface-elevated" />
              <div className="h-1.5 rounded bg-surface-elevated w-3/4" />
            </div>
            <div className="absolute bottom-0 inset-x-0 h-12 bg-surface-elevated border-t border-border flex items-center justify-around px-4">
              {[...Array(4)].map((_, n) => (
                <div key={n} className={`w-5 h-5 rounded ${n === 0 ? "bg-green-400/30" : "bg-border"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Screens */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Screens ({screens.length})</h2>
            <div className="flex flex-wrap gap-2">
              {screens.map((s, i) => (
                <Badge key={i} variant={i < 8 ? "success" : "secondary"} className="text-xs">
                  {i < 8 && <CheckCircle2 size={10} className="mr-1" />}
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* Native Capabilities */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Native Capabilities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {capabilities.map((cap, i) => (
                <Card key={i} className={`p-3 flex items-center gap-3 ${cap.done ? "border-green-500/20" : ""}`}>
                  <cap.icon size={16} className={cap.done ? "text-green-400" : "text-text-muted"} />
                  <span className="text-xs font-medium text-text-primary">{cap.name}</span>
                  {cap.done && <CheckCircle2 size={12} className="text-green-400 ml-auto shrink-0" />}
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Screens"     value="12"  change="Generated"     icon={Smartphone} trend="up" />
            <StatCard label="Components"  value="48"  change="Reusable"       icon={Zap}        trend="up" />
            <StatCard label="Bundle Size" value="4.2MB" change="Optimized"   icon={Download}   trend="up" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => { setBuilding(true); setTimeout(() => setBuilding(false), 3000); }}
              disabled={building}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              {building ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {building ? "Building..." : "Generate Mobile App"}
            </Button>
            <Button variant="secondary" className="gap-2"><Download size={14} /> Export APK/IPA</Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white font-bold" onClick={() => router.push(`/app/forge/codegen?projectId=${projectId}`)}>
              <ChevronRight size={16} /> Proceed to Code Generation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PenTool, Sparkles, ChevronRight, Palette, Type, Grid,
  Monitor, Smartphone, Moon, Accessibility, Zap, Download,
  CheckCircle2, Loader2, Layout, Layers,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useSearchParams, useRouter } from "next/navigation";
import { useForgeProject } from "@/lib/forge/hooks";

const designTokens = {
  colors: [
    { name: "Primary",     hex: "#6366F1", var: "--color-primary" },
    { name: "Secondary",   hex: "#8B5CF6", var: "--color-secondary" },
    { name: "Accent",      hex: "#F59E0B", var: "--color-accent" },
    { name: "Success",     hex: "#10B981", var: "--color-success" },
    { name: "Warning",     hex: "#F59E0B", var: "--color-warning" },
    { name: "Danger",      hex: "#EF4444", var: "--color-danger" },
    { name: "Background",  hex: "#0A0A0F", var: "--color-bg" },
    { name: "Surface",     hex: "#111118", var: "--color-surface" },
  ],
  typography: [
    { name: "Display",  size: "48px", weight: "800", family: "Space Grotesk" },
    { name: "H1",       size: "32px", weight: "700", family: "Space Grotesk" },
    { name: "H2",       size: "24px", weight: "700", family: "Space Grotesk" },
    { name: "Body",     size: "16px", weight: "400", family: "Inter" },
    { name: "Caption",  size: "12px", weight: "500", family: "Inter" },
    { name: "Mono",     size: "14px", weight: "400", family: "JetBrains Mono" },
  ],
};

const screens = [
  { name: "Login / Auth",         status: "generated", complexity: "Low" },
  { name: "Dashboard",            status: "generated", complexity: "High" },
  { name: "Patient List",         status: "generated", complexity: "Medium" },
  { name: "Patient Profile",      status: "generated", complexity: "High" },
  { name: "Appointment Booking",  status: "generating",complexity: "Medium" },
  { name: "Billing & Invoices",   status: "queued",    complexity: "High" },
  { name: "Pharmacy Module",      status: "queued",    complexity: "Medium" },
  { name: "Lab Results",          status: "queued",    complexity: "Medium" },
];

const features = [
  { label: "Responsive Layout",     done: true  },
  { label: "Dark Mode Support",     done: true  },
  { label: "Accessibility (WCAG)", done: true  },
  { label: "Micro-animations",      done: true  },
  { label: "Design Tokens",         done: true  },
  { label: "Component Library",     done: false },
  { label: "Figma Export",          done: false },
  { label: "Storybook Docs",        done: false },
];

export default function UIStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";
  const { project } = useForgeProject(projectId);
  const [darkMode, setDarkMode] = useState(true);
  const [generating, setGenerating] = useState(false);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <PenTool size={20} className="text-pink-400" />
          <Badge className="bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs">UI/UX Studio</Badge>
          <Badge variant="secondary" className="text-xs">Phase 4</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">UI/UX Intelligence</h1>
        <p className="text-text-secondary mt-1">
          AI generates branding, design tokens, wireframes, responsive screens, and a full component library.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Design Tokens */}
        <div className="space-y-6">
          {/* Color Palette */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette size={15} className="text-pink-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Color Palette</h2>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {designTokens.colors.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div
                    className="w-full h-10 rounded-lg border border-border/30"
                    style={{ backgroundColor: c.hex }}
                  />
                  <p className="text-[9px] font-medium text-text-muted text-center">{c.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type size={15} className="text-pink-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Typography</h2>
            </div>
            <Card className="p-4 space-y-2">
              {designTokens.typography.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-text-secondary text-xs">{t.name}</span>
                  <span className="text-[10px] text-text-muted font-mono">{t.size} / {t.weight}</span>
                </div>
              ))}
            </Card>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Design Features</h2>
            <Card className="p-4 space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={13} className={f.done ? "text-pink-400" : "text-text-muted"} />
                  <span className={f.done ? "text-text-secondary" : "text-text-muted"}>{f.label}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* Screen Generator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
              disabled={generating}
              className="gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generating ? "Generating Screens..." : "Generate All Screens"}
            </Button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface transition-colors"
            >
              <Moon size={14} />
              {darkMode ? "Dark Mode" : "Light Mode"}
            </button>
          </div>

          {/* Screen List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Generated Screens</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {screens.map((screen, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 hover:border-pink-500/20 transition-colors cursor-pointer group">
                    {/* Screen Wireframe Mockup */}
                    <div className="w-full h-28 bg-background rounded-lg border border-border mb-3 overflow-hidden relative">
                      <div className="absolute inset-0 flex flex-col">
                        <div className="h-5 bg-surface-elevated border-b border-border flex items-center px-2 gap-1">
                          <div className="w-8 h-1.5 rounded bg-pink-400/40" />
                          <div className="w-12 h-1.5 rounded bg-border ml-auto" />
                        </div>
                        <div className="flex-1 p-2 space-y-1.5">
                          <div className="w-3/4 h-2 rounded bg-surface-elevated" />
                          <div className="w-1/2 h-1.5 rounded bg-surface-elevated" />
                          <div className="grid grid-cols-3 gap-1 mt-2">
                            {[1,2,3].map(n => <div key={n} className="h-8 rounded bg-surface-elevated border border-border/50" />)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-text-primary text-xs group-hover:text-pink-400 transition-colors">{screen.name}</h3>
                        <p className="text-[10px] text-text-muted mt-0.5">Complexity: {screen.complexity}</p>
                      </div>
                      <Badge
                        variant={screen.status === "generated" ? "success" : screen.status === "generating" ? "warning" : "secondary"}
                        className="text-[9px] h-4 px-1.5"
                      >
                        {screen.status === "generating" && <Loader2 size={8} className="animate-spin mr-1" />}
                        {screen.status}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="gap-2 bg-pink-600 hover:bg-pink-700 text-white" onClick={() => router.push(`/app/forge/codegen?projectId=${projectId}`)}>
              <ChevronRight size={16} /> Proceed to Code Generation
            </Button>
            <Button variant="secondary" className="gap-2"><Download size={16} /> Export Design System</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

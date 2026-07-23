"use client";

import React, { useState } from "react";
import {
  Globe, Sparkles, CheckCircle2, Loader2, LayoutDashboard,
  Users, Shield, CreditCard, Bell, Settings, ChevronRight, Plus,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useForgeProject } from "@/lib/forge/hooks";

const appTypes = [
  { name: "SaaS Dashboard",    pages: 14, desc: "Multi-tenant B2B platform" },
  { name: "CRM System",        pages: 18, desc: "Sales pipeline & contacts" },
  { name: "ERP System",        pages: 24, desc: "Finance, HR, procurement" },
  { name: "Hospital System",   pages: 21, desc: "Current project",          active: true },
  { name: "Marketplace",       pages: 16, desc: "Multi-vendor e-commerce" },
  { name: "Learning Platform", pages: 12, desc: "LMS / course delivery" },
];

const generatedPages = [
  { name: "Landing Page",          status: "done",       auth: false },
  { name: "Login / Register",      status: "done",       auth: false },
  { name: "Dashboard",             status: "done",       auth: true  },
  { name: "User Management",       status: "done",       auth: true  },
  { name: "RBAC / Permissions",    status: "done",       auth: true  },
  { name: "Settings",              status: "done",       auth: true  },
  { name: "Billing & Subscription",status: "generating", auth: true  },
  { name: "Analytics & Reports",   status: "queued",     auth: true  },
  { name: "Notifications Center",  status: "queued",     auth: true  },
  { name: "API Keys Management",   status: "queued",     auth: true  },
];

export default function WebStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";
  const { project } = useForgeProject(projectId);
  const [building, setBuilding] = useState(false);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Globe size={20} className="text-sky-400" />
          <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs">Web Studio</Badge>
          <Badge variant="secondary" className="text-xs">Phase 7</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">Web Studio</h1>
        <p className="text-text-secondary mt-1">
          AI generates complete web applications — CRM, ERP, SaaS, marketplace — with auth, RBAC, analytics, and billing.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pages Generated"  value="10"   change="of 20 planned"   icon={Globe}           trend="up" />
        <StatCard label="Components"       value="124"  change="Reusable UI"      icon={LayoutDashboard} trend="up" />
        <StatCard label="API Hooks"        value="48"   change="React Query"      icon={CheckCircle2}    trend="up" />
        <StatCard label="Auth Flows"       value="6"    change="OAuth + JWT"      icon={Shield}          trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* App Type Selector */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">App Type</h2>
          <div className="space-y-2">
            {appTypes.map((app, i) => (
              <Card key={i} className={`p-4 cursor-pointer hover:border-sky-500/20 transition-colors ${app.active ? "border-sky-500/30 bg-sky-500/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-bold text-sm ${app.active ? "text-sky-400" : "text-text-primary"}`}>{app.name}</h3>
                    <p className="text-xs text-text-muted">{app.desc} · {app.pages} pages</p>
                  </div>
                  {app.active && <Badge variant="info" className="text-[10px]">Active</Badge>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Generated Pages */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Generated Pages</h2>
            <Button
              onClick={() => { setBuilding(true); setTimeout(() => setBuilding(false), 2500); }}
              disabled={building}
              className="gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold h-8 text-xs"
            >
              {building ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {building ? "Generating..." : "Generate All"}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generatedPages.map((page, i) => (
              <Card key={i} className={`p-4 ${page.status === "done" ? "border-sky-500/10" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-text-primary text-sm">{page.name}</h3>
                  <Badge
                    variant={page.status === "done" ? "success" : page.status === "generating" ? "warning" : "secondary"}
                    className="text-[10px]"
                  >
                    {page.status === "generating" && <Loader2 size={8} className="animate-spin mr-1" />}
                    {page.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {page.auth && <Badge variant="secondary" className="text-[9px] gap-1"><Shield size={8} /> Auth Required</Badge>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

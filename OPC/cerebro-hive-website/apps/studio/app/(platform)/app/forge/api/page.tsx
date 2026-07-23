"use client";

import React, { useState } from "react";
import {
  Webhook, Sparkles, CheckCircle2, Loader2, Copy,
  ChevronRight, Download, Shield, Zap, Globe,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useForgeProject } from "@/lib/forge/hooks";

const apiTypes = ["REST", "GraphQL", "gRPC", "WebSocket", "OpenAPI 3.1", "Swagger UI"];

const endpoints = [
  { method: "POST",   path: "/api/v1/auth/login",               desc: "Authenticate user",           auth: false },
  { method: "POST",   path: "/api/v1/auth/refresh",             desc: "Refresh access token",        auth: false },
  { method: "GET",    path: "/api/v1/patients",                  desc: "List all patients",           auth: true  },
  { method: "POST",   path: "/api/v1/patients",                  desc: "Create patient",              auth: true  },
  { method: "GET",    path: "/api/v1/patients/{id}",             desc: "Get patient by ID",           auth: true  },
  { method: "PATCH",  path: "/api/v1/patients/{id}",             desc: "Update patient",              auth: true  },
  { method: "POST",   path: "/api/v1/appointments",              desc: "Book appointment",            auth: true  },
  { method: "GET",    path: "/api/v1/appointments/{id}",         desc: "Get appointment",             auth: true  },
  { method: "POST",   path: "/api/v1/billing/invoices",          desc: "Generate invoice",            auth: true  },
  { method: "GET",    path: "/api/v1/pharmacy/inventory",        desc: "Query drug inventory",        auth: true  },
];

const methodColors: Record<string, string> = {
  GET:    "text-green-400 bg-green-400/10 border-green-400/20",
  POST:   "text-blue-400 bg-blue-400/10 border-blue-400/20",
  PATCH:  "text-amber-400 bg-amber-400/10 border-amber-400/20",
  PUT:    "text-orange-400 bg-orange-400/10 border-orange-400/20",
  DELETE: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function APIStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";
  const { project } = useForgeProject(projectId);
  const [selected, setSelected] = useState<string[]>(["REST", "OpenAPI 3.1"]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const toggle = (t: string) => setSelected(prev =>
    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
  );

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Webhook size={20} className="text-indigo-400" />
          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">API Studio</Badge>
          <Badge variant="secondary" className="text-xs">Phase 10</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">API Intelligence</h1>
        <p className="text-text-secondary mt-1">
          AI designs and generates REST, GraphQL, gRPC APIs with full OpenAPI documentation, validation, and test mocks.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Endpoints"      value="84"   change="Across 8 services"  icon={Webhook}       trend="up" />
        <StatCard label="Auth Protected" value="76"   change="Bearer JWT"          icon={Shield}        trend="up" />
        <StatCard label="Response Time"  value="<80ms" change="p95 benchmark"     icon={Zap}           trend="up" />
        <StatCard label="API Version"    value="v1.3" change="Semantic versioned"  icon={Globe}         trend="up" />
      </div>

      {/* API Type Selector */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">API Protocols</h2>
        <div className="flex flex-wrap gap-2">
          {apiTypes.map((t, i) => (
            <button key={i} onClick={() => toggle(t)}
              className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${selected.includes(t) ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-surface border-border text-text-secondary hover:bg-surface-elevated"}`}>
              {t}
            </button>
          ))}
        </div>
        <Button
          onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
          disabled={generating}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {generating ? "Generating..." : "Generate API Contracts"}
        </Button>
      </div>

      {/* Endpoint Explorer */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Endpoint Explorer</h2>
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-border">
            {endpoints.map((ep, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-elevated/30 transition-colors group">
                <span className={`text-[11px] font-black px-2 py-0.5 rounded border shrink-0 ${methodColors[ep.method]}`}>
                  {ep.method}
                </span>
                <span className="text-sm font-mono text-text-primary flex-1 truncate">{ep.path}</span>
                <span className="text-xs text-text-muted hidden sm:block">{ep.desc}</span>
                {ep.auth && <Badge variant="secondary" className="text-[9px] h-4 px-1.5 shrink-0"><Shield size={8} /></Badge>}
                <button
                  onClick={() => { setCopied(i); setTimeout(() => setCopied(null), 1500); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copied === i
                    ? <CheckCircle2 size={14} className="text-green-400" />
                    : <Copy size={14} className="text-text-muted hover:text-indigo-400" />
                  }
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" className="gap-2"><Download size={14} /> Export OpenAPI Spec</Button>
        <Button variant="secondary" className="gap-2"><Globe size={14} /> Open Swagger UI</Button>
      </div>
    </div>
  );
}

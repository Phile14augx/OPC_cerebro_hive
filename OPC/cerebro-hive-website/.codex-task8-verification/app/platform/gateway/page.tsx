"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Shield, Activity } from "lucide-react";

type Tab = "routes" | "firewall" | "traffic";
type RouteStatus = "active" | "draining" | "disabled";
type Route = { id: string; path: string; upstream: string; method: string[]; rateLimit: number; auth: string; status: RouteStatus };

const ROUTES: Route[] = [
  { id: "r1", path: "/api/v1/agents/**", upstream: "agentos:8090", method: ["GET", "POST", "PATCH", "DELETE"], rateLimit: 500, auth: "api-key", status: "active" },
  { id: "r2", path: "/api/v1/knowledge/**", upstream: "agentos:8090", method: ["GET", "POST"], rateLimit: 200, auth: "api-key", status: "active" },
  { id: "r3", path: "/api/v1/workflows/**", upstream: "agentos:8090", method: ["GET", "POST"], rateLimit: 100, auth: "api-key", status: "active" },
  { id: "r4", path: "/api/v1/finance/**", upstream: "agentos:8090", method: ["GET", "POST"], rateLimit: 300, auth: "jwt+mfa", status: "active" },
  { id: "r5", path: "/api/v1/admin/**", upstream: "agentos:8090", method: ["GET", "POST", "PATCH", "DELETE"], rateLimit: 50, auth: "jwt+mfa", status: "active" },
  { id: "r6", path: "/api/v1/public/**", upstream: "agentos:8090", method: ["GET"], rateLimit: 1000, auth: "none", status: "active" },
];

const FIREWALL_RULES = [
  { rule: "block-prompt-injection", type: "AI Firewall", action: "block", pattern: "Detect prompt injection in request body", hits: 142 },
  { rule: "block-pii-in-response", type: "AI Firewall", action: "redact", pattern: "Detect SSN/CC patterns in LLM response", hits: 28 },
  { rule: "block-jailbreak-attempt", type: "AI Firewall", action: "block", pattern: "Constitutional AI jailbreak classifier", hits: 67 },
  { rule: "rate-limit-exceeded", type: "Rate Limit", action: "throttle", pattern: "Per-key sliding window exceeded", hits: 890 },
  { rule: "geo-block-sanctioned", type: "IP Policy", action: "block", pattern: "Request origin in OFAC sanctioned list", hits: 3 },
];

const TRAFFIC = [
  { endpoint: "/api/v1/agents", rps: 48, p50: 38, p99: 210, errors: 0.2 },
  { endpoint: "/api/v1/knowledge/search", rps: 122, p50: 85, p99: 440, errors: 0.1 },
  { endpoint: "/api/v1/workflows", rps: 18, p50: 240, p99: 1800, errors: 0.5 },
  { endpoint: "/api/v1/finance", rps: 31, p50: 62, p99: 380, errors: 0.3 },
  { endpoint: "/api/v1/runtime/execute", rps: 24, p50: 1200, p99: 4800, errors: 1.2 },
];

function RoutesPanel() {
  const [routes, setRoutes] = useState<Route[]>(ROUTES);
  const toggle = (id: string) => setRoutes(rs => rs.map(r => r.id === id ? { ...r, status: r.status === "active" ? "disabled" : "active" } : r));
  const statusColor = (s: RouteStatus) => s === "active" ? "text-primary-accent border-primary-accent/40 bg-primary-accent/10" : s === "draining" ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" : "text-text-secondary border-border bg-surface/40";
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">HiveGateway proxies all inbound API traffic via Envoy. Each route defines the upstream service, allowed methods, rate limit, and authentication requirement. Routes with <code className="text-primary-accent">jwt+mfa</code> require a short-lived JWT and a second factor.</p>
      <div className="space-y-2">
        {routes.map(r => (
          <div key={r.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-mono font-semibold text-text-primary">{r.path}</span>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span>→ {r.upstream}</span>
                  <span className="flex gap-1">{r.method.map(m => <span key={m} className="font-mono">{m}</span>)}</span>
                  <span>{r.rateLimit}/min</span>
                  <span className="font-semibold text-primary-accent">{r.auth}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColor(r.status)}`}>{r.status}</span>
                <button onClick={() => toggle(r.id)} className="rounded-md border border-border px-2 py-1 text-xs text-text-secondary hover:border-primary-accent/40 transition-colors">{r.status === "active" ? "Disable" : "Enable"}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FirewallPanel() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">HiveGateway includes an AI firewall that inspects every request and response for prompt injection, jailbreak attempts, and PII leakage — using both regex rules and classifier models running at the edge.</p>
      <div className="space-y-2">
        {FIREWALL_RULES.map(r => (
          <div key={r.rule} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-mono font-semibold text-text-primary">{r.rule}</span>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-text-secondary">{r.type}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${r.action === "block" ? "border-red-500/40 text-red-400 bg-red-500/10" : r.action === "redact" ? "border-orange-400/40 text-orange-400 bg-orange-400/10" : "border-yellow-400/40 text-yellow-400 bg-yellow-400/10"}`}>{r.action}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary-accent">{r.hits.toLocaleString()}</div>
                <div className="text-xs text-text-secondary">hits / day</div>
              </div>
            </div>
            <p className="mt-2 text-xs text-text-secondary">{r.pattern}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrafficPanel() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">Live traffic breakdown per endpoint — requests per second, latency percentiles, and error rates. All data is derived from the Envoy access log stream in HiveObservatory.</p>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead className="border-b border-border bg-surface-elevated/40">
            <tr>{["Endpoint", "RPS", "P50 (ms)", "P99 (ms)", "Error %"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr>
          </thead>
          <tbody>
            {TRAFFIC.map(t => (
              <tr key={t.endpoint} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                <td className="px-3 py-2 font-mono text-text-primary">{t.endpoint}</td>
                <td className="px-3 py-2 font-semibold text-primary-accent">{t.rps}</td>
                <td className="px-3 py-2 text-text-secondary">{t.p50}</td>
                <td className="px-3 py-2 text-text-secondary">{t.p99}</td>
                <td className={`px-3 py-2 font-semibold ${t.errors > 1 ? "text-red-400" : "text-primary-accent"}`}>{t.errors}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["routes", "Routes", Globe],
  ["firewall", "AI Firewall", Shield],
  ["traffic", "Traffic", Activity],
];

export default function HiveGatewayPage() {
  const [tab, setTab] = useState<Tab>("routes");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveGateway™ · Tier 2</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">API gateway — Envoy routing, OPA authorization, AI firewall</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveGateway is the single ingress point for all platform API traffic. Envoy handles routing and rate limiting. OPA enforces policy at the request level. The AI firewall catches prompt injection and PII leakage before responses leave the edge.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "routes" && <RoutesPanel />}
      {tab === "firewall" && <FirewallPanel />}
      {tab === "traffic" && <TrafficPanel />}
    </main>
  );
}

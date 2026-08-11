"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Network, Shield, Activity } from "lucide-react";

type Tab = "topology" | "policies" | "health";
type Node = { id: string; name: string; type: "gateway" | "service" | "agent" | "external"; zone: "dmz" | "internal" | "trusted"; status: "healthy" | "degraded" | "down" };
type Route = { id: string; src: string; dst: string; protocol: string; port: number; encrypted: boolean; rateLimit: number };

const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";
const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";

const INIT_NODES: Node[] = [
  { id: "n1", name: "HiveGateway", type: "gateway", zone: "dmz", status: "healthy" },
  { id: "n2", name: "AgentOS API", type: "service", zone: "internal", status: "healthy" },
  { id: "n3", name: "Finance Agent", type: "agent", zone: "trusted", status: "healthy" },
  { id: "n4", name: "Vector Index", type: "service", zone: "internal", status: "healthy" },
  { id: "n5", name: "External LLM", type: "external", zone: "dmz", status: "healthy" },
];

const INIT_ROUTES: Route[] = [
  { id: "r1", src: "HiveGateway", dst: "AgentOS API", protocol: "gRPC", port: 50051, encrypted: true, rateLimit: 1000 },
  { id: "r2", src: "AgentOS API", dst: "Vector Index", protocol: "HTTP/2", port: 8080, encrypted: true, rateLimit: 5000 },
  { id: "r3", src: "Finance Agent", dst: "AgentOS API", protocol: "HTTP/2", port: 443, encrypted: true, rateLimit: 100 },
  { id: "r4", src: "AgentOS API", dst: "External LLM", protocol: "HTTPS", port: 443, encrypted: true, rateLimit: 200 },
];

const NODE_COLOR: Record<Node["type"], string> = {
  gateway: "border-orange-400/50 bg-orange-400/10 text-orange-400",
  service: "border-primary-accent/50 bg-primary-accent/10 text-primary-accent",
  agent: "border-purple-400/50 bg-purple-400/10 text-purple-400",
  external: "border-border bg-surface/40 text-text-secondary",
};
const ZONE_COLOR: Record<Node["zone"], string> = {
  dmz: "border-red-500/30 bg-red-500/5",
  internal: "border-primary-accent/20 bg-primary-accent/5",
  trusted: "border-green-500/20 bg-green-500/5",
};

function TopologyPanel() {
  const [nodes, setNodes] = useState<Node[]>(INIT_NODES);
  const [routes] = useState<Route[]>(INIT_ROUTES);
  const zones: Node["zone"][] = ["dmz", "internal", "trusted"];

  const toggle = (id: string) =>
    setNodes(ns => ns.map(n => n.id === id ? { ...n, status: n.status === "healthy" ? "down" : "healthy" } : n));

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">HiveNetwork manages the service mesh — encrypted mTLS routes between every platform service, agent, gateway, and external endpoint. All traffic is authenticated, rate-limited, and observable.</p>
      <div className="space-y-3">
        {zones.map(z => (
          <div key={z} className={`rounded-xl border p-4 ${ZONE_COLOR[z]}`}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-text-secondary">{z.toUpperCase()} Zone</h3>
            <div className="flex flex-wrap gap-2">
              {nodes.filter(n => n.zone === z).map(n => (
                <button key={n.id} onClick={() => toggle(n.id)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${NODE_COLOR[n.type]} ${n.status === "down" ? "opacity-40 line-through" : ""}`}>
                  <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${n.status === "healthy" ? "bg-primary-accent" : "bg-red-400"}`} />
                  {n.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Routes ({routes.length})</h3>
        <div className="mt-2 overflow-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-surface-elevated/40">
              <tr>{["Source", "Destination", "Protocol", "Port", "Rate Limit", "mTLS"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr>
            </thead>
            <tbody>
              {routes.map(r => (
                <tr key={r.id} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                  <td className="px-3 py-2 text-text-primary font-semibold">{r.src}</td>
                  <td className="px-3 py-2 text-text-secondary">{r.dst}</td>
                  <td className="px-3 py-2 font-mono text-text-secondary">{r.protocol}</td>
                  <td className="px-3 py-2 font-mono text-text-secondary">{r.port}</td>
                  <td className="px-3 py-2 text-text-secondary">{r.rateLimit.toLocaleString()}/min</td>
                  <td className="px-3 py-2"><span className={`font-semibold ${r.encrypted ? "text-primary-accent" : "text-red-400"}`}>{r.encrypted ? "✓" : "✗"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PoliciesPanel() {
  const policies = [
    { name: "deny-unencrypted-egress", action: "deny", match: "protocol != TLS", scope: "all zones" },
    { name: "rate-limit-external-llm", action: "throttle", match: "dst == External LLM", scope: "trusted zone" },
    { name: "allow-agent-to-api", action: "allow", match: "src.type == agent AND dst == AgentOS API", scope: "trusted → internal" },
    { name: "block-agent-direct-db", action: "deny", match: "src.type == agent AND dst.type == database", scope: "all zones" },
    { name: "mtls-required-internal", action: "require", match: "zone == internal", scope: "internal zone" },
  ];
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">Network policies control which services can communicate, on which protocols, and at what rate. All policies are evaluated at the Envoy sidecar level before any packet is forwarded.</p>
      <div className="space-y-2">
        {policies.map(p => (
          <div key={p.name} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-text-primary">{p.name}</span>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${p.action === "deny" ? "border-red-500/40 text-red-400 bg-red-500/10" : p.action === "allow" ? "border-primary-accent/40 text-primary-accent bg-primary-accent/10" : "border-yellow-400/40 text-yellow-400 bg-yellow-400/10"}`}>{p.action}</span>
            </div>
            <p className="mt-1 font-mono text-xs text-text-secondary">match: {p.match}</p>
            <p className="mt-0.5 text-xs text-text-secondary">scope: {p.scope}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthPanel() {
  const metrics = [
    { label: "Total connections", value: "12,847", unit: "active" },
    { label: "P99 latency", value: "4.2", unit: "ms" },
    { label: "Throughput", value: "98.4", unit: "Mbps" },
    { label: "mTLS handshake failures", value: "0", unit: "/ hour" },
    { label: "Rate limit hits", value: "23", unit: "/ min" },
    { label: "Policy denies", value: "7", unit: "/ hour" },
  ];
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">Real-time mesh health — connection counts, latency, throughput, and policy enforcement metrics. All data flows through HiveObservatory for alerting and anomaly detection.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl border border-border bg-surface/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{m.label}</p>
            <p className="mt-2 text-2xl font-bold text-primary-accent">{m.value}<span className="ml-1 text-sm font-normal text-text-secondary">{m.unit}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["topology", "Service Mesh", Network],
  ["policies", "Network Policies", Shield],
  ["health", "Health", Activity],
];

export default function HiveNetworkPage() {
  const [tab, setTab] = useState<Tab>("topology");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveNetwork™ · Tier 1</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Service mesh — mTLS routing, network policies, zone isolation</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveNetwork manages encrypted communication between every platform service, agent, and external endpoint. All traffic is authenticated via mTLS, rate-limited, and governed by zone-based network policies evaluated at the Envoy sidecar.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "topology" && <TopologyPanel />}
      {tab === "policies" && <PoliciesPanel />}
      {tab === "health" && <HealthPanel />}
    </main>
  );
}

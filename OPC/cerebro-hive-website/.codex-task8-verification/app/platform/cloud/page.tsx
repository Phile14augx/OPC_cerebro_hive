"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "topology" | "cost" | "policies";
const REGIONS = [
  { cloud: "AWS", region: "us-east-1", services: ["EKS","RDS Aurora","S3","ElastiCache"], status: "healthy", cost: 8240, workloads: 14 },
  { cloud: "AWS", region: "eu-west-1", services: ["EKS","RDS Aurora","S3"], status: "healthy", cost: 3810, workloads: 7 },
  { cloud: "GCP", region: "us-central1", services: ["GKE","Cloud SQL","GCS","Memorystore"], status: "healthy", cost: 4120, workloads: 9 },
  { cloud: "Azure", region: "eastus", services: ["AKS","Azure DB","Blob Storage"], status: "degraded", cost: 2890, workloads: 5 },
];
const CLOUD_BADGE: Record<string, string> = {
  AWS: "border-orange-400/40 text-orange-400 bg-orange-400/10",
  GCP: "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  Azure: "border-sky-400/40 text-sky-400 bg-sky-400/10",
};
export default function HiveCloudPage() {
  const [tab, setTab] = useState<Tab>("topology");
  const totalCost = REGIONS.reduce((s,r)=>s+r.cost, 0);
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveCloud™ · Tier 5</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Multi-cloud abstraction — AWS, GCP, Azure with unified control plane</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveCloud provides a cloud-agnostic control plane over AWS, GCP, and Azure. Workloads are placed by cost and latency optimizer; spend is tracked in real time with anomaly alerts; guardrail policies enforce tagging, regions, and budget limits across all clouds.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["topology","cost","policies"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="topology" && (
        <div className="mt-6 space-y-2">
          {REGIONS.map(r=>(
            <div key={`${r.cloud}-${r.region}`} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2"><span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${CLOUD_BADGE[r.cloud]}`}>{r.cloud}</span><p className="font-semibold font-mono text-text-primary">{r.region}</p></div>
                  <p className="mt-1 text-xs text-text-secondary">{r.services.join(" · ")}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-secondary">{r.workloads} workloads</span>
                  <div className={`h-2 w-2 rounded-full ${r.status==="healthy"?"bg-primary-accent":"bg-yellow-400"}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="cost" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total cloud spend this month</p><p className="mt-2 text-3xl font-bold text-primary-accent">${totalCost.toLocaleString()}</p></div>
          <div className="space-y-2">
            {REGIONS.map(r=>(
              <div key={`cost-${r.cloud}-${r.region}`} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center gap-3"><span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${CLOUD_BADGE[r.cloud]}`}>{r.cloud}</span><span className="font-mono text-sm text-text-primary">{r.region}</span></div>
                <div className="text-right"><p className="font-bold text-text-primary">${r.cost.toLocaleString()}/mo</p><div className="mt-1 h-1.5 w-24 rounded-full bg-surface-elevated/40"><div className="h-1.5 rounded-full bg-primary-accent" style={{width:`${(r.cost/totalCost*100)}%`}} /></div></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="policies" && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-text-secondary">Guardrail policies are enforced via OPA on every Terraform plan and Kubernetes manifest before apply. Violations block deployment.</p>
          {[
            ["Required tags","All resources must carry: env, team, cost-center, product — 100% compliance enforced"],
            ["Approved regions","Workloads may only run in: us-east-1, eu-west-1, us-central1, eastus — data residency compliant"],
            ["Budget alert","Notify when monthly spend exceeds 80% of budget; block new resources at 100%"],
            ["Instance types","Only Graviton (AWS) or Tau T2D (GCP) compute for cost efficiency — x86 requires approval"],
            ["Public IP prohibition","No public IPs on data-tier resources; all egress via HiveGateway egress proxy"],
            ["Encryption at rest","All storage volumes, databases, and object stores must use KMS-managed keys"],
          ].map(([name,desc])=>(
            <div key={String(name)} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4"><div className="mt-0.5 h-2 w-2 rounded-full bg-primary-accent shrink-0" /><div><p className="font-semibold text-text-primary">{name}</p><p className="mt-0.5 text-xs text-text-secondary">{desc}</p></div></div>
          ))}
        </div>
      )}
    </main>
  );
}

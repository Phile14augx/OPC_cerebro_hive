"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import {
  api, checkOnline, KEY, RESEARCH_CATEGORIES, CATEGORY_LABEL, OPPORTUNITY_LABEL,
  type ResearchSignal, type ResearchCategory, type SourceType, type ProductOpportunityType, type ProductSpec,
} from "./lib";

type Tab = "discovery" | "specs";

const SOURCE_TYPES: SourceType[] = ["paper", "repo", "model", "dataset", "news", "startup"];
const SOURCE_LABEL: Record<SourceType, string> = {
  paper: "Research Paper", repo: "Open-Source Repo", model: "Released Model", dataset: "Dataset", news: "Industry News", startup: "Startup Announcement",
};

function ScoreBadge({ overall }: { overall: number }) {
  const color = overall >= 70 ? "text-primary-accent" : overall >= 45 ? "text-yellow-400" : "text-text-secondary";
  return <span className={`font-semibold ${color}`}>{overall}/100</span>;
}

function SignalCard({ signal, onGenerateSpec, generating }: { signal: ResearchSignal; onGenerateSpec: (signalId: string, type: ProductOpportunityType) => void; generating: string | null }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <div className="text-sm font-semibold text-text-primary">{signal.title}</div>
          <div className="mt-1 text-xs text-text-secondary">
            {SOURCE_LABEL[signal.sourceType]} · {CATEGORY_LABEL[signal.category]} · {new Date(signal.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ScoreBadge overall={signal.score.overall} />
          {open ? <ChevronDown size={16} className="text-text-secondary" /> : <ChevronRight size={16} className="text-text-secondary" />}
        </div>
      </button>
      {open && (
        <div className="mt-4 space-y-4 border-t border-border pt-4 text-sm text-text-secondary">
          <p>{signal.summary}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {([
              ["Technical novelty", signal.score.technicalNovelty], ["Business value", signal.score.businessValue],
              ["Market demand", signal.score.marketDemand], ["Enterprise readiness", signal.score.enterpriseReadiness],
              ["Competitive advantage", signal.score.competitiveAdvantage], ["Strategic alignment", signal.score.strategicAlignment],
              ["Implementation difficulty", signal.score.implementationDifficulty], ["Risk", signal.score.risk], ["ROI", signal.score.roi],
            ] as [string, number][]).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-xs">
                <div className="text-text-secondary">{label}</div>
                <div className="font-semibold text-text-primary">{value}/100</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Score factors</div>
            <ul className="mt-1 space-y-0.5 text-xs">{signal.score.factors.map((f, i) => <li key={i}>• {f}</li>)}</ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Product opportunities</div>
            <div className="mt-2 space-y-2">
              {signal.opportunities.map(o => (
                <div key={o.type} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-text-primary">{OPPORTUNITY_LABEL[o.type]} — {o.title}</div>
                    <button
                      onClick={() => onGenerateSpec(signal.id, o.type)}
                      disabled={generating === `${signal.id}:${o.type}`}
                      className="rounded-md border border-primary-accent px-2.5 py-1 text-xs font-semibold text-primary-accent disabled:opacity-40"
                    >
                      {generating === `${signal.id}:${o.type}` ? "Generating…" : "Generate spec"}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-text-secondary">{o.rationale}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">Target industries: {o.targetIndustries.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiscoveryPanel({ online }: { online: boolean | null }) {
  const [signals, setSignals] = useState<ResearchSignal[]>([]);
  const [form, setForm] = useState({ title: "", sourceType: "paper" as SourceType, category: "agents" as ResearchCategory, summary: "", sourceOrg: "" });
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setSignals((await api<{ signals: ResearchSignal[] }>("/v1/cerebroforge/signals")).signals); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); }, [refresh]);

  const ingest = useCallback(async () => {
    if (!form.title.trim() || !form.summary.trim()) return;
    setBusy(true); setError(null);
    try {
      await api("/v1/cerebroforge/signals", {
        method: "POST",
        body: JSON.stringify({
          title: form.title, sourceType: form.sourceType, category: form.category,
          summary: form.summary, sourceOrg: form.sourceOrg || undefined,
        }),
      });
      setForm({ title: "", sourceType: "paper", category: "agents", summary: "", sourceOrg: "" });
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [form, refresh]);

  const generateSpec = useCallback(async (signalId: string, opportunityType: ProductOpportunityType) => {
    const key = `${signalId}:${opportunityType}`;
    setGenerating(key); setError(null);
    try { await api(`/v1/cerebroforge/signals/${signalId}/specs`, { method: "POST", body: JSON.stringify({ opportunityType }) }); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setGenerating(null); }
  }, []);

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Ingest a research signal</h2>
        <p className="mt-1 text-xs text-text-secondary">A paper, repo, model, dataset, news item, or startup announcement — scored across nine innovation dimensions, with product opportunities generated automatically.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title, e.g. A New Multimodal Reasoning Architecture" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary md:col-span-2" />
          <select value={form.sourceType} onChange={e => setForm(f => ({ ...f, sourceType: e.target.value as SourceType }))} className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary">
            {SOURCE_TYPES.map(s => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
          </select>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ResearchCategory }))} className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary">
            {RESEARCH_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
          <input value={form.sourceOrg} onChange={e => setForm(f => ({ ...f, sourceOrg: e.target.value }))} placeholder="Source org (optional)" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary md:col-span-2" />
          <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Summary — what does it do, is it production-ready, benchmarks, license…" rows={3} className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary md:col-span-2" />
        </div>
        <button onClick={() => void ingest()} disabled={busy || !online || !KEY || !form.title.trim() || !form.summary.trim()} className="mt-3 rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Scoring…" : "Ingest & score"}
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Innovation Radar ({signals.length})</h2>
        <div className="mt-3 space-y-3">
          {signals.map(s => <SignalCard key={s.id} signal={s} onGenerateSpec={(id, t) => void generateSpec(id, t)} generating={generating} />)}
          {signals.length === 0 && <p className="text-sm text-text-secondary">No signals yet — ingest one above.</p>}
        </div>
      </section>
    </div>
  );
}

function SpecCard({ spec }: { spec: ProductSpec }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <div className="text-sm font-semibold text-text-primary">{spec.opportunityTitle}</div>
          <div className="mt-1 text-xs text-text-secondary">{OPPORTUNITY_LABEL[spec.opportunityType]} · {new Date(spec.createdAt).toLocaleString()}</div>
        </div>
        {open ? <ChevronDown size={16} className="shrink-0 text-text-secondary" /> : <ChevronRight size={16} className="shrink-0 text-text-secondary" />}
      </button>
      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm text-text-secondary">
          <p>{spec.overview}</p>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Features</span><ul className="mt-1 space-y-0.5">{spec.features.map(f => <li key={f}>• {f}</li>)}</ul></div>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Target customers</span><p className="mt-1">{spec.targetCustomers.join("; ")}</p></div>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Architecture</span><ul className="mt-1 space-y-0.5">{spec.architecture.map(a => <li key={a}>• {a}</li>)}</ul></div>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Tech stack</span><p className="mt-1">{spec.techStack.join(", ")}</p></div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Timeline</span>
            <ul className="mt-1 space-y-0.5">{spec.timelinePhases.map(t => <li key={t.phase}>• {t.phase} — {t.weeks}</li>)}</ul>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Build tiers</span>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              {spec.buildTiers.map(t => (
                <div key={t.name} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary-accent">{t.name}</div>
                  <div className="mt-1 text-lg font-bold text-text-primary">${t.estimatedCostUsd.toLocaleString()}</div>
                  <div className="text-xs text-text-secondary">{t.weeks} weeks · {t.teamSize}-person team</div>
                  <ul className="mt-2 space-y-0.5 text-xs text-text-secondary">{t.scope.map(s => <li key={s}>• {s}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecsPanel({ online }: { online: boolean | null }) {
  const [specs, setSpecs] = useState<ProductSpec[]>([]);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setSpecs((await api<{ specs: ProductSpec[] }>("/v1/cerebroforge/specs")).specs); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  return (
    <div className="mt-6 space-y-6">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Generated product specs ({specs.length})</h2>
        <p className="mt-1 text-xs text-text-secondary">Generate specs from the Innovation Radar tab — they'll appear here automatically.</p>
        <div className="mt-3 space-y-3">
          {specs.map(s => <SpecCard key={s.id} spec={s} />)}
          {specs.length === 0 && <p className="text-sm text-text-secondary">No product specs yet.</p>}
        </div>
      </section>
    </div>
  );
}

export default function CerebroForgePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("discovery");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroForge™ — Phase 1: Discovery + Scoring + Product Opportunity Generator</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">The AI Innovation Factory</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        A governed-simulation research-to-product pipeline, not a live web-scraping news aggregator. Submit a
        research signal — a paper, repo, model, or announcement — and CerebroForge scores its innovation potential
        across nine dimensions, proposes concrete product opportunities tailored to its category, and expands any
        opportunity into a full implementation-ready product spec. Continuous crawling of arXiv, GitHub, and
        competitor feeds needs real external API access this platform doesn't have; this is the engine that would
        sit behind that ingestion layer.
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <div className="mt-6 flex gap-2 border-b border-border">
        {([
          ["discovery", "Innovation Radar"],
          ["specs", "Product Specs"],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "discovery" && <DiscoveryPanel online={online} />}
      {tab === "specs" && <SpecsPanel online={online} />}
    </main>
  );
}

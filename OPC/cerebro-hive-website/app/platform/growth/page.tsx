"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import {
  api, checkOnline, KEY, LEAD_STAGE_ORDER,
  type ContentSet, type Lead, type LeadSource, type LeadStage, type Proposal, type SalesBrief,
} from "./lib";

type Tab = "content" | "crm" | "copilot";

const STAGE_LABEL: Record<LeadStage, string> = {
  new: "New", qualified: "Qualified", meeting: "Meeting", proposal: "Proposal",
  contract: "Contract", won: "Won", lost: "Lost",
};

function ContentSetCard({ set }: { set: ContentSet }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <div className="text-sm font-semibold text-text-primary">{set.sourceTitle}</div>
          <div className="mt-1 text-xs text-text-secondary">{set.pieces.length} assets generated · {new Date(set.createdAt).toLocaleString()}</div>
        </div>
        {open ? <ChevronDown size={16} className="shrink-0 text-text-secondary" /> : <ChevronRight size={16} className="shrink-0 text-text-secondary" />}
      </button>
      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {set.pieces.map(p => (
            <div key={p.id} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary-accent">{p.title}</div>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-text-secondary">{p.body}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentStudioPanel({ online }: { online: boolean | null }) {
  const [sets, setSets] = useState<ContentSet[]>([]);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceExcerpt, setSourceExcerpt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setSets((await api<{ contentSets: ContentSet[] }>("/v1/cerebrogrowth/content")).contentSets); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); }, [refresh]);

  const generate = useCallback(async () => {
    if (!sourceTitle.trim() || !sourceExcerpt.trim()) return;
    setBusy(true); setError(null);
    try {
      await api("/v1/cerebrogrowth/content", { method: "POST", body: JSON.stringify({ sourceTitle, sourceExcerpt }) });
      setSourceTitle(""); setSourceExcerpt("");
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [sourceTitle, sourceExcerpt, refresh]);

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Turn one research paper into a full content set</h2>
        <p className="mt-1 text-xs text-text-secondary">Generates an executive summary, CEO post, company post, LinkedIn carousel, infographic brief, newsletter blurb, blog draft, and video script — one click.</p>
        <div className="mt-3 space-y-3">
          <input
            value={sourceTitle} onChange={e => setSourceTitle(e.target.value)}
            placeholder="Research title, e.g. Enterprise AI Governance at Scale"
            className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary"
          />
          <textarea
            value={sourceExcerpt} onChange={e => setSourceExcerpt(e.target.value)}
            placeholder="Paste the research excerpt, abstract, or key findings…"
            rows={4}
            className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary"
          />
          <button onClick={() => void generate()} disabled={busy || !online || !KEY || !sourceTitle.trim() || !sourceExcerpt.trim()} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
            {busy ? "Generating…" : "Generate content set"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Generated content sets</h2>
        <div className="mt-3 space-y-3">
          {sets.map(s => <ContentSetCard key={s.id} set={s} />)}
          {sets.length === 0 && <p className="text-sm text-text-secondary">No content sets yet — generate one above.</p>}
        </div>
      </section>
    </div>
  );
}

function LeadCard({ lead, onAdvance, onProposal }: { lead: Lead; onAdvance: (id: string, stage: LeadStage) => void; onProposal: (id: string) => void }) {
  const idx = LEAD_STAGE_ORDER.indexOf(lead.stage);
  const next = idx >= 0 && idx < LEAD_STAGE_ORDER.length - 1 ? LEAD_STAGE_ORDER[idx + 1] : undefined;
  return (
    <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-text-primary">{lead.contactName}</div>
          <div className="text-xs text-text-secondary">{lead.title ? `${lead.title} · ` : ""}{lead.companyName}</div>
        </div>
        <div className="text-right text-xs">
          <div className="font-semibold text-primary-accent">{lead.opportunityScore}/100</div>
          <div className="text-text-secondary">risk {lead.riskScore}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-text-secondary">{lead.recommendedService}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {next && lead.stage !== "lost" && (
          <button onClick={() => onAdvance(lead.id, next)} className="rounded-md border border-primary-accent px-2.5 py-1 text-xs font-semibold text-primary-accent">
            Move to {STAGE_LABEL[next]}
          </button>
        )}
        {lead.stage !== "lost" && lead.stage !== "won" && (
          <button onClick={() => onProposal(lead.id)} className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-text-secondary">
            Generate proposal
          </button>
        )}
        {lead.stage !== "lost" && lead.stage !== "won" && (
          <button onClick={() => onAdvance(lead.id, "lost")} className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-red-400/80">
            Mark lost
          </button>
        )}
      </div>
    </div>
  );
}

function CrmPanel({ online }: { online: boolean | null }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [form, setForm] = useState({ contactName: "", email: "", title: "", companyName: "", industry: "", employeeCount: "", source: "inbound" as LeadSource, notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try {
      const [l, p] = await Promise.all([
        api<{ leads: Lead[] }>("/v1/cerebrogrowth/leads"),
        api<{ proposals: Proposal[] }>("/v1/cerebrogrowth/proposals"),
      ]);
      setLeads(l.leads); setProposals(p.proposals);
    } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); }, [refresh]);

  const createLead = useCallback(async () => {
    if (!form.contactName.trim() || !form.email.trim() || !form.companyName.trim()) return;
    setBusy(true); setError(null);
    try {
      await api("/v1/cerebrogrowth/leads", {
        method: "POST",
        body: JSON.stringify({
          contactName: form.contactName, email: form.email, title: form.title || undefined,
          companyName: form.companyName, industry: form.industry || undefined,
          employeeCount: form.employeeCount ? Number(form.employeeCount) : undefined,
          source: form.source, notes: form.notes || undefined,
        }),
      });
      setForm({ contactName: "", email: "", title: "", companyName: "", industry: "", employeeCount: "", source: "inbound", notes: "" });
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [form, refresh]);

  const advance = useCallback(async (id: string, stage: LeadStage) => {
    try { await api(`/v1/cerebrogrowth/leads/${id}/stage`, { method: "POST", body: JSON.stringify({ stage }) }); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }, [refresh]);

  const proposal = useCallback(async (id: string) => {
    try { await api(`/v1/cerebrogrowth/leads/${id}/proposal`, { method: "POST" }); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }, [refresh]);

  const byStage = (stage: LeadStage) => leads.filter(l => l.stage === stage);

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Create a lead</h2>
        <p className="mt-1 text-xs text-text-secondary">AI scores opportunity and risk on creation and auto-recommends a service line.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Contact name *" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email *" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title, e.g. Chief Technology Officer" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Company name *" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="Industry" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <input value={form.employeeCount} onChange={e => setForm(f => ({ ...f, employeeCount: e.target.value.replace(/\D/g, "") }))} placeholder="Employee count" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value as LeadSource }))} className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary">
            <option value="lead-gen-form">Lead Gen Form</option>
            <option value="referral">Referral</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
            <option value="event">Event</option>
          </select>
          <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes — what do they need?" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
        </div>
        <button onClick={() => void createLead()} disabled={busy || !online || !KEY || !form.contactName.trim() || !form.email.trim() || !form.companyName.trim()} className="mt-3 rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Creating…" : "Create & score lead"}
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Pipeline</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {LEAD_STAGE_ORDER.concat("lost").map(stage => (
            <div key={stage} className="rounded-xl border border-border bg-surface/20 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{STAGE_LABEL[stage]} ({byStage(stage).length})</div>
              <div className="mt-2 space-y-2">
                {byStage(stage).map(l => <LeadCard key={l.id} lead={l} onAdvance={(id, s) => void advance(id, s)} onProposal={id => void proposal(id)} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Proposals ({proposals.length})</h2>
        <div className="mt-3 space-y-3">
          {proposals.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="text-sm font-semibold text-text-primary">{p.scope[0]}</div>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                {p.tiers.map(t => (
                  <div key={t.name} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary-accent">{t.name}</div>
                    <div className="mt-1 text-lg font-bold text-text-primary">${t.priceUsd.toLocaleString()}</div>
                    <ul className="mt-2 space-y-0.5 text-xs text-text-secondary">
                      {t.includes.map(i => <li key={i}>• {i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {proposals.length === 0 && <p className="text-sm text-text-secondary">No proposals yet — generate one from a lead in the pipeline above.</p>}
        </div>
      </section>
    </div>
  );
}

function BriefCard({ brief }: { brief: SalesBrief }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <div className="text-sm font-semibold text-text-primary">{brief.companyName}</div>
          <div className="mt-1 text-xs text-text-secondary">AI maturity: {brief.aiMaturity.label} ({brief.aiMaturity.score}/100)</div>
        </div>
        {open ? <ChevronDown size={16} className="shrink-0 text-text-secondary" /> : <ChevronRight size={16} className="shrink-0 text-text-secondary" />}
      </button>
      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm text-text-secondary">
          <p>{brief.overview}</p>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Likely stack</span><p className="mt-1">{brief.existingStackGuess.join(", ")}</p></div>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Pain points</span><ul className="mt-1 space-y-0.5">{brief.painPoints.map(p => <li key={p}>• {p}</li>)}</ul></div>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Stakeholders</span><p className="mt-1">{brief.stakeholders.join(", ")}</p></div>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Suggested pitch</span><p className="mt-1">{brief.suggestedPitch}</p></div>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-primary-accent">Discovery questions</span><ul className="mt-1 space-y-0.5">{brief.discoveryQuestions.map(q => <li key={q}>• {q}</li>)}</ul></div>
        </div>
      )}
    </div>
  );
}

function SalesCopilotPanel({ online }: { online: boolean | null }) {
  const [briefs, setBriefs] = useState<SalesBrief[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setBriefs((await api<{ briefs: SalesBrief[] }>("/v1/cerebrogrowth/briefs")).briefs); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); }, [refresh]);

  const generate = useCallback(async () => {
    if (!companyName.trim()) return;
    setBusy(true); setError(null);
    try {
      await api("/v1/cerebrogrowth/briefs", { method: "POST", body: JSON.stringify({ companyName, industry: industry || undefined }) });
      setCompanyName(""); setIndustry("");
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [companyName, industry, refresh]);

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Generate a company intelligence brief</h2>
        <p className="mt-1 text-xs text-text-secondary">Overview, AI maturity, likely stack, pain points, stakeholders, suggested pitch, and discovery questions — for any target account.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr_auto]">
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Target company, e.g. Contoso" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Industry (optional)" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <button onClick={() => void generate()} disabled={busy || !online || !KEY || !companyName.trim()} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
            {busy ? "Generating…" : "Generate brief"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Briefs ({briefs.length})</h2>
        <div className="mt-3 space-y-3">
          {briefs.map(b => <BriefCard key={b.id} brief={b} />)}
          {briefs.length === 0 && <p className="text-sm text-text-secondary">No briefs yet — generate one above.</p>}
        </div>
      </section>
    </div>
  );
}

export default function CerebroGrowthPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("content");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroGrowth™ — Phase 1: Content Studio + CRM + Sales Copilot</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">The Enterprise AI Growth Engine</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        A governed-simulation growth engine, not a LinkedIn automation tool. Turn one research paper into a full
        multi-channel content set, carry a lead from first touch through signed contract with AI qualification
        scoring at every stage, and generate a company intelligence brief for any target account — all deterministic
        and fully auditable. Real LinkedIn publishing and CRM export need an actual LinkedIn Developer App and
        credentials only you can create; this is the engine that would sit behind that integration.
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <div className="mt-6 flex gap-2 border-b border-border">
        {([
          ["content", "Content Studio"],
          ["crm", "CRM Pipeline"],
          ["copilot", "Sales Copilot"],
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

      {tab === "content" && <ContentStudioPanel online={online} />}
      {tab === "crm" && <CrmPanel online={online} />}
      {tab === "copilot" && <SalesCopilotPanel online={online} />}
    </main>
  );
}

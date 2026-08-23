"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Download, LayoutGrid } from "lucide-react";
import { api, checkOnline, type SkillOut, type TemplateOut } from "./lib";

type Tab = "skills" | "templates";
const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

function SkillsPanel({ online }: { online: boolean | null }) {
  const [skills, setSkills] = useState<SkillOut[]>([]);
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online) return;
    try { setSkills(await api<SkillOut[]>("/skills")); } catch { /* noop */ }
  }, [online]);


  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  const install = async () => {
    if (!slug.trim()) return;
    setBusy(true);
    try { await api("/skills/install", { method: "POST", body: JSON.stringify({ slug }) }); setSlug(""); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Skills are modular AI capabilities — tools, prompts, and workflows packaged as installable units. Each skill is versioned, sandboxed, and requires explicit tool grants before an agent can invoke it.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Install skill</h2>
        <div className="mt-3 flex gap-2">
          <input className={inputCls} value={slug} onChange={e => setSlug(e.target.value)} placeholder="skill-slug or registry URL" />
          <button onClick={install} disabled={busy || !online || !slug.trim()} className={`shrink-0 inline-flex items-center gap-1.5 ${btnPrimary}`}><Download size={12} />{busy ? "Installing…" : "Install"}</button>
        </div>
      </section>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{skills.length} installed skills</h2>
        {skills.length === 0
          ? <p className="mt-3 text-sm text-text-secondary">No skills installed. Install a skill above or browse templates.</p>
          : <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {skills.map(s => (
                <div key={s.id} className="rounded-xl border border-border bg-surface/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{s.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-text-secondary">{s.slug} · v{s.version}</div>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-full border border-primary-accent/40 bg-primary-accent/10 px-2 py-0.5 text-xs font-semibold text-primary-accent">installed</span>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">{s.description}</p>
                  <p className="mt-1 text-xs text-text-secondary">by {s.author}</p>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

function TemplatesPanel({ online }: { online: boolean | null }) {
  const [templates, setTemplates] = useState<TemplateOut[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);

  useEffect(() => {
    if (!online) return;
    api<TemplateOut[]>("/skills/templates").then(setTemplates).catch(() => { /* noop */ });
  }, [online]);

  const install = async (slug: string) => {
    setInstalling(slug);
    try { await api(`/marketplace/install/${slug}`, { method: "POST" }); }
    catch { /* noop */ } finally { setInstalling(null); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Browse the HiveModels template library — pre-built skill bundles covering common AI workflows. Each template installs with sensible defaults and a sample agent configuration.</p>
      {templates.length === 0
        ? <p className="text-sm text-text-secondary">No templates available — ensure the platform is online.</p>
        : <div className="grid gap-3 sm:grid-cols-2">
            {templates.map(t => (
              <div key={t.slug} className="rounded-xl border border-border bg-surface/40 p-4 flex flex-col gap-2">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{t.name}</div>
                  <div className="mt-0.5 text-xs text-primary-accent font-semibold">{t.category}</div>
                </div>
                <p className="text-xs text-text-secondary flex-1">{t.description}</p>
                <button onClick={() => install(t.slug)} disabled={installing === t.slug} className={`self-start ${btnPrimary}`}>{installing === t.slug ? "Installing…" : "Install"}</button>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["skills", "Installed Skills", Package],
  ["templates", "Template Library", LayoutGrid],
];

export default function HiveModelsPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("skills");
  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveModels™ · Tier 3</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Unified inference API — skills registry, model routing, template library</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveModels is the model and skill management layer. Install versioned skill packages from the exchange, browse production-ready templates, and manage the model registry powering all platform inference.</p>
      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === "skills" && <SkillsPanel online={online} />}
      {tab === "templates" && <TemplatesPanel online={online} />}
    </main>
  );
}

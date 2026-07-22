"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, BrainCircuit, Building2, CheckCircle2,
  ChevronRight, ClipboardCheck, FlaskConical,
  Heart, Info, LockKeyhole, Menu, MoreHorizontal, Search, ShieldCheck,
  Sparkles, Star, Users, X, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Section = {
  id: string;
  title: string;
  eyebrow: string;
  icon: typeof Building2;
  description: string;
  readingTime: string;
  owner: string;
  tags: string[];
  blocks: { heading: string; body: string }[];
};

const sections: Section[] = [
  {
    id: "welcome", title: "Welcome to CerebroHive", eyebrow: "Company handbook", icon: BookOpen,
    description: "The operating system for how we build, learn, and scale enterprise AI transformation.",
    readingTime: "4 min", owner: "Philemon V. Nath, CEO", tags: ["Company", "Onboarding"],
    blocks: [
      { heading: "Our purpose", body: "CerebroHive is a Bengaluru-based, AI-native enterprise engineering and transformation partner. We combine executive advisory, full-stack AI engineering, proprietary delivery frameworks, and managed operations to turn AI initiatives into measurable production outcomes for Indian enterprises." },
      { heading: "How to use this handbook", body: "Start in Story mode if you are new to CerebroHive. Use Explorer mode to find a policy or operating standard. This handbook links the detailed source documentation and is reviewed quarterly." },
    ],
  },
  {
    id: "company", title: "Company & Strategy", eyebrow: "01 — Company", icon: Building2,
    description: "Why we exist, where we are going, and the standards that make us different.",
    readingTime: "6 min", owner: "Philemon V. Nath, CEO", tags: ["Mission", "Strategy"],
    blocks: [
      { heading: "Mission", body: "Accelerate enterprise AI transformation by combining strategic advisory, full-stack engineering, and proprietary frameworks that deliver measurable, durable business outcomes." },
      { heading: "Vision", body: "To be the world’s most trusted AI-native enterprise transformation partner—the firm enterprises call when AI transformation is too important to get wrong." },
      { heading: "Our difference", body: "From Bengaluru, we connect strategy, data, engineering, governance, adoption, and operations for India’s mid-market and enterprise organizations. We measure success in revenue gained, cost removed, or risk reduced—not the number of models or features shipped." },
    ],
  },
  {
    id: "culture", title: "Culture & Values", eyebrow: "02 — Culture", icon: Heart,
    description: "The six decision filters that guide our work when the right path is unclear.",
    readingTime: "7 min", owner: "People & Operations", tags: ["Culture", "Values"],
    blocks: [
      { heading: "Outcome obsession", body: "Define client outcomes and measures before delivery; judge success by value realized." },
      { heading: "Engineering excellence", body: "Build secure, tested, documented, observable, maintainable production systems." },
      { heading: "Intellectual honesty", body: "Surface limitations, risks, scope concerns, and inconvenient findings early. Client partnership, continuous innovation, and responsible AI complete our six values." },
    ],
  },
  {
    id: "engineering", title: "Engineering Standards", eyebrow: "03 — Engineering", icon: Zap,
    description: "The quality bar for software, data, and production AI systems.",
    readingTime: "8 min", owner: "AI Engineering", tags: ["Engineering", "Quality", "Delivery"],
    blocks: [
      { heading: "Production quality from day one", body: "CI/CD starts in sprint 0. Pull requests require peer review and passing automated tests. Non-AI logic has at least 80% unit-test coverage." },
      { heading: "AI evaluation is a release gate", body: "Every model or prompt change is evaluated against a defined baseline and acceptance criteria. Production AI services expose latency, error-rate, and output-quality dashboards." },
      { heading: "Document the operating system", body: "Architecture decisions, API documentation, runbooks, and a README are complete before go-live. Infrastructure is managed as code, with no unrecorded manual provisioning." },
    ],
  },
  {
    id: "ai", title: "AI & Responsible Innovation", eyebrow: "04 — AI principles", icon: BrainCircuit,
    description: "How we evaluate, govern, and deploy AI systems that affect real people.",
    readingTime: "7 min", owner: "AI Governance", tags: ["AI", "Governance", "Safety"],
    blocks: [
      { heading: "Deployment readiness", body: "Before deployment, teams consider accuracy, latency, cost, safety, privacy, compliance, human oversight, observability, and rollback." },
      { heading: "Human impact", body: "Every system requires bias evaluation, a model card, and EU AI Act risk classification. High-stakes use cases require meaningful human-in-the-loop controls." },
      { heading: "Our red lines", body: "We do not build systems for irreversible high-stakes decisions without oversight, deception, authoritarian social scoring, weapons or dual-use military AI, or unmitigable discrimination." },
    ],
  },
  {
    id: "research", title: "Research & Labs", eyebrow: "05 — Research", icon: FlaskConical,
    description: "Turning learning and experimentation into reusable IP and trusted insight.",
    readingTime: "5 min", owner: "CerebroHive Labs", tags: ["Research", "Innovation"],
    blocks: [
      { heading: "The Labs mandate", body: "CerebroHive Labs generates proprietary IP, publishes thought leadership, contributes open source, and validates product ideas before full investment." },
      { heading: "Make learning compound", body: "Research and experiments should be reproducible, attributable, and recorded so the insight can be reviewed, challenged, and reused across the company." },
    ],
  },
  {
    id: "security", title: "Security & Privacy", eyebrow: "06 — Trust", icon: ShieldCheck,
    description: "Protect client, employee, and company information as a condition of doing business.",
    readingTime: "6 min", owner: "Security & Compliance", tags: ["Security", "Privacy", "Trust"],
    blocks: [
      { heading: "Default behaviour", body: "Use only approved tools and access, follow least privilege, do not place confidential or personal data into unapproved services, and report suspected incidents immediately." },
      { heading: "Policy maturity", body: "Client commitments, legal agreements, and applicable regulation govern data handling. For decisions outside an approved engagement pattern, obtain guidance from the security owner." },
    ],
  },
];

const storyIds = ["welcome", "company", "culture", "engineering", "ai", "research", "security"];

export default function HandbookPage() {
  const [activeId, setActiveId] = useState("welcome");
  const [query, setQuery] = useState("");
  const [storyMode, setStoryMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const active = sections.find((section) => section.id === activeId) ?? sections[0];
  const activeIndex = storyIds.indexOf(active.id);
  const results = useMemo(() => sections.filter((section) => `${section.title} ${section.description} ${section.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const progress = Math.round(((activeIndex + 1) / storyIds.length) * 100);

  const select = (id: string) => { setActiveId(id); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggleSaved = () => setSaved((items) => items.includes(active.id) ? items.filter((item) => item !== active.id) : [...items, active.id]);

  return (
    <div className="min-h-screen bg-[#0b0f14] pt-[72px] text-slate-100">
      <div className="fixed inset-x-0 top-[72px] z-40 h-0.5 bg-surface"><div className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <header className="sticky top-[72px] z-30 border-b border-border-default bg-[#0b0f14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-3 px-4 lg:px-7">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-slate-300 hover:bg-surface lg:hidden" aria-label="Toggle handbook navigation"><Menu size={18} /></button>
          <div className="flex items-center gap-2 font-space text-sm font-semibold tracking-tight"><div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950"><BrainCircuit size={18} /></div><span>CerebroHive <span className="hidden text-slate-500 sm:inline">/ Handbook</span></span></div>
          <div className="mx-auto hidden w-full max-w-md md:block"><label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 text-slate-400 focus-within:border-cyan-400/50"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-slate-500" placeholder="Search the handbook..." /><kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">⌘ K</kbd></label></div>
          <button onClick={() => setStoryMode(!storyMode)} className="ml-auto rounded-lg border border-border px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300">{storyMode ? "Explorer" : "Story mode"}</button>
          <button className="hidden grid h-9 w-9 place-items-center rounded-lg border border-border text-slate-300 hover:bg-surface sm:grid" aria-label="More actions"><MoreHorizontal size={18} /></button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 lg:grid-cols-[288px_minmax(0,1fr)_250px]">
        <aside className={cn("fixed inset-y-0 left-0 z-50 w-[288px] overflow-y-auto border-r border-border-default bg-[#0d1219] px-4 pb-8 pt-24 transition-transform lg:sticky lg:top-[136px] lg:z-10 lg:h-[calc(100vh-136px)] lg:translate-x-0 lg:pt-6", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="mb-6 flex items-center justify-between lg:hidden"><span className="font-space font-semibold">Handbook</span><button onClick={() => setSidebarOpen(false)}><X size={18} /></button></div>
          <div className="mb-5 rounded-xl border border-cyan-300/10 bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-3"><div className="mb-2 flex justify-between text-xs text-slate-400"><span>Reading progress</span><span className="text-cyan-300">{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-[11px] text-slate-500">{activeIndex + 1} of {storyIds.length} core chapters</p></div>
          <nav className="space-y-1" aria-label="Handbook chapters">
            {sections.map((section) => { const Icon = section.icon; const selected = activeId === section.id; return <button key={section.id} onClick={() => select(section.id)} className={cn("group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition", selected ? "bg-surface-elevated text-text-primary shadow-sm" : "text-slate-400 hover:bg-surface-elevated hover:text-slate-200")}><Icon size={16} className={selected ? "text-cyan-300" : "text-slate-500 group-hover:text-cyan-300"} /><span className="flex-1">{section.title}</span>{saved.includes(section.id) && <Star size={13} className="fill-amber-300 text-amber-300" />}{selected && <ChevronRight size={15} className="text-slate-500" />}</button>; })}
          </nav>
          <div className="mt-7 border-t border-border-default pt-5"><p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Quick access</p><button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-400 hover:text-text-primary"><Star size={15} /> Favorites <span className="ml-auto text-xs text-slate-600">{saved.length}</span></button><button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-400 hover:text-text-primary"><ClipboardCheck size={15} /> Playbooks</button></div>
        </aside>
        {sidebarOpen && <button onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-surface-elevated lg:hidden" aria-label="Close navigation" />}

        <main className="min-w-0 px-4 py-7 sm:px-7 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-[820px]">
            {query && <div className="mb-8 rounded-xl border border-border bg-surface-elevated p-3"><p className="mb-2 text-xs text-slate-500">{results.length} matching chapters</p><div className="flex flex-wrap gap-2">{results.map((result) => <button key={result.id} onClick={() => select(result.id)} className="rounded-lg bg-surface px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-400/10">{result.title}</button>)}</div></div>}
            <div className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#111c2a] via-[#111522] to-[#19122b] p-7 shadow-2xl shadow-cyan-950/20 sm:p-10">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" /><div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="relative"><div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300"><Sparkles size={14} /> {active.eyebrow}</div><h1 className="max-w-xl font-space text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">{active.title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{active.description}</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => document.getElementById("chapter-content")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200"><BookOpen size={16} /> Start reading</button><button onClick={toggleSaved} className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-surface px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-surface-elevated"><Star size={16} className={saved.includes(active.id) ? "fill-amber-300 text-amber-300" : ""} /> {saved.includes(active.id) ? "Saved" : "Save"}</button></div></div>
            </div>

            <article id="chapter-content" className="pb-10"><div className="mb-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border-default py-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><Users size={14} /> Owner: {active.owner}</span><span className="inline-flex items-center gap-1.5"><BookOpen size={14} /> {active.readingTime} read</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Reviewed July 2026</span></div>
              {active.blocks.map((block, index) => <section key={block.heading} className="mb-10"><h2 className="mb-3 font-space text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{block.heading}</h2><p className="text-[17px] leading-8 text-slate-300">{block.body}</p>{index === 0 && active.id === "engineering" && <Callout icon={<CheckCircle2 size={18} />} title="Best practice" text="Treat security, evaluation, documentation, and operational readiness as release gates—not work to complete after launch." tone="success" />}{index === 0 && active.id === "ai" && <Callout icon={<BrainCircuit size={18} />} title="AI recommendation" text="Benchmark against a baseline before production deployment, then continuously monitor output quality." tone="ai" />}{index === 0 && active.id === "security" && <Callout icon={<LockKeyhole size={18} />} title="Important" text="Never move client or personal information into a tool that has not been approved for the engagement." tone="warning" />}</section>)}
              <section className="rounded-2xl border border-border bg-surface-elevated p-5 sm:p-6"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary"><Info size={17} className="text-cyan-300" /> Related reading</div><div className="grid gap-3 sm:grid-cols-2">{sections.filter((item) => item.id !== active.id).slice(0, 4).map((item) => <button key={item.id} onClick={() => select(item.id)} className="group rounded-xl border border-border-default bg-[#101721] p-4 text-left hover:border-cyan-300/30 hover:bg-cyan-300/[0.04]"><div className="mb-1 text-sm font-semibold text-slate-200 group-hover:text-cyan-200">{item.title}</div><div className="text-xs text-slate-500">{item.readingTime} read</div></button>)}</div></section>
            </article>
            <div className="flex items-center justify-between border-t border-border-default pt-6"><button disabled={activeIndex <= 0} onClick={() => select(storyIds[activeIndex - 1])} className="inline-flex items-center gap-2 text-sm text-slate-400 disabled:opacity-30 hover:text-text-primary"><ArrowLeft size={16} /> Previous</button><span className="text-xs text-slate-600">{storyMode ? "Story mode" : "Explorer mode"}</span><button disabled={activeIndex >= storyIds.length - 1} onClick={() => select(storyIds[activeIndex + 1])} className="inline-flex items-center gap-2 text-sm text-slate-400 disabled:opacity-30 hover:text-text-primary">Next <ArrowRight size={16} /></button></div>
          </div>
        </main>

        <aside className="sticky top-[136px] hidden h-[calc(100vh-136px)] overflow-y-auto border-l border-border-default px-5 py-10 xl:block"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">On this page</p><div className="space-y-3 border-l border-border pl-4">{active.blocks.map((block, i) => <a key={block.heading} href={`#chapter-content`} className={cn("block text-sm", i === 0 ? "text-cyan-300" : "text-slate-500 hover:text-slate-300")}>{block.heading}</a>)}</div><div className="mt-10 border-t border-border-default pt-6"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Page details</p><dl className="space-y-4 text-xs"><div><dt className="text-slate-600">Owner</dt><dd className="mt-1 text-slate-300">{active.owner}</dd></div><div><dt className="text-slate-600">Tags</dt><dd className="mt-1 flex flex-wrap gap-1.5">{active.tags.map((tag) => <span key={tag} className="rounded-md bg-surface px-2 py-1 text-slate-400">{tag}</span>)}</dd></div><div><dt className="text-slate-600">Status</dt><dd className="mt-1 inline-flex items-center gap-1 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Living document</dd></div></dl></div></aside>
      </div>
      <button className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-[#141c28] px-4 py-3 text-sm font-semibold text-cyan-200 shadow-xl shadow-black/30 hover:bg-[#192536]"><Sparkles size={16} /> Ask Handbook AI</button>
    </div>
  );
}

function Callout({ icon, title, text, tone }: { icon: React.ReactNode; title: string; text: string; tone: "success" | "ai" | "warning" }) {
  const styles = { success: "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300", ai: "border-violet-400/20 bg-violet-400/[0.07] text-violet-300", warning: "border-amber-400/20 bg-amber-400/[0.07] text-amber-300" };
  return <div className={cn("mt-6 rounded-xl border p-4", styles[tone])}><div className="mb-1 flex items-center gap-2 text-sm font-bold">{icon} {title}</div><p className="text-sm leading-6 text-slate-300">{text}</p></div>;
}

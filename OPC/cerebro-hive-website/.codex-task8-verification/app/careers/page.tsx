import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers — Join CerebroHive",
  description:
    "Join CerebroHive and build the enterprise AI systems that power the world's most demanding organizations. Open roles across Engineering, AI Research, Services, and Operations.",
};

const OPEN_ROLES = [
  {
    title: "Senior AI Engineer",
    team: "Platform Engineering",
    location: "Remote (US/EU)",
    type: "Full-time",
    color: "text-primary-accent",
    border: "border-primary-accent/30",
    bg: "bg-primary-accent/5",
    desc: "Build production AI systems — RAG, agents, pipelines — on the CerebroHive platform. You write code that goes to production.",
    requirements: [
      "5+ years software engineering, 2+ years AI/ML systems",
      "Production experience with LLMs, vector DBs, or ML pipelines",
      "Strong Python (FastAPI, async), TypeScript experience a plus",
      "Experience with evaluation frameworks and production monitoring",
    ],
  },
  {
    title: "ML Engineer — Foundation Models",
    team: "AI Research",
    location: "Remote (US/EU)",
    type: "Full-time",
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    desc: "Fine-tune, evaluate, and operationalize foundation models for enterprise vertical applications. Blend research and engineering.",
    requirements: [
      "3+ years ML engineering (not just notebooks — production models)",
      "Experience with PEFT, LoRA, or full fine-tuning of LLMs",
      "Deep knowledge of evaluation methodologies",
      "Published research or equivalent demonstrated depth",
    ],
  },
  {
    title: "AI Strategy Consultant",
    team: "Strategy Practice",
    location: "Remote (US)",
    type: "Full-time",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    desc: "Lead AI strategy engagements for Fortune 500 clients — from readiness assessment through roadmap delivery and board presentation.",
    requirements: [
      "5+ years strategy consulting (Big 4, MBB, or boutique AI firm)",
      "Deep understanding of enterprise AI adoption patterns",
      "Experience facilitating C-suite workshops",
      "MBA or equivalent; domain expertise in finance, healthcare, or manufacturing a plus",
    ],
  },
  {
    title: "AI Security Engineer",
    team: "Security Practice",
    location: "Remote (US)",
    type: "Full-time",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    desc: "Red-team AI systems, design adversarially robust architectures, and build AI governance programs for regulated enterprises.",
    requirements: [
      "4+ years security engineering, 2+ years AI/ML security focus",
      "Experience with prompt injection, model extraction, and adversarial testing",
      "NIST AI RMF, EU AI Act, or ISO 42001 experience",
      "CISSP, CEH, or equivalent certification a plus",
    ],
  },
  {
    title: "MLOps Engineer",
    team: "AI Operations",
    location: "Remote (Global)",
    type: "Full-time",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    desc: "Build and operate the infrastructure that keeps production AI systems running — monitoring, retraining, cost optimization, incident response.",
    requirements: [
      "4+ years MLOps or DevOps/platform engineering",
      "Production experience with ML pipelines (Kubeflow, Airflow, or equivalent)",
      "Strong Kubernetes, Terraform, and observability stack experience",
      "LLMOps experience (serving, monitoring, cost optimization) a strong plus",
    ],
  },
  {
    title: "Academy Curriculum Developer",
    team: "Academy",
    location: "Remote (Global)",
    type: "Full-time",
    color: "text-teal-400",
    border: "border-teal-500/30",
    bg: "bg-teal-500/5",
    desc: "Build world-class enterprise AI courses and certification programs — from curriculum design through lab development and delivery.",
    requirements: [
      "3+ years in AI/ML engineering plus instructional design or technical writing",
      "Experience creating technical content (courses, workshops, or documentation)",
      "Ability to make complex AI topics accessible to practitioners",
      "Adult learning or curriculum design background a plus",
    ],
  },
];

const BENEFITS = [
  "Fully remote — work where you do your best work",
  "Competitive base + meaningful equity",
  "Full health, dental, and vision (US employees)",
  "$3,000/year learning and development budget",
  "Free access to all CerebroHive Academy content",
  "Async-first culture with deep work protected",
  "Quarterly all-hands (in-person, travel covered)",
  "Top-of-the-line hardware setup stipend",
];

export default function CareersPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">
          Careers
        </p>
        <h1 className="font-space text-4xl font-bold text-text-primary md:text-5xl">
          Build What&apos;s Next in Enterprise AI
        </h1>
        <p className="mt-4 text-text-secondary max-w-2xl text-lg">
          We&apos;re a small team of engineers and strategists building the platform, products, and services that enterprises use to run production AI systems. If you like shipping things that matter, we should talk.
        </p>
      </div>

      {/* Culture note */}
      <div className="rounded-2xl border border-primary-accent/30 bg-primary-accent/5 p-6 mb-12">
        <p className="text-sm text-text-primary leading-relaxed">
          <span className="font-bold">How we work:</span> Small teams, real ownership, and direct impact. Every engineer at CerebroHive owns a surface area from architecture through production monitoring. We move fast, write production code, and hold each other to high craft standards — without the politics of large organizations.
        </p>
      </div>

      {/* Open roles */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-6">
          Open Roles
        </p>
        <div className="space-y-5">
          {OPEN_ROLES.map((role) => (
            <div
              key={role.title}
              className={`rounded-2xl border ${role.border} ${role.bg} p-6`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className={`text-base font-bold ${role.color}`}>{role.title}</h2>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="text-xs text-text-secondary">{role.team}</span>
                    <span className="text-xs text-text-secondary">·</span>
                    <span className="text-xs text-text-secondary">{role.location}</span>
                    <span className="text-xs text-text-secondary">·</span>
                    <span className="text-xs text-text-secondary">{role.type}</span>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border ${role.border} ${role.color} hover:opacity-80 transition-opacity`}
                >
                  Apply <ArrowRight size={11} />
                </Link>
              </div>
              <p className="text-sm text-text-secondary mb-4">{role.desc}</p>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Requirements
                </p>
                <ul className="space-y-1.5">
                  {role.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-xs text-text-secondary">
                      <CheckCircle size={11} className={`${role.color} shrink-0 mt-0.5`} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-5">
          Benefits
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle size={13} className="text-primary-accent shrink-0" />
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Open application */}
      <div className="rounded-2xl border border-border bg-surface/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-text-primary">Don&apos;t see the right role?</p>
          <p className="text-sm text-text-secondary mt-0.5">
            We hire for exceptional people. Send us your background and what you want to work on.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Open Application <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}

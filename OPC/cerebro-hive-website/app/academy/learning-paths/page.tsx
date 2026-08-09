import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Learning Paths — CerebroHive Academy Certifications",
  description:
    "6 structured learning paths from practitioner to CerebroHive Certified. AI Engineer, ML Engineer, AI Strategist, AI Governance Lead, AI Ops, AI Security.",
};

const PATHS = [
  {
    code: "CHA-ENG",
    name: "AI Engineer",
    cert: "CerebroHive Certified AI Engineer",
    color: "text-primary-accent",
    border: "border-primary-accent/30",
    bg: "bg-primary-accent/5",
    duration: "16–20 weeks",
    level: "Advanced",
    description:
      "Master the full AI engineering stack: RAG systems, AI agents, LLM evaluation, vector databases, and production deployment. Capstone: build and deploy a production AI agent system on CerebroStudio™.",
    modules: [
      "Foundation: LLM Fundamentals & API Engineering",
      "Module 1: Production RAG Systems (AE-101)",
      "Module 2: AI Agent Engineering (AE-102)",
      "Module 3: LLM Evaluation & Red-Teaming (AE-103)",
      "Module 4: Vector Database Design (AE-104)",
      "Module 5: AI Pipeline Engineering (AE-106)",
      "Capstone: Deploy a Production AI Agent",
    ],
    outcomes: [
      "Build production RAG and agent systems",
      "Design evaluation suites for LLM applications",
      "Deploy AI to production with monitoring",
    ],
  },
  {
    code: "CHA-MLE",
    name: "ML Engineer",
    cert: "CerebroHive Certified ML Engineer",
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    duration: "18–24 weeks",
    level: "Advanced",
    description:
      "Deep ML engineering: feature engineering, model training, fine-tuning, MLOps, and production operations. Capstone: train, deploy, and monitor a production ML model end-to-end.",
    modules: [
      "Foundation: ML Fundamentals & Feature Engineering",
      "Module 1: Production Model Training & Evaluation",
      "Module 2: Fine-Tuning Foundation Models (AE-105)",
      "Module 3: MLOps Fundamentals (AO-101)",
      "Module 4: Model Monitoring & Drift Detection (AO-102)",
      "Module 5: Automated Retraining Pipelines (AO-105)",
      "Capstone: End-to-End ML System in Production",
    ],
    outcomes: [
      "Train and fine-tune production ML models",
      "Build automated MLOps pipelines",
      "Monitor and maintain live models",
    ],
  },
  {
    code: "CHA-STR",
    name: "AI Strategist",
    cert: "CerebroHive Certified AI Strategist",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    duration: "12–16 weeks",
    level: "Practitioner",
    description:
      "Enterprise AI strategy from opportunity identification through board presentation and program governance. Capstone: deliver an AI readiness assessment and 3-year roadmap for a real organization.",
    modules: [
      "Module 1: Enterprise AI Readiness Assessment (AS-101)",
      "Module 2: AI Opportunity Identification (AS-102)",
      "Module 3: Building the AI Business Case (AS-103)",
      "Module 4: AI Roadmap Design (AS-104)",
      "Module 5: Executive Communication (AS-105)",
      "Module 6: AI Vendor Selection (AS-106)",
      "Module 7: AI ROI Measurement (AS-108)",
      "Capstone: Full AI Strategy Engagement",
    ],
    outcomes: [
      "Lead AI strategy engagements",
      "Build defensible business cases",
      "Present AI roadmaps to C-suite",
    ],
  },
  {
    code: "CHA-GOV",
    name: "AI Governance Lead",
    cert: "CerebroHive Certified AI Governance Lead",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    duration: "14–18 weeks",
    level: "Advanced",
    description:
      "Build and run enterprise AI governance programs aligned to NIST AI RMF, EU AI Act, and ISO 42001. Capstone: design a full AI governance program for a complex enterprise.",
    modules: [
      "Module 1: AI Risk Management — NIST AI RMF (SG-101)",
      "Module 2: EU AI Act Compliance (SG-102)",
      "Module 3: Building an AI Governance Program (SG-106)",
      "Module 4: Bias Auditing & Fairness Testing (SG-107)",
      "Module 5: AI Privacy Engineering (SG-105)",
      "Module 6: Model Risk Management (SG-104)",
      "Module 7: AI Security Architecture (SG-108)",
      "Capstone: Design an Enterprise AI Governance Program",
    ],
    outcomes: [
      "Stand up NIST AI RMF-aligned governance programs",
      "Conduct AI risk assessments",
      "Lead regulatory compliance for AI systems",
    ],
  },
  {
    code: "CHA-OPS",
    name: "AI Operations",
    cert: "CerebroHive Certified AI Operations Lead",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    duration: "14–18 weeks",
    level: "Advanced",
    description:
      "Production AI operations — LLMOps, monitoring, incident response, cost optimization, and AI platform engineering. Capstone: build an AI operations runbook and monitoring stack for a production system.",
    modules: [
      "Module 1: MLOps Fundamentals (AO-101)",
      "Module 2: Model Monitoring & Drift Detection (AO-102)",
      "Module 3: AI Incident Response (AO-103)",
      "Module 4: Production ML Cost Optimization (AO-104)",
      "Module 5: LLMOps (AO-107)",
      "Module 6: AI SLA Design & Enforcement (AO-106)",
      "Module 7: AI Platform Engineering (AO-108)",
      "Capstone: Production AI Operations Stack",
    ],
    outcomes: [
      "Operate production AI systems at scale",
      "Build monitoring and alerting pipelines",
      "Design AI platform infrastructure",
    ],
  },
  {
    code: "CHA-SEC",
    name: "AI Security",
    cert: "CerebroHive Certified AI Security Engineer",
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    duration: "16–20 weeks",
    level: "Expert",
    description:
      "Adversarial AI security — red-teaming, prompt injection, model extraction defenses, and AI security architecture. Capstone: conduct a full AI red-team engagement on a production system.",
    modules: [
      "Foundation: AI Threat Modeling",
      "Module 1: AI Red-Teaming & Adversarial Testing (SG-103)",
      "Module 2: AI Security Architecture (SG-108)",
      "Module 3: Prompt Injection & Defense Engineering",
      "Module 4: AI Privacy Engineering (SG-105)",
      "Module 5: Supply Chain Security for AI",
      "Module 6: Secure AI Deployment Patterns",
      "Capstone: Full AI Red-Team Engagement",
    ],
    outcomes: [
      "Conduct AI red-team assessments",
      "Design adversarially robust AI systems",
      "Lead AI security architecture reviews",
    ],
  },
];

export default function LearningPathsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-8">
      <Link
        href="/academy"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"
      >
        <ArrowLeft size={14} /> Academy
      </Link>

      <div className="mt-6 mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">
          Learning Paths
        </p>
        <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
          6 Certification Paths
        </h1>
        <p className="mt-3 text-text-secondary max-w-2xl">
          Structured paths from practitioner to CerebroHive Certified. Each path ends with a capstone project reviewed by CerebroHive engineers — the certification is earned, not handed out.
        </p>
      </div>

      <div className="space-y-6">
        {PATHS.map((path) => (
          <div
            key={path.code}
            className={`rounded-2xl border ${path.border} ${path.bg} p-6`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-text-secondary">{path.code}</span>
                <h2 className={`text-xl font-bold ${path.color} mt-0.5`}>{path.name}</h2>
                <p className="text-xs text-text-secondary mt-1">{path.cert}</p>
              </div>
              <div className="shrink-0 flex gap-3 text-xs">
                <div className={`rounded-full border ${path.border} px-3 py-1 font-semibold ${path.color}`}>
                  {path.level}
                </div>
                <div className="rounded-full border border-border px-3 py-1 text-text-secondary">
                  {path.duration}
                </div>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-5">{path.description}</p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-3">
                  Curriculum
                </p>
                <ol className="space-y-1.5 list-none">
                  {path.modules.map((mod, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className={`shrink-0 font-mono ${path.color} opacity-60 mt-0.5`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {mod}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-3">
                  What You&apos;ll Be Able to Do
                </p>
                <ul className="space-y-2">
                  {path.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-xs text-text-secondary">
                      <CheckCircle size={12} className={`${path.color} shrink-0 mt-0.5`} />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-border bg-surface/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-text-primary">Ready to get certified?</p>
          <p className="text-sm text-text-secondary mt-0.5">
            Enroll in a path or discuss team licensing with our team.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Enroll Now <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}

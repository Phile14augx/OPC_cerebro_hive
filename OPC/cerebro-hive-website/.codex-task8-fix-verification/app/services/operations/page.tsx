"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Code = "AO-01"|"AO-02"|"AO-03"|"AO-04"|"AO-05"|"AO-06"|"AO-07"|"AO-08"|"AO-09"|"AO-10";

const SERVICES: { code: Code; name: string; buyer: string; outcome: string; deliverables: string[]; methodology: string; duration: string; products: string[]; metrics: string[]; price: string; isManaged?: boolean }[] = [
  {
    code: "AO-01", name: "AgentOps",
    buyer: "VP Engineering, Head of AI, Platform Director",
    outcome: "Autonomous agents continuously monitored, tuned, and improved — with guaranteed SLAs and zero silent failures.",
    deliverables: ["Monitoring dashboard", "Alerting configuration", "Monthly performance reports", "Quarterly prompt optimization sprints", "Capability expansion releases", "Incident response"],
    methodology: "Observe → Evaluate → Tune → Release → Repeat",
    duration: "Ongoing monthly retainer", price: "$8,000/month",
    products: ["CerebroAgent", "HiveOps", "HiveObservatory", "HiveEvaluation"],
    metrics: ["Agent task success >95%", "Human intervention <5%", "Zero undetected failures"],
    isManaged: true,
  },
  {
    code: "AO-02", name: "MLOps",
    buyer: "Head of ML, MLOps Lead, VP Data Science",
    outcome: "Production ML models continuously monitored for drift, retrained on schedule, deployed safely.",
    deliverables: ["Model registry setup", "Automated retraining pipelines", "Drift detection alerts", "Canary deployment", "Performance dashboards", "Incident response playbooks"],
    methodology: "MLOps maturity model progression (Level 0 → Level 3)",
    duration: "8-week setup + ongoing monthly", price: "$12,000/month",
    products: ["HiveOps", "HiveForge", "HiveObservatory", "HiveCompute"],
    metrics: ["Zero undetected drift", "Retraining fully automated", "Deployment frequency ≥2×/month"],
    isManaged: true,
  },
  {
    code: "AO-03", name: "LLMOps",
    buyer: "Head of AI, Platform Director, VP Engineering",
    outcome: "LLMs continuously evaluated for quality, cost-optimized, and safely updated as new model versions release.",
    deliverables: ["LLM performance baseline", "Evaluation suite", "Cost monitoring dashboard", "Model upgrade playbook", "A/B testing framework", "Hallucination alerts"],
    methodology: "Continuous evaluation loop: baseline → evaluate → optimize → release → monitor",
    duration: "6-week setup + ongoing monthly", price: "$10,000/month",
    products: ["HiveOps", "HiveModels", "HiveEvaluation", "HiveObservatory"],
    metrics: ["LLM cost/query reduced 20%+", "Hallucination <2%", "Quality regression-free across upgrades"],
    isManaged: true,
  },
  {
    code: "AO-04", name: "Prompt Engineering Services",
    buyer: "Product Manager, AI Engineer, Business Owner",
    outcome: "Optimized system prompts that consistently produce high-quality, on-brand, and safe outputs.",
    deliverables: ["Prompt audit", "Optimized prompt library (tested + versioned)", "Testing framework", "Best practices guide", "Governance process"],
    methodology: "Systematic prompt evaluation: baseline → variation testing → evaluation → iteration",
    duration: "2–4 weeks", price: "$15,000",
    products: ["HiveForge (prompt studio)", "HiveEvaluation"],
    metrics: ["Output quality +20% vs. baseline", "Harmful output rate <0.1%"],
  },
  {
    code: "AO-05", name: "Model Fine-Tuning",
    buyer: "Head of AI, Data Science Lead, CDO",
    outcome: "Domain-specific fine-tuned model outperforming general models on client tasks — with full IP ownership of fine-tuned weights.",
    deliverables: ["Training dataset curation", "Fine-tuning run (LoRA/QLoRA)", "Evaluation vs. benchmark + baseline", "Model card + documentation", "Production artifact in HiveOps registry"],
    methodology: "Data curation → Dataset preparation → Fine-tuning → Evaluation → Deployment",
    duration: "4–8 weeks", price: "$40,000",
    products: ["HiveForge", "HiveCompute", "HiveData", "HiveOps"],
    metrics: ["Outperforms baseline on target task by >15%", "Hallucination ≤ baseline", "Inference cost ≤ baseline"],
  },
  {
    code: "AO-06", name: "AI Evaluation & Benchmarking",
    buyer: "Head of AI, QA Lead, Chief Risk Officer",
    outcome: "Objective, reproducible evidence that AI systems meet quality, safety, and performance standards — sufficient for regulatory review or board presentation.",
    deliverables: ["Evaluation framework", "Benchmark dataset (curated + human-validated)", "Automated evaluation pipeline", "Baseline performance report", "Ongoing evaluation schedule", "Regulatory-ready report"],
    methodology: "NIST AI RMF evaluation × LLM-as-judge × human annotation",
    duration: "3–6 weeks", price: "$30,000",
    products: ["HiveEvaluation", "HiveData", "HiveObservatory"],
    metrics: ["Framework accepted by compliance/legal", "Baseline for all production AI systems", "Automated eval on every deployment"],
  },
  {
    code: "AO-07", name: "Platform Reliability Engineering (SRE for AI)",
    buyer: "CTO, VP Engineering, Platform Director",
    outcome: "AI platform meeting enterprise reliability standards with SLOs, proactive monitoring, and sub-minute incident detection.",
    deliverables: ["SLO definitions", "Monitoring + alerting configuration", "Runbook library", "Error budget policy", "On-call setup", "Incident response process", "Post-incident review template"],
    methodology: "Google SRE principles × SLO-based reliability engineering",
    duration: "6-week setup + ongoing monthly", price: "$12,000/month",
    products: ["HiveConsole", "HiveObservatory", "HiveOps"],
    metrics: ["Platform availability meeting SLO", "MTTD <5 min", "MTTR <30 min for P1"],
    isManaged: true,
  },
  {
    code: "AO-08", name: "Observability Implementation",
    buyer: "VP Engineering, Platform Director, Head of DevOps",
    outcome: "Complete visibility into performance, health, and behavior of all AI services — eliminating blind spots that cause silent failures.",
    deliverables: ["Distributed tracing setup (OpenTelemetry)", "Log aggregation", "AI-specific metrics instrumentation", "Custom dashboard suite", "Alerting rules + escalation paths"],
    methodology: "OpenTelemetry three-pillars (traces, metrics, logs) × AI-specific observability patterns",
    duration: "4–6 weeks", price: "$35,000",
    products: ["HiveObservatory", "HiveConsole", "HiveOps"],
    metrics: ["Trace coverage >95%", "All P1 services have dashboards", "Zero blind-spot incidents post-implementation"],
  },
  {
    code: "AO-09", name: "FinOps for AI",
    buyer: "CFO, VP Engineering, Head of FinOps",
    outcome: "AI infrastructure spending fully visible, accurately attributed, and optimized — reducing waste without compromising performance.",
    deliverables: ["AI cost inventory", "Cost attribution model (by team, product, use case)", "Waste identification report", "Optimization implementation", "Monthly FinOps dashboard", "Cost governance process"],
    methodology: "CNCF FinOps framework applied to AI workloads",
    duration: "4-week assessment + implementation", price: "$25,000 + 20% of documented savings",
    products: ["HiveCompute", "HiveOps", "HiveObservatory", "HiveModels"],
    metrics: ["AI spend visibility >90%", "Cost reduction >25%", "Cost per query trending down month-over-month"],
  },
  {
    code: "AO-10", name: "AI Performance Optimization",
    buyer: "VP Engineering, Head of AI, CTO",
    outcome: "AI applications demonstrably faster, cheaper to run, and more reliable — with documented before/after benchmarks.",
    deliverables: ["Performance baseline assessment", "Bottleneck identification", "Optimization implementations (caching, batching, quantization, distillation, infra tuning)", "Post-optimization benchmark", "Monitoring runbook"],
    methodology: "Measure → Profile → Hypothesize → Implement → Validate",
    duration: "3–6 weeks", price: "$35,000",
    products: ["HiveCompute", "HiveModels", "HiveOps", "HiveObservatory"],
    metrics: ["Latency P99 reduced >30%", "Cost/request reduced >20%", "Throughput improved >50%"],
  },
];

export default function OperationsServicesPage() {
  const [selected, setSelected] = useState<Code>("AO-01");
  const [inquired, setInquired] = useState(false);
  const svc = SERVICES.find(s => s.code === selected)!;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Services
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">Category C · 10 Services</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">AI Operations</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">AgentOps, MLOps, LLMOps, prompt engineering, fine-tuning, evaluation, SRE, observability, and FinOps. Managed retainers keep your AI systems reliable, safe, and cost-efficient at every stage of maturity.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="space-y-1">
          {SERVICES.map(s => (
            <button key={s.code} id={s.code.toLowerCase()} onClick={() => { setSelected(s.code); setInquired(false); }}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selected === s.code ? "border-yellow-500/50 bg-yellow-500/10" : "border-border bg-surface/40 hover:bg-surface-elevated/40"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">{s.code}</span>
                {s.isManaged && <span className="text-[9px] font-bold uppercase tracking-wider text-primary-accent border border-primary-accent/30 rounded-full px-1.5 py-0.5">managed</span>}
              </div>
              <p className="mt-0.5 text-xs font-semibold text-text-primary leading-snug">{s.name}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{s.price}</p>
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-border bg-surface/40 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">{svc.code}</span>
                {svc.isManaged && <span className="rounded-full border border-primary-accent/30 bg-primary-accent/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-accent">Managed Service</span>}
              </div>
              <h2 className="mt-1 text-xl font-bold text-text-primary">{svc.name}</h2>
              <p className="mt-1 text-xs text-text-secondary">Target buyer: {svc.buyer}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-primary-accent">{svc.price}</p>
              <p className="text-xs text-text-secondary">{svc.duration}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Business Outcome</p>
            <p className="text-sm text-text-primary">{svc.outcome}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Deliverables</p>
            <ul className="space-y-1">
              {svc.deliverables.map(d => <li key={d} className="flex items-start gap-2 text-xs text-text-secondary"><span className="text-primary-accent mt-0.5 shrink-0">✓</span>{d}</li>)}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Methodology</p>
              <p className="text-xs text-text-secondary">{svc.methodology}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Products Used</p>
              <div className="flex flex-wrap gap-1">
                {svc.products.map(p => <span key={p} className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary">{p}</span>)}
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Success Metrics</p>
            <div className="flex flex-wrap gap-2">
              {svc.metrics.map(m => <span key={m} className="rounded-full border border-primary-accent/30 bg-primary-accent/5 px-2 py-0.5 text-xs text-primary-accent">{m}</span>)}
            </div>
          </div>
          {inquired ? (
            <div className="rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-4 text-sm text-primary-accent">
              Inquiry received for {svc.code} — {svc.name}. Your account team will respond within 1 business day.
            </div>
          ) : (
            <button onClick={() => setInquired(true)} className="w-full rounded-xl border border-primary-accent bg-primary-accent/10 py-3 text-sm font-bold text-primary-accent hover:bg-primary-accent/20 transition-colors">
              Inquire about this engagement →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

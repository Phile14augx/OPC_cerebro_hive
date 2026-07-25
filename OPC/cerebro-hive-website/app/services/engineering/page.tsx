"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Code = "EI-01"|"EI-02"|"EI-03"|"EI-04"|"EI-05"|"EI-06"|"EI-07"|"EI-08"|"EI-09"|"EI-10";

const SERVICES: { code: Code; name: string; buyer: string; outcome: string; deliverables: string[]; methodology: string; duration: string; products: string[]; metrics: string[]; price: string; managed?: string }[] = [
  {
    code: "EI-01", name: "Enterprise RAG Implementation",
    buyer: "CDO, Head of Data Engineering, VP Engineering",
    outcome: "Production-grade RAG system giving AI agents accurate, cited answers from the client's enterprise knowledge base.",
    deliverables: ["Document ingestion pipeline", "Chunking/embedding strategy", "Vector DB setup and tuning", "Retrieval quality evaluation suite", "RAG API", "Admin interface", "Operational runbook"],
    methodology: "Discovery → Data Audit → Chunking Strategy → Pipeline Build → Evaluation → Tuning → Handoff",
    duration: "8–12 weeks", price: "$65,000",
    products: ["HiveVector", "HiveData", "HiveStorage", "CerebroSearch"],
    metrics: ["Retrieval precision@10 >85%", "Query latency <500ms P99", "Document coverage >90%"],
    managed: "RAG Pipeline Maintenance & Optimization (monthly tuning + quality monitoring)",
  },
  {
    code: "EI-02", name: "Knowledge Graph Engineering",
    buyer: "CDO, Head of Data Science, Chief Knowledge Officer",
    outcome: "Production-grade enterprise knowledge graph capturing business entities, relationships, and ontology for AI reasoning.",
    deliverables: ["Ontology design", "Entity extraction pipeline", "Graph population and validation", "Query interface", "Graph visualization", "Integration with CerebroSearch and CerebroArchive"],
    methodology: "Domain analysis → Ontology design → Entity extraction → Validation → Query optimization",
    duration: "10–16 weeks", price: "$85,000",
    products: ["HiveKnowledge", "HiveData", "HiveVector", "CerebroArchive"],
    metrics: ["Entity coverage >80%", "Relationship precision >85%", "Graph query <100ms"],
    managed: "Knowledge Graph Maintenance (monthly entity refresh + quality audits)",
  },
  {
    code: "EI-03", name: "Custom AI Agent Development",
    buyer: "VP Operations, LOB Owner, IT Director",
    outcome: "Purpose-built, production-deployed autonomous agents tailored to the client's specific workflows and policies.",
    deliverables: ["Agent design spec", "Implemented agent (Python + LangGraph)", "Tool integrations", "Evaluation suite", "Production deployment", "Monitoring dashboard", "Source code + documentation"],
    methodology: "Process Discovery → Agent Architecture → Tool Engineering → Build → Evaluation → Deployment → Handoff",
    duration: "4–10 weeks per agent", price: "$35,000 per agent",
    products: ["HiveForge", "HiveAgents", "CerebroAgent", "HiveEvaluation"],
    metrics: ["Task completion >90%", "Human intervention <10%", "Zero out-of-scope actions (48h monitored period)"],
    managed: "AgentOps (ongoing monitoring, prompt tuning, capability expansion)",
  },
  {
    code: "EI-04", name: "Workflow Automation Engineering",
    buyer: "VP Operations, COO, IT Director",
    outcome: "Automated, AI-augmented enterprise workflows eliminating manual effort and reducing error rates.",
    deliverables: ["Process documentation", "CerebroFlow pipeline implementation", "Integration connectors", "SLA monitoring", "Test suite", "Administrator training", "Operations runbook"],
    methodology: "Process Mining → Automation Scope → Flow Design → Integration Build → Testing → Go-Live → Hypercare",
    duration: "4–10 weeks per workflow", price: "$28,000 per workflow",
    products: ["CerebroFlow", "HiveAPI", "HiveAutomation", "HiveIdentity"],
    metrics: ["Workflow SLA adherence >99%", "Manual effort reduction >70%", "Error rate reduction >80%"],
    managed: "Flow Optimization Retainer",
  },
  {
    code: "EI-05", name: "AI Platform Deployment (Intelligence Mesh Setup)",
    buyer: "CTO, VP Infrastructure, Enterprise IT Director",
    outcome: "Fully operational, production-grade CerebroHive Intelligence Mesh deployed in client's cloud or on-premises environment.",
    deliverables: ["Infrastructure provisioning", "Security baseline configuration", "Validation test report", "SSO configuration", "Tenant onboarding", "Admin training", "Operations runbook"],
    methodology: "Plan → Provision → Configure → Validate → Go-Live → Hypercare",
    duration: "4–8 weeks", price: "$55,000",
    products: ["HiveCloud", "HiveDeploy", "HiveIdentity", "HiveNetwork", "HiveShield", "HiveConsole"],
    metrics: ["All health checks green", "SSO configured", "Security review passed", "First tenant onboarded"],
    managed: "Managed Platform Operations (24/7 monitoring, patching, capacity)",
  },
  {
    code: "EI-06", name: "API Integration Services",
    buyer: "IT Director, VP Engineering, Integration Architect",
    outcome: "Reliable, documented integrations between the Intelligence Mesh and existing enterprise systems.",
    deliverables: ["Integration spec", "Bidirectional connectors", "Error handling + retry logic", "End-to-end tests", "API documentation", "Monitoring alerts"],
    methodology: "System inventory → Integration mapping → Contract design → Build → Test → Monitor",
    duration: "2–6 weeks per integration set", price: "$18,000 per integration",
    products: ["HiveAPI", "HiveGateway", "CerebroFlow"],
    metrics: ["Integration uptime >99.9%", "Sync latency within SLA", "Zero data loss on failures"],
    managed: "Integration Health Monitoring",
  },
  {
    code: "EI-07", name: "Data Engineering & ETL",
    buyer: "CDO, Head of Data Engineering, Analytics Lead",
    outcome: "Clean, governed, AI-ready data pipelines from every source system producing high-quality datasets.",
    deliverables: ["Pipeline design", "dbt transformation models", "Data quality checks", "Data catalog entries", "Lineage documentation", "Monitoring dashboards", "Runbook"],
    methodology: "Source profiling → Schema design → Pipeline build → Quality gate → Production → Documentation",
    duration: "6–14 weeks", price: "$50,000",
    products: ["HiveData", "HiveLake", "HiveAnalytics"],
    metrics: ["Quality score >85", "Pipeline SLA >99%", "Lineage documented for 100% of pipelines"],
    managed: "Data Pipeline Management",
  },
  {
    code: "EI-08", name: "Enterprise Search Implementation",
    buyer: "CIO, Head of Knowledge Management, VP Engineering",
    outcome: "Production semantic search giving employees instant, accurate answers from the enterprise knowledge base.",
    deliverables: ["Federated search architecture", "Connector implementations", "Ranking model tuning", "Search analytics dashboard", "Access control configuration", "User acceptance testing"],
    methodology: "Crawl → Index → Tune → Deploy → Measure",
    duration: "6–10 weeks", price: "$55,000",
    products: ["CerebroSearch", "HiveVector", "HiveData", "HiveIdentity"],
    metrics: ["Precision@10 >80%", "Latency P99 <500ms", "Adoption rate >60% within 30 days"],
    managed: "Search Quality Maintenance",
  },
  {
    code: "EI-09", name: "Cloud Migration",
    buyer: "CIO, VP Infrastructure, VP Engineering",
    outcome: "Successful migration of on-premises AI workloads to cloud with improved performance, cost efficiency, and resilience.",
    deliverables: ["Migration assessment + plan", "Cloud architecture design", "Lift-and-shift/re-platform decisions", "Executed migration (zero data loss)", "Post-migration validation", "Cost optimization report"],
    methodology: "6Rs framework × AWS/Azure/GCP Well-Architected Framework",
    duration: "8–24 weeks", price: "$80,000",
    products: ["HiveCloud", "HiveDeploy", "HiveNetwork", "HiveStorage"],
    metrics: ["Zero data loss", "<4h downtime per service", "20%+ infrastructure cost reduction"],
    managed: "Cloud Cost Optimization Retainer",
  },
  {
    code: "EI-10", name: "Legacy Modernization",
    buyer: "CIO, VP Engineering — organizations with aging ERPs, custom applications, monoliths",
    outcome: "Incremental replacement of legacy systems with modern, AI-native equivalents — reducing technical debt without big-bang rewrite risk.",
    deliverables: ["Legacy system audit", "Modernization strategy", "Migration phase plan", "Phase 1 implementation", "Integration bridge to legacy", "Performance baseline comparison"],
    methodology: "Martin Fowler's Strangler Fig pattern × Domain-Driven Design",
    duration: "12–36 weeks (phased)", price: "$150,000 (Phase 1)",
    products: ["CerebroERP, CerebroCRM (relevant apps)", "HiveAPI"],
    metrics: ["Phase 1 on time + budget", "Legacy load reduced by target %", "Team capability to own modernization internally"],
    managed: "Modernization Program Management",
  },
];

export default function EngineeringServicesPage() {
  const [selected, setSelected] = useState<Code>("EI-01");
  const [inquired, setInquired] = useState(false);
  const svc = SERVICES.find(s => s.code === selected)!;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Services
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">Category B · 10 Services</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Engineering & Implementation</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">RAG systems, knowledge graphs, custom agents, workflow automation, platform deployments, and cloud migrations. Every engineering engagement ships production-grade, documented, and handed off with runbooks.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="space-y-1">
          {SERVICES.map(s => (
            <button key={s.code} id={s.code.toLowerCase()} onClick={() => { setSelected(s.code); setInquired(false); }}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selected === s.code ? "border-primary-accent/50 bg-primary-accent/10" : "border-border bg-surface/40 hover:bg-surface-elevated/40"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent">{s.code}</span>
              <p className="mt-0.5 text-xs font-semibold text-text-primary leading-snug">{s.name}</p>
              <p className="mt-0.5 text-xs text-text-secondary">from {s.price.split(" ")[0]}</p>
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-border bg-surface/40 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent">{svc.code}</span>
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
          {svc.managed && (
            <div className="rounded-xl border border-border bg-surface-elevated/40 p-3">
              <p className="text-xs font-semibold text-text-secondary">Managed service option: <span className="text-text-primary">{svc.managed}</span></p>
            </div>
          )}
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

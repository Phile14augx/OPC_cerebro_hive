import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

const SOLUTIONS = [
  {
    slug: "enterprise-ai",
    name: "Enterprise AI Strategy",
    category: "Strategy",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    tagline: "Board-approved AI roadmap in 4–6 weeks.",
    description: "Align AI investment with business strategy and produce a phased, ROI-sequenced implementation roadmap executives can defend to boards and investors.",
    deliverables: ["AI Maturity Assessment (10 dimensions)", "Opportunity Matrix (use cases ranked by value × feasibility)", "3-Year Implementation Roadmap", "Phase 1 Business Case with financial model", "Executive presentation deck"],
    timeline: "4–6 weeks",
    investment: "From $45,000",
    outcomes: ["Board-approved strategy", "Signed Phase 1 contract within 60 days", "Executive NPS >8"],
    products: ["CerebroStudio™", "HiveGovern™"],
    services: ["/services/strategy"],
    methodology: "Discover → Assess → Design → Validate (stakeholder interviews, system inventory, scoring model, executive workshop)",
  },
  {
    slug: "ai-agents",
    name: "AI Agents",
    category: "AI Runtime",
    color: "text-primary-accent",
    border: "border-primary-accent/30",
    bg: "bg-primary-accent/5",
    tagline: "Autonomous agents that complete real enterprise tasks.",
    description: "Purpose-built, production-deployed autonomous agents tailored to your specific workflows, policies, and systems — with full monitoring and human-in-the-loop controls.",
    deliverables: ["Agent design specification", "Implemented agent (production-grade)", "Tool integrations (APIs, databases, SaaS)", "Evaluation suite (>200 test cases)", "Monitoring dashboard", "Source code + documentation"],
    timeline: "4–10 weeks per agent",
    investment: "From $35,000 per agent",
    outcomes: ["Task completion >90%", "Human intervention <10%", "Zero out-of-scope actions (48h monitored period)"],
    products: ["HiveForge™", "HiveAgents™", "CerebroAgent™", "HiveEvaluation™"],
    services: ["/services/engineering"],
    methodology: "Process Discovery → Agent Architecture → Tool Engineering → Build → Evaluation → Deployment → Handoff",
  },
  {
    slug: "rag",
    name: "RAG Systems",
    category: "Knowledge",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    tagline: "Accurate, cited answers from your enterprise knowledge base.",
    description: "Production-grade RAG system giving AI agents accurate, cited answers from the client's enterprise knowledge base — covering documents, databases, and internal systems.",
    deliverables: ["Document ingestion pipeline", "Chunking/embedding strategy", "Vector DB setup and tuning", "Retrieval quality evaluation suite", "RAG API", "Admin interface", "Operational runbook"],
    timeline: "8–12 weeks",
    investment: "From $65,000",
    outcomes: ["Retrieval precision@10 >85%", "Query latency <500ms P99", "Document coverage >90%"],
    products: ["HiveVector™", "HiveData™", "HiveStorage™", "CerebroSearch™"],
    services: ["/services/engineering"],
    methodology: "Discovery → Data Audit → Chunking Strategy → Pipeline Build → Evaluation → Tuning → Handoff",
  },
  {
    slug: "document-ai",
    name: "Document AI",
    category: "Automation",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    tagline: "Intelligent extraction and processing from any document type.",
    description: "AI-powered document intelligence extracting structured data from contracts, invoices, forms, reports, and any other document type — with human-review workflow for exceptions.",
    deliverables: ["Document classification pipeline", "Entity extraction models", "Structured data output API", "Exception/review workflow", "Quality monitoring dashboard", "Audit trail"],
    timeline: "6–10 weeks",
    investment: "From $40,000",
    outcomes: ["Straight-through processing >70%", "Classification accuracy >95%", "Manual review reduced >60%"],
    products: ["CerebroArchive™", "HiveData™", "HiveVector™"],
    services: ["/services/engineering"],
    methodology: "Document audit → Model selection → Training data curation → Build → Evaluation → Production → Monitoring",
  },
  {
    slug: "knowledge-management",
    name: "Knowledge Management",
    category: "Knowledge",
    color: "text-teal-400",
    border: "border-teal-500/30",
    bg: "bg-teal-500/5",
    tagline: "Enterprise knowledge graph connecting people, systems, and expertise.",
    description: "Production-grade enterprise knowledge graph capturing business entities, relationships, and ontology — making enterprise knowledge findable, navigable, and AI-queryable.",
    deliverables: ["Ontology design", "Entity extraction pipeline", "Graph population and validation", "Query interface", "Graph visualization", "Integration with CerebroSearch and CerebroArchive"],
    timeline: "10–16 weeks",
    investment: "From $85,000",
    outcomes: ["Entity coverage >80%", "Relationship precision >85%", "Graph query <100ms"],
    products: ["HiveKnowledge™", "HiveData™", "HiveVector™", "CerebroArchive™"],
    services: ["/services/engineering"],
    methodology: "Domain analysis → Ontology design → Entity extraction → Validation → Query optimization",
  },
  {
    slug: "hyperautomation",
    name: "Hyperautomation",
    category: "Operations",
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    tagline: "End-to-end automation of complex, multi-step enterprise workflows.",
    description: "AI-augmented enterprise workflow automation eliminating manual effort at scale — combining CerebroFlow orchestration with AI decision-making at every step.",
    deliverables: ["Process documentation", "CerebroFlow pipeline implementation", "Integration connectors", "SLA monitoring", "Test suite", "Administrator training", "Operations runbook"],
    timeline: "4–10 weeks per workflow",
    investment: "From $28,000 per workflow",
    outcomes: ["Workflow SLA adherence >99%", "Manual effort reduction >70%", "Error rate reduction >80%"],
    products: ["CerebroFlow™", "HiveAPI™", "HiveAutomation™"],
    services: ["/services/engineering"],
    methodology: "Process Mining → Automation Scope → Flow Design → Integration Build → Testing → Go-Live → Hypercare",
  },
  {
    slug: "decision-intelligence",
    name: "Decision Intelligence",
    category: "Analytics",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    tagline: "AI-augmented decision-making with explainable recommendations.",
    description: "Decision intelligence platform combining predictive models, business rules, and explainable AI to give decision-makers actionable recommendations with full auditability.",
    deliverables: ["Decision model design", "Feature engineering pipeline", "Explainability layer (SHAP)", "Decision API", "Review/override workflow", "Audit trail", "Performance monitoring"],
    timeline: "8–14 weeks",
    investment: "From $60,000",
    outcomes: ["Decision cycle time -50%", "Explainability documented for all top decisions", "Bias assessment complete"],
    products: ["CerebroInsight™", "HiveModels™", "HiveData™", "HiveEvaluation™"],
    services: ["/services/engineering", "/services/operations"],
    methodology: "Decision mapping → Model design → Feature engineering → Build → Evaluation → Deployment → Monitoring",
  },
  {
    slug: "predictive-analytics",
    name: "Predictive Analytics",
    category: "Analytics",
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/5",
    tagline: "ML models that predict what matters before it happens.",
    description: "Production ML models for demand forecasting, churn prediction, anomaly detection, maintenance prediction, or any quantitative prediction task — with automated retraining and drift monitoring.",
    deliverables: ["Feature engineering pipeline", "Model training + evaluation", "Production deployment", "Automated retraining", "Drift detection", "Performance dashboard", "Model card documentation"],
    timeline: "6–12 weeks",
    investment: "From $50,000",
    outcomes: ["Forecast accuracy +15–30% vs. baseline", "Fully automated retraining", "Drift detection <24h MTTD"],
    products: ["HiveModels™", "HiveData™", "HiveOps™", "HiveObservatory™"],
    services: ["/services/operations"],
    methodology: "Problem framing → Data audit → Feature engineering → Model selection → Training → Evaluation → Deployment → Monitoring",
  },
  {
    slug: "customer-experience",
    name: "Customer Experience AI",
    category: "CX",
    color: "text-pink-400",
    border: "border-pink-500/30",
    bg: "bg-pink-500/5",
    tagline: "Personalized, AI-native customer interactions across every channel.",
    description: "AI-powered customer service, personalization, and engagement platform — reducing cost-to-serve while improving NPS and retention across digital, voice, and in-store channels.",
    deliverables: ["Customer 360 data model", "Conversational AI agent", "Personalization engine", "Channel integration (email, chat, voice)", "Analytics dashboard", "Agent handoff protocol"],
    timeline: "10–16 weeks",
    investment: "From $80,000",
    outcomes: ["AI containment rate >65%", "Customer NPS +5–10 points", "CSAT improvement >15%", "Cost-to-serve reduced >30%"],
    products: ["CerebroCustomer360™", "CerebroAgent™", "CerebroFlow™"],
    services: ["/services/engineering", "/services/industry"],
    methodology: "CX mapping → AI opportunity identification → Data foundation → Agent build → Channel integration → Pilot → Scale",
  },
  {
    slug: "erp-modernization",
    name: "ERP Modernization",
    category: "Enterprise Systems",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    tagline: "Replace legacy ERPs incrementally with AI-native equivalents.",
    description: "Incremental replacement of legacy ERPs using Martin Fowler's Strangler Fig pattern — adding AI-native capabilities progressively without big-bang rewrite risk.",
    deliverables: ["Legacy system audit", "Modernization strategy", "Migration phase plan", "Phase 1 implementation", "Integration bridge to legacy", "Performance baseline comparison"],
    timeline: "12–36 weeks (phased)",
    investment: "From $150,000 (Phase 1)",
    outcomes: ["Phase 1 on time + budget", "Legacy load reduced by target %", "Team capability to own modernization internally"],
    products: ["CerebroERP™", "CerebroCRM™", "HiveAPI™"],
    services: ["/services/engineering"],
    methodology: "Martin Fowler's Strangler Fig pattern × Domain-Driven Design",
  },
  {
    slug: "cloud-modernization",
    name: "Cloud Modernization",
    category: "Infrastructure",
    color: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
    tagline: "AI workloads migrated to cloud with improved performance and lower cost.",
    description: "Successful migration of on-premises AI workloads to cloud — AWS, GCP, or Azure — with 6Rs assessment, re-platform decisions, zero data loss, and post-migration optimization.",
    deliverables: ["Migration assessment + plan", "Cloud architecture design", "Lift-and-shift/re-platform decisions", "Executed migration (zero data loss)", "Post-migration validation", "Cost optimization report"],
    timeline: "8–24 weeks",
    investment: "From $80,000",
    outcomes: ["Zero data loss", "<4h downtime per service", "20%+ infrastructure cost reduction"],
    products: ["HiveCloud™", "HiveDeploy™", "HiveNetwork™", "HiveStorage™"],
    services: ["/services/engineering"],
    methodology: "6Rs framework × AWS/Azure/GCP Well-Architected Framework",
  },
  {
    slug: "ai-governance",
    name: "AI Governance",
    category: "Governance",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    tagline: "A running AI governance program — not just a policy document.",
    description: "Comprehensive AI governance framework and operating program satisfying EU AI Act, NIST AI RMF, and ISO 42001 — with active monitoring, quarterly reviews, and continuous regulatory alignment.",
    deliverables: ["AI Governance Policy Suite (implemented)", "AI System Registry (operational)", "Risk assessment process", "Model Risk Management process", "Quarterly Governance Report template", "Board AI Governance Dashboard"],
    timeline: "10–16 weeks setup + ongoing",
    investment: "From $90,000 setup + $15,000/month",
    outcomes: ["Program approved by board", "AI system inventory 100% complete", "Zero governance violations first 90 days"],
    products: ["HiveGovern™", "CerebroCompliance™", "HiveEvaluation™"],
    services: ["/services/security", "/services/strategy"],
    methodology: "ISO 42001 × NIST AI RMF × EU AI Act compliance mapping",
  },
];

export async function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SOLUTIONS.find((x) => x.slug === slug);
  if (!s) return { title: "Solution Not Found" };
  return {
    title: `${s.name} — Enterprise AI Solution`,
    description: s.description,
  };
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SOLUTIONS.find((x) => x.slug === slug);
  if (!s) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-8">
      <Link
        href="/solutions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"
      >
        <ArrowLeft size={14} /> Solutions
      </Link>

      <div className="mt-6">
        <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${s.color}`}>{s.category}</span>
        <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">{s.name}</h1>
        <p className="mt-3 text-lg text-text-secondary">{s.tagline}</p>
      </div>

      <div className={`mt-8 rounded-2xl border ${s.border} ${s.bg} p-6`}>
        <p className="text-sm text-text-primary leading-relaxed">{s.description}</p>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Timeline</span>
            <p className="text-text-primary font-semibold mt-0.5">{s.timeline}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Investment</span>
            <p className={`font-bold mt-0.5 ${s.color}`}>{s.investment}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Deliverables</p>
          <ul className="space-y-2">
            {s.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm text-text-secondary">
                <CheckCircle size={14} className={`${s.color} mt-0.5 shrink-0`} />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Success Metrics</p>
          <div className="space-y-2">
            {s.outcomes.map((o) => (
              <div key={o} className={`rounded-lg border ${s.border} ${s.bg} px-3 py-2 text-xs font-semibold ${s.color}`}>
                {o}
              </div>
            ))}
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 mt-6">Methodology</p>
          <p className="text-sm text-text-secondary">{s.methodology}</p>

          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 mt-6">Products Used</p>
          <div className="flex flex-wrap gap-1.5">
            {s.products.map((p) => (
              <span key={p} className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary">{p}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-surface/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-text-primary">Ready to start?</p>
          <p className="text-sm text-text-secondary mt-0.5">Book a discovery call — we'll scope the engagement in 1 hour.</p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Book Discovery Call <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}

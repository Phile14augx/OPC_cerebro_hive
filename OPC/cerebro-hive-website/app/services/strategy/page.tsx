"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ServiceCode = "SA-01"|"SA-02"|"SA-03"|"SA-04"|"SA-05"|"SA-06"|"SA-07"|"SA-08"|"SA-09"|"SA-10";

const SERVICES: { code: ServiceCode; name: string; buyer: string; outcome: string; deliverables: string[]; methodology: string; duration: string; products: string[]; metrics: string[]; price: string; managed?: string }[] = [
  {
    code: "SA-01", name: "Enterprise AI Strategy & Roadmap",
    buyer: "C-Suite (CEO, CIO, CDO) — Fortune 500 / Mid-Market",
    outcome: "Alignment of AI investment with business strategy; a phased, ROI-sequenced implementation roadmap executives can defend to boards.",
    deliverables: ["AI Maturity Assessment", "Opportunity Matrix (use cases ranked by value × feasibility)", "3-Year Implementation Roadmap", "Phase 1 Business Case", "Executive Deck"],
    methodology: "Discover → Assess → Design → Validate (stakeholder interviews, system inventory, scoring model, executive workshop)",
    duration: "4–6 weeks", price: "$45,000",
    products: ["Strategic advisory — platform-agnostic"],
    metrics: ["Board-approved strategy", "Signed Phase 1 contract", "Executive NPS >8"],
    managed: "Annual AI Strategy Retainer (quarterly roadmap reviews + industry trend briefings)",
  },
  {
    code: "SA-02", name: "AI Readiness Assessment",
    buyer: "CIO, CDO, Head of Digital Transformation",
    outcome: "Objective view of AI readiness across data, infrastructure, talent, governance, and culture — with prioritized remediation plan.",
    deliverables: ["Readiness Scorecard (10 dimensions, 0–5 scale)", "Data Quality Audit", "Infrastructure Gap Analysis", "Talent Capability Map", "Prioritized 90-Day Quick-Win Plan"],
    methodology: "Structured interviews + document review + technical workshops + scoring model",
    duration: "2–3 weeks", price: "$18,000",
    products: ["Assessment phase — platform-agnostic"],
    metrics: ["Stakeholder agreement on score", "Quick-Win plan adopted"],
    managed: "Quarterly Readiness Re-Assessment",
  },
  {
    code: "SA-03", name: "AI Transformation Roadmap (Departmental)",
    buyer: "VP/Director of Finance, Operations, HR, or Supply Chain",
    outcome: "Department-specific AI plan mapping existing workflows to AI-augmented future states with concrete targets.",
    deliverables: ["Process Inventory", "AI Opportunity Map", "Prioritized Automation Backlog", "Efficiency Gains Model", "Change Management Plan", "12-Month Roadmap"],
    methodology: "Value-Stream Mapping → Process Mining → AI Opportunity Scoring → Roadmap Design",
    duration: "3–4 weeks", price: "$28,000",
    products: ["CerebroFlow (process mapping)", "HiveData (process log analysis)"],
    metrics: ["Department sign-off", "KPIs defined", "Phase 1 initiated within 60 days"],
    managed: "Monthly Transformation Progress Reviews",
  },
  {
    code: "SA-04", name: "Architecture Design (Intelligence Mesh Blueprint)",
    buyer: "Enterprise Architects, CTOs",
    outcome: "Secure, scalable technical blueprint for deploying the Intelligence Mesh in the client's private cloud or on-premises environment.",
    deliverables: ["Architecture Diagrams", "Security Model", "Data Residency Plan", "API Integration Spec", "Migration Plan", "Architecture Decision Records (ADRs)"],
    methodology: "TOGAF ADM × Cloud-Native Design × Zero-Trust Architecture",
    duration: "6–8 weeks", price: "$65,000",
    products: ["HiveCloud", "HiveNetwork", "HiveShield", "HiveIdentity"],
    metrics: ["Architecture board approval", "Zero critical security findings", "CISO sign-off"],
    managed: "Architecture Review Board participation (quarterly compliance reviews)",
  },
  {
    code: "SA-05", name: "Data Strategy & Governance Design",
    buyer: "CDO, Head of Data Engineering, Chief Analytics Officer",
    outcome: "Data transformed from a liability into a governed, high-quality asset AI systems can reliably consume.",
    deliverables: ["Data Domain Map", "Ownership Model (RACI)", "Quality Standards", "Governance Operating Model", "MDM Strategy", "Catalog Adoption Plan", "18-Month Data Roadmap"],
    methodology: "Data Mesh principles × DAMA-DMBOK governance framework",
    duration: "4–6 weeks", price: "$40,000",
    products: ["HiveData", "HiveLake", "HiveKnowledge"],
    metrics: ["Governance committee established", "Catalog populated for priority domains", "Quality baseline set"],
    managed: "Data Governance Office as a Service (fractional CDO service)",
  },
  {
    code: "SA-06", name: "AI Governance Framework Design",
    buyer: "CCO, CRO, CISO, Legal",
    outcome: "Comprehensive AI governance framework satisfying EU AI Act, NIST AI RMF, and ISO 42001 requirements.",
    deliverables: ["AI Risk Taxonomy", "AI System Inventory", "Risk Assessment Methodology", "Policy Set", "Ethics Charter", "Model Risk Management Framework", "Governance Operating Model"],
    methodology: "NIST AI RMF × ISO 42001 × EU AI Act compliance mapping",
    duration: "6–10 weeks", price: "$55,000",
    products: ["HiveGovern", "CerebroCompliance", "HiveShield"],
    metrics: ["Policy approved by board", "System inventory complete", "First AI risk assessment completed"],
    managed: "AI Governance Program Management (ongoing regulatory monitoring + quarterly reviews)",
  },
  {
    code: "SA-07", name: "Responsible AI Advisory",
    buyer: "CAIO, Legal, Marketing/Brand",
    outcome: "Confidence that AI systems reflect organizational values, treat customers fairly, and won't create reputational or legal liability.",
    deliverables: ["Fairness Assessment", "Bias Detection Report", "Explainability Audit", "Responsible AI Principles", "Remediation Priority List"],
    methodology: "IBM AI Fairness 360 × Fairlearn × SHAP explainability",
    duration: "3–5 weeks", price: "$35,000",
    products: ["HiveEvaluation", "HiveShield"],
    metrics: ["Zero high-severity fairness findings in production", "Explainability documented for top-5 decisions"],
    managed: "Quarterly AI Ethics Review",
  },
  {
    code: "SA-08", name: "AI Center of Excellence Design",
    buyer: "CEO, CIO, CPO — scaling AI from pilots to enterprise-wide",
    outcome: "A functioning AI CoE that can own, govern, and scale AI adoption without external consultants.",
    deliverables: ["CoE Charter", "Operating Model", "Role Definitions", "Governance Processes", "Technology Standards", "Capability Building Plan", "CoE Launch Playbook"],
    methodology: "McKinsey Operating Model Design × Agile CoE patterns",
    duration: "8–12 weeks", price: "$75,000",
    products: ["CerebroLearn (training programs)", "HiveGovern (governance tooling)"],
    metrics: ["Charter approved", "First cross-functional AI team formed", "Training launched within 90 days"],
    managed: "CoE Coaching Program (monthly advisory + peer benchmarking)",
  },
  {
    code: "SA-09", name: "Executive AI Leadership Workshops",
    buyer: "CEO, Board of Directors, C-Suite",
    outcome: "Leadership teams that understand AI deeply enough to make sound strategic decisions and communicate confidently with stakeholders.",
    deliverables: ["Custom curriculum", "AI Strategy Simulation", "Expert Q&A", "Post-Workshop Briefing Pack"],
    methodology: "Experiential learning — minimal slides, maximum hands-on demonstration and scenario discussion",
    duration: "Half-day to 2-day intensive", price: "$12,000 (half-day, up to 20 participants)",
    products: ["CerebroStudio (live demo)", "CerebroAgent (live demo)"],
    metrics: ["Participant confidence score +40% (pre/post)", "Executive sponsor commits to AI initiative within 30 days"],
    managed: "Quarterly AI Briefings for Board/C-Suite",
  },
  {
    code: "SA-10", name: "Digital Transformation Advisory",
    buyer: "CEO, COO — full-organization transformation programs",
    outcome: "Coherent digital transformation where AI and automation integrate with process redesign, technology modernization, and change management.",
    deliverables: ["Digital Maturity Baseline", "Transformation Vision", "Initiative Portfolio", "Operating Model Design", "Change Management Strategy", "Board-Ready Business Case"],
    methodology: "McKinsey Three Horizons × Kotter 8-Step Change Model",
    duration: "8–16 weeks", price: "$120,000",
    products: ["Full CerebroHive suite (advisory mapping)"],
    metrics: ["Program approved and funded", "PMO established", "First initiative in flight within 90 days"],
    managed: "Transformation Program Director as a Service",
  },
];

export default function StrategyServicesPage() {
  const [selected, setSelected] = useState<ServiceCode>("SA-01");
  const svc = SERVICES.find(s => s.code === selected)!;
  const [inquired, setInquired] = useState(false);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Services
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">Category A · 10 Services</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Strategy & Advisory</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">Executive AI strategy, readiness assessments, governance frameworks, and transformation advisory. Every engagement produces board-ready deliverables backed by proven methodology.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Service list */}
        <nav className="space-y-1">
          {SERVICES.map(s => (
            <button key={s.code} id={s.code.toLowerCase()} onClick={() => { setSelected(s.code); setInquired(false); }}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selected === s.code ? "border-purple-500/50 bg-purple-500/10" : "border-border bg-surface/40 hover:bg-surface-elevated/40"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">{s.code}</span>
              <p className="mt-0.5 text-xs font-semibold text-text-primary leading-snug">{s.name}</p>
              <p className="mt-0.5 text-xs text-text-secondary">from {s.price.split(" ")[0]}</p>
            </button>
          ))}
        </nav>

        {/* Detail panel */}
        <div className="rounded-2xl border border-border bg-surface/40 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">{svc.code}</span>
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
              {svc.deliverables.map(d => (
                <li key={d} className="flex items-start gap-2 text-xs text-text-secondary">
                  <span className="text-primary-accent mt-0.5 shrink-0">✓</span>{d}
                </li>
              ))}
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

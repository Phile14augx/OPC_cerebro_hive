"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Code = "IS-01"|"IS-02"|"IS-03"|"IS-04"|"IS-05"|"IS-06"|"IS-07"|"IS-08"|"IS-09"|"IS-10";

const SERVICES: { code: Code; name: string; vertical: string; buyer: string; outcome: string; deliverables: string[]; duration: string; products: string[]; metrics: string[]; price: string; managed: string }[] = [
  {
    code: "IS-01", name: "Healthcare AI Transformation", vertical: "Healthcare",
    buyer: "CIO, CMO, VP Digital Health — Hospitals, Health Systems, Payers",
    outcome: "AI-enabled clinical and operational workflows reducing admin burden, accelerating clinical decisions, improving outcomes — within HIPAA compliance.",
    deliverables: ["Clinical AI use case prioritization", "Prior authorization automation", "Clinical documentation AI", "Revenue cycle optimization", "HIPAA compliance configuration", "Physician adoption playbook"],
    duration: "12–24 weeks", price: "$150,000",
    products: ["CerebroFlow", "CerebroAgent", "CerebroCompliance", "HiveIdentity (HIPAA config)", "HiveGovern"],
    metrics: ["Prior auth turnaround reduced >40%", "Clinical documentation time reduced >25%", "HIPAA compliance verified"],
    managed: "Healthcare AI Operations",
  },
  {
    code: "IS-02", name: "Banking & Financial Services Modernization", vertical: "Banking",
    buyer: "CIO, CDO, Head of Digital — Retail Banks, Investment Banks",
    outcome: "AI-powered banking operations reducing cost-to-serve, accelerating compliance, improving CX — within SOC 2, PCI-DSS, and banking regulatory frameworks.",
    deliverables: ["AI use case roadmap (fraud, credit, KYC, service)", "Model risk management framework", "Regulatory compliance configuration", "Customer 360 data model", "AML/fraud detection pipeline", "Compliance reporting automation"],
    duration: "16–32 weeks", price: "$200,000",
    products: ["CerebroCustomer360", "CerebroCompliance", "HiveData", "HiveShield", "HiveGovern", "CerebroFinance"],
    metrics: ["Fraud detection +20%", "KYC processing time reduced >50%", "SR 11-7 compliance validated by internal audit"],
    managed: "Financial Services AI Operations",
  },
  {
    code: "IS-03", name: "Insurance AI Enablement", vertical: "Insurance",
    buyer: "CIO, Chief Actuary, Head of Underwriting — P&C, Life, Health Insurers",
    outcome: "AI-augmented underwriting, claims, and customer service improving combined ratios and retention.",
    deliverables: ["Underwriting AI model", "Claims triage automation", "Fraud detection pipeline", "Policy document intelligence", "Regulatory reporting automation", "FNOL automation"],
    duration: "12–20 weeks", price: "$140,000",
    products: ["CerebroAgent", "CerebroFlow", "CerebroSearch", "HiveData", "HiveGovern"],
    metrics: ["Straight-through processing >60%", "Claims cycle time reduced >30%", "Fraud detection +25%"],
    managed: "Insurance AI Operations",
  },
  {
    code: "IS-04", name: "Manufacturing Industry 4.0", vertical: "Manufacturing",
    buyer: "COO, VP Operations, Head of Manufacturing",
    outcome: "Smart factory operations — predictive maintenance, quality intelligence, supply chain optimization, autonomous production planning.",
    deliverables: ["IoT data integration (SCADA/MES)", "Predictive maintenance model", "Visual quality inspection (CV)", "Production scheduling optimization", "OEE improvement dashboard"],
    duration: "16–28 weeks", price: "$180,000",
    products: ["CerebroAssets", "CerebroQuality", "HiveData", "HiveCompute (CV inference)"],
    metrics: ["OEE improvement >8 percentage points", "Unplanned downtime reduced >30%", "Defect escape rate reduced >40%"],
    managed: "Smart Factory AI Operations",
  },
  {
    code: "IS-05", name: "Retail & eCommerce Intelligence", vertical: "Retail",
    buyer: "COO, Chief Merchant, VP Digital — Retailers, eCommerce brands",
    outcome: "AI-powered retail operations — demand forecasting, personalization, inventory optimization — improving margins and customer LTV.",
    deliverables: ["Customer 360 data model", "Demand forecast model", "Personalization engine", "Inventory optimization pipeline", "Pricing intelligence", "Customer service AI", "Attribution modeling"],
    duration: "12–20 weeks", price: "$120,000",
    products: ["CerebroCustomer360", "CerebroInsight", "HiveData", "CerebroFlow"],
    metrics: ["Forecast accuracy +15%", "Inventory turns +10%", "Customer NPS +5 points"],
    managed: "Retail AI Operations",
  },
  {
    code: "IS-06", name: "Supply Chain Optimization", vertical: "Supply Chain",
    buyer: "COO, CSCO, VP Procurement",
    outcome: "Resilient, AI-optimized supply chains predicting disruptions, optimizing inventory, and automating supplier management.",
    deliverables: ["Supply chain visibility platform", "Disruption prediction model", "Demand sensing pipeline", "Supplier risk scoring", "Inventory optimization", "Procurement automation", "Control tower dashboard"],
    duration: "14–24 weeks", price: "$160,000",
    products: ["CerebroProcurement", "HiveData", "CerebroInsight", "CerebroFlow"],
    metrics: ["Inventory days-on-hand reduced >15%", "Supplier on-time delivery +10%", "Disruption prediction lead time >14 days"],
    managed: "Supply Chain Intelligence Operations",
  },
  {
    code: "IS-07", name: "Government Digital Transformation", vertical: "Government",
    buyer: "Agency CIO, Director of Digital Services — Federal, State, Local Government",
    outcome: "AI-enabled government services that are faster, more accessible, and cost-effective — meeting highest security and privacy standards.",
    deliverables: ["Citizen service AI", "Document intelligence (form processing)", "Procurement automation", "Compliance + audit automation", "FedRAMP/IL-compliant deployment configuration"],
    duration: "16–36 weeks", price: "$200,000",
    products: ["CerebroAgent", "CerebroFlow", "HiveGovern (FedRAMP config)", "HiveIdentity (PIV/CAC)", "HiveShield"],
    metrics: ["Citizen request resolution time reduced >40%", "Processing error rate reduced >50%", "ATO achieved"],
    managed: "Government AI Operations (cleared personnel only for IL environments)",
  },
  {
    code: "IS-08", name: "Education & Learning Transformation", vertical: "Education",
    buyer: "CIO/CITO, VP Academic Affairs, Head of L&D — Universities, K-12 Districts, Corporate Learning",
    outcome: "AI-powered learning environments personalizing education at scale and demonstrably improving learning outcomes.",
    deliverables: ["Adaptive learning platform (CerebroLearn)", "AI tutoring agent", "Curriculum analytics", "Student engagement monitoring", "Administrative AI", "Educator AI assistant"],
    duration: "10–16 weeks", price: "$90,000",
    products: ["CerebroLearn", "CerebroAgent", "HiveData", "HiveIdentity"],
    metrics: ["Course completion +20%", "Learning outcome score +15%", "Educator admin time reduced >30%"],
    managed: "Learning Platform Operations",
  },
  {
    code: "IS-09", name: "Energy & Utilities Optimization", vertical: "Energy",
    buyer: "COO, VP Operations, Head of Grid Technology — Utilities, Oil & Gas, Renewables",
    outcome: "AI-optimized energy operations — predictive maintenance, demand forecasting, renewable integration, regulatory reporting automation.",
    deliverables: ["Grid asset health monitoring (IoT → predictive maintenance)", "Energy demand forecast", "Renewable generation prediction", "Outage prediction and prevention", "Regulatory reporting automation", "Operator AI assistant"],
    duration: "16–28 weeks", price: "$180,000",
    products: ["CerebroAssets", "HiveData", "CerebroFlow", "HiveCompute (time-series ML)", "HiveGovern"],
    metrics: ["Asset failure prediction accuracy >85%", "Outage prevention +20%", "Regulatory reporting time reduced >50%"],
    managed: "Energy AI Operations",
  },
  {
    code: "IS-10", name: "Telecommunications AI Transformation", vertical: "Telecom",
    buyer: "CIO, VP Network Operations, Chief Customer Officer — MNOs, ISPs, Cable Operators",
    outcome: "AI-driven network operations, customer experience, and revenue assurance — reducing opex, improving NPS, monetizing network intelligence.",
    deliverables: ["Network anomaly detection (AI on NetFlow/SNMP)", "Predictive churn model", "Customer service AI", "Revenue assurance automation", "5G slice optimization", "Capacity forecasting"],
    duration: "14–24 weeks", price: "$175,000",
    products: ["HiveData", "CerebroCustomer360", "CerebroAgent", "CerebroFlow", "HiveObservatory"],
    metrics: ["Network anomaly MTTD reduced >60%", "Churn rate reduced >10%", "Customer service AI containment >65%"],
    managed: "Telco AI Operations",
  },
];

const VERTICAL_COLOR: Record<string, string> = {
  Healthcare: "text-rose-400", Banking: "text-blue-400", Insurance: "text-indigo-400",
  Manufacturing: "text-orange-400", Retail: "text-pink-400", "Supply Chain": "text-amber-400",
  Government: "text-slate-400", Education: "text-teal-400", Energy: "text-yellow-400", Telecom: "text-cyan-400",
};

export default function IndustryServicesPage() {
  const [selected, setSelected] = useState<Code>("IS-01");
  const [inquired, setInquired] = useState(false);
  const svc = SERVICES.find(s => s.code === selected)!;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Services
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">Category E · 10 Services</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Industry Solutions</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">Vertical-specific AI transformation programs for healthcare, banking, insurance, manufacturing, retail, supply chain, government, education, energy, and telecom. Each engagement is pre-built on proven patterns for the industry's unique regulatory and operational requirements.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="space-y-1">
          {SERVICES.map(s => (
            <button key={s.code} id={s.code.toLowerCase()} onClick={() => { setSelected(s.code); setInquired(false); }}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selected === s.code ? "border-orange-500/50 bg-orange-500/10" : "border-border bg-surface/40 hover:bg-surface-elevated/40"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">{s.code}</span>
                <span className={`text-[9px] font-bold ${VERTICAL_COLOR[s.vertical]}`}>{s.vertical}</span>
              </div>
              <p className="mt-0.5 text-xs font-semibold text-text-primary leading-snug">{s.name}</p>
              <p className="mt-0.5 text-xs text-text-secondary">from {s.price}</p>
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-border bg-surface/40 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">{svc.code}</span>
                <span className={`text-xs font-bold ${VERTICAL_COLOR[svc.vertical]}`}>{svc.vertical}</span>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Products Used</p>
            <div className="flex flex-wrap gap-1">
              {svc.products.map(p => <span key={p} className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary">{p}</span>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Success Metrics</p>
            <div className="flex flex-wrap gap-2">
              {svc.metrics.map(m => <span key={m} className="rounded-full border border-primary-accent/30 bg-primary-accent/5 px-2 py-0.5 text-xs text-primary-accent">{m}</span>)}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-elevated/40 p-3">
            <p className="text-xs font-semibold text-text-secondary">Managed service option: <span className="text-text-primary">{svc.managed}</span></p>
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

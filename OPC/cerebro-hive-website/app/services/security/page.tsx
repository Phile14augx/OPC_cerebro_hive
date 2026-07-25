"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Code = "SG-01"|"SG-02"|"SG-03"|"SG-04"|"SG-05"|"SG-06"|"SG-07"|"SG-08"|"SG-09"|"SG-10";

const SERVICES: { code: Code; name: string; buyer: string; outcome: string; deliverables: string[]; methodology: string; duration: string; products: string[]; metrics: string[]; price: string; managed?: string }[] = [
  {
    code: "SG-01", name: "AI Security Assessment",
    buyer: "CISO, Head of Security, Chief Risk Officer",
    outcome: "Objective assessment of AI system security posture with prioritized remediation roadmap.",
    deliverables: ["AI Attack Surface Map", "Vulnerability Report (CVSS-scored)", "Prompt Injection Test Results", "DLP Control Assessment", "Agent Permission Audit", "Remediation Matrix", "Executive Summary"],
    methodology: "OWASP LLM Top 10 × NIST AI RMF security evaluation",
    duration: "3–4 weeks", price: "$40,000",
    products: ["HiveShield", "HiveIdentity", "HiveGovern"],
    metrics: ["All critical findings remediated in 30 days", "Security posture score +40%"],
    managed: "Continuous AI Security Monitoring",
  },
  {
    code: "SG-02", name: "AI Red Teaming",
    buyer: "CISO, Head of AI, CRO — regulated industries, high-risk AI deployments",
    outcome: "Independently verified assurance that AI systems resist adversarial attacks, jailbreaks, data exfiltration, and agent manipulation.",
    deliverables: ["Red Team Scope", "Attack Execution Report", "Successful Exploitation Report (with reproduction steps)", "Severity-ranked Findings", "Remediation Guidance", "Attestation Letter"],
    methodology: "PTES adapted for AI × MITRE ATLAS",
    duration: "2–4 weeks", price: "$55,000",
    products: ["HiveShield Red Team module"],
    metrics: ["Full attack matrix coverage", "Zero critical unresolved findings at sign-off"],
    managed: "Quarterly AI Red Team",
  },
  {
    code: "SG-03", name: "Compliance Automation",
    buyer: "CCO, Head of GRC, Internal Audit",
    outcome: "Continuous, automated compliance evidence collection — replacing manual audit prep with real-time compliance posture.",
    deliverables: ["Control framework mapping", "Automated evidence collector config", "Compliance dashboard", "Audit trail configuration", "First audit package (ready for external auditor)"],
    methodology: "Framework-specific: SOC 2, ISO 27001, HIPAA, PCI-DSS, GDPR, NIST CSF",
    duration: "6–10 weeks", price: "$50,000",
    products: ["CerebroCompliance", "HiveGovern", "HiveShield", "HiveIdentity"],
    metrics: ["Automated evidence >80% of controls", "Audit prep time reduced >60%"],
    managed: "Continuous Compliance Management",
  },
  {
    code: "SG-04", name: "Enterprise Risk Assessment",
    buyer: "CRO, CFO, Board Risk Committee",
    outcome: "Comprehensive enterprise AI risk register with quantified exposure and mitigation roadmap satisfying board and regulator expectations.",
    deliverables: ["AI Risk Taxonomy", "Risk Register (50+ risks scored and owned)", "Quantitative Risk Model (financial exposure)", "Top-10 Mitigation Roadmap", "Board Risk Report Template"],
    methodology: "ISO 31000 × FAIR quantitative model",
    duration: "4–6 weeks", price: "$45,000",
    products: ["HiveGovern", "CerebroCompliance"],
    metrics: ["Risk register accepted by CRO and board", "Top-5 risks have active mitigations in 60 days"],
    managed: "Quarterly Risk Register Review",
  },
  {
    code: "SG-05", name: "Identity Modernization",
    buyer: "CISO, Head of IAM, IT Director",
    outcome: "Modern zero-trust identity architecture supporting SSO for humans and governed identity for autonomous agents.",
    deliverables: ["IAM Architecture Design", "SSO Implementation (SAML/OIDC)", "MFA rollout", "Agent Identity Framework", "Legacy credential deprecation plan", "Admin training"],
    methodology: "NIST SP 800-207 Zero Trust Architecture × CISA Zero Trust Maturity Model",
    duration: "6–10 weeks", price: "$55,000",
    products: ["HiveIdentity"],
    metrics: ["SSO adoption >95%", "MFA 100% privileged users", "Zero shared credentials in production"],
    managed: "IAM Operations (ongoing identity governance + access reviews)",
  },
  {
    code: "SG-06", name: "Zero Trust Implementation",
    buyer: "CISO, VP Infrastructure, Head of Network Security",
    outcome: "Enterprise network security aligned with zero-trust principles — no implicit trust, least-privilege access, lateral movement architecturally impossible.",
    deliverables: ["Zero Trust Architecture Design", "Network microsegmentation", "mTLS rollout", "Identity-aware proxy config", "East-west traffic monitoring", "Security validation report"],
    methodology: "NIST SP 800-207 × CISA Zero Trust Maturity Model",
    duration: "8–14 weeks", price: "$75,000",
    products: ["HiveNetwork", "HiveIdentity", "HiveShield"],
    metrics: ["100% mTLS coverage", "Zero implicit trust", "Microsegmentation validated by pen test"],
    managed: "Zero Trust Policy Management",
  },
  {
    code: "SG-07", name: "AI Governance Program",
    buyer: "CCO, General Counsel, Board",
    outcome: "A running AI governance program — not just a policy document — with active monitoring, quarterly reviews, and continuous regulatory alignment.",
    deliverables: ["AI Governance Policy Suite (implemented)", "AI System Registry (operational)", "Risk assessment process", "Model Risk Management process", "Quarterly Governance Report template", "Board AI Governance Dashboard"],
    methodology: "ISO 42001 × NIST AI RMF × EU AI Act compliance",
    duration: "10–16 weeks setup + ongoing", price: "$90,000 setup + $15,000/month",
    products: ["HiveGovern", "CerebroCompliance", "HiveEvaluation"],
    metrics: ["Program approved by board", "AI system inventory 100% complete", "Zero governance violations first 90 days"],
    managed: "Governance Program as a Service",
  },
  {
    code: "SG-08", name: "Audit Automation",
    buyer: "Head of Internal Audit, CCO",
    outcome: "Automated audit function continuously testing controls and producing audit-ready evidence — reducing external audit cost 60%+.",
    deliverables: ["Automated control testing scripts", "Continuous monitoring dashboard", "Evidence collection automation", "Audit trail configuration", "First automated audit report", "External auditor walkthrough package"],
    methodology: "Risk-based auditing × automated evidence collection × continuous auditing framework",
    duration: "6–8 weeks", price: "$45,000",
    products: ["HiveGovern", "CerebroCompliance", "HiveShield", "HiveIdentity"],
    metrics: ["Automated evidence >75% of controls", "Audit prep time reduced >60%", "External auditor accepts automated evidence"],
    managed: "Continuous Audit as a Service",
  },
  {
    code: "SG-09", name: "Data Privacy Assessment",
    buyer: "Chief Privacy Officer, Legal, CISO",
    outcome: "Complete visibility into how personal data flows through AI systems with remediation achieving GDPR, CCPA, HIPAA compliance.",
    deliverables: ["Data Flow Map (all PII flows)", "Privacy Risk Assessment", "Data Processing Inventory (ROPA)", "Consent Management Review", "Privacy by Design recommendations", "DSAR process design"],
    methodology: "GDPR Article 30 data mapping × Privacy by Design × IAPP CIPM framework",
    duration: "4–6 weeks", price: "$38,000",
    products: ["HiveData", "HiveGovern", "HiveShield", "HiveStorage"],
    metrics: ["100% PII flows documented", "Privacy risk score reduced", "DSAR process compliant and tested"],
    managed: "Privacy Compliance Monitoring",
  },
  {
    code: "SG-10", name: "Business Continuity Planning (AI Systems)",
    buyer: "CIO, CISO, COO",
    outcome: "Documented and tested BCP for AI systems ensuring operations continue during failures, outages, or cyberattacks.",
    deliverables: ["AI System Criticality Assessment", "BCP for top-10 AI-dependent processes", "DR Architecture Design", "RTO/RPO documentation", "Tabletop exercise (facilitated)", "DR test results", "Executive BCP summary"],
    methodology: "ISO 22301 BCM × NIST SP 800-34 IT contingency planning",
    duration: "4–6 weeks", price: "$35,000",
    products: ["HiveCloud", "HiveDeploy", "HiveStorage", "HiveConsole"],
    metrics: ["BCP approved", "DR test validates RTO/RPO", "All critical AI dependencies have failover documented"],
    managed: "Annual BCP Review + DR Test",
  },
];

export default function SecurityServicesPage() {
  const [selected, setSelected] = useState<Code>("SG-01");
  const [inquired, setInquired] = useState(false);
  const svc = SERVICES.find(s => s.code === selected)!;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Services
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">Category D · 10 Services</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Security & Governance</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">AI security assessments, red teaming, compliance automation, zero trust, identity modernization, governance programs, and data privacy. Every engagement produces board-ready evidence and CISO-grade assurance.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="space-y-1">
          {SERVICES.map(s => (
            <button key={s.code} id={s.code.toLowerCase()} onClick={() => { setSelected(s.code); setInquired(false); }}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selected === s.code ? "border-red-500/50 bg-red-500/10" : "border-border bg-surface/40 hover:bg-surface-elevated/40"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">{s.code}</span>
              <p className="mt-0.5 text-xs font-semibold text-text-primary leading-snug">{s.name}</p>
              <p className="mt-0.5 text-xs text-text-secondary">from {s.price.split(" ")[0]}</p>
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-border bg-surface/40 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">{svc.code}</span>
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

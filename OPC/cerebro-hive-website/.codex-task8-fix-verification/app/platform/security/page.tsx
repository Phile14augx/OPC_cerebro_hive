import type { Metadata } from "next";
import { Shield, Lock, BarChart3, Database, AlertTriangle, ShieldCheck, Network, Key } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Platform Security | CerebroHive",
  description: 
    "Zero-trust security platform with AI threat detection, DLP, compliance automation, and unified security orchestration.",
};

const securityProducts = [
  {
    id: "hive-shield",
    name: "HiveShield™",
    description: "Enterprise security, zero-trust gating, and AI red-teaming. Real-time prompt injection detection, semantic DLP, and behavioral anomaly analysis.",
    icon: Shield,
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    features: [
      "Prompt injection detection",
      "LLM data exfiltration prevention",
      "Agent behavioral analysis",
      "Threat intelligence integration",
    ],
    status: "Beta Q4 2026",
    cta: "/platform/shield",
  },
  {
    id: "hive-identity",
    name: "HiveIdentity™",
    description: "Unified IAM, SSO, and RBAC for humans and AI agents. Zero-trust authentication with fine-grained permissions.",
    icon: Key,
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    features: [
      "Zero-trust authentication",
      "Fine-grained RBAC",
      "API key management",
      "Agent identity federation",
    ],
    status: "GA",
    cta: "/platform/identity",
  },
  {
    id: "hive-govern",
    name: "HiveGovern™",
    description: "Policy enforcement, compliance, and lineage tracking. Automated evidence collection for SOC 2, HIPAA, GDPR, ISO 27001.",
    icon: ShieldCheck,
    color: "text-green-400",
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    features: [
      "Policy enforcement engine",
      "Compliance automation",
      "Audit trail generation",
      "Risk assessment tools",
    ],
    status: "Beta Q4 2026",
    cta: "/platform/govern",
  },
  {
    id: "hive-network",
    name: "HiveNetwork™",
    description: "Secure interconnects for multi-agent communication. mTLS everywhere with network policies and isolation.",
    icon: Network,
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    features: [
      "Service mesh mTLS",
      "Network policy engine",
      "Namespace isolation",
      "Traffic observability",
    ],
    status: "GA",
    cta: "/platform/network",
  },
  {
    id: "cerebro-cyber",
    name: "CerebroCyber™",
    description: "Enterprise AI cyber security suite. AI-native threat detection, DLP, incident response, and compliance for the Intelligence Mesh.",
    icon: AlertTriangle,
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    features: [
      "AI threat intelligence",
      "Real-time DLP scanning",
      "Incident response automation",
      "Threat hunting workspace",
    ],
    status: "New Product",
    cta: "/security",
  },
];

const securityMetrics = [
  { 
    value: "99.99%", 
    label: "Platform Security SLA",
    icon: ShieldCheck,
  },
  { 
    value: "0", 
    label: "Successful Breaches",
    icon: AlertTriangle,
  },
  { 
    value: "5min", 
    label: "Avg Threat Detection",
    icon: BarChart3,
  },
  { 
    value: "50+", 
    label: "Threat Intel Feeds",
    icon: Database,
  },
];

const complianceStatus = [
  { framework: "SOC 2 Type II", status: "✅ Certified", color: "text-green-400" },
  { framework: "HIPAA", status: "✅ Compliant", color: "text-blue-400" },
  { framework: "GDPR", status: "✅ Compliant", color: "text-purple-400" },
  { framework: "ISO 27001", status: "✅ Certified", color: "text-yellow-400" },
  { framework: "NIST CSF", status: "✅ Compliant", color: "text-red-400" },
];

export default function PlatformSecurityPage() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 bg-gradient-to-br from-red-500/10 via-transparent to-purple-500/10 border-b border-border">
        <div className="container-wide text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-red-400 mb-6">
            <Lock size={14} className="mr-2" />
            Zero-Trust AI Security
          </div>
          <h1 className="font-space text-4xl md:text-6xl font-bold text-text-primary max-w-4xl leading-tight mb-6">
            Enterprise AI Cyber Security Platform
          </h1>
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed mx-auto">
            CerebroCyber protects the CerebroHive Intelligence Mesh with AI-native security 
            that detects prompt injection, prevents data exfiltration, and automates compliance 
            across SOC 2, HIPAA, GDPR, and more.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/security"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              View Security Suite
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-primary font-bold text-sm hover:border-red-500/50 transition-colors"
            >
              Book Security Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Security Metrics */}
      <section className="w-full border-b border-border bg-surface/40">
        <div className="container-wide py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {securityMetrics.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <Icon size={24} className="text-red-400" />
                <span className="font-space text-3xl font-bold text-text-primary">{value}</span>
                <span className="text-xs text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Products Grid */}
      <section className="w-full border-b border-border py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">Security Products</p>
            <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">
              Five-Layer Security Architecture
            </h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              Zero-trust security implemented at every layer of the Intelligence Mesh, from infrastructure to applications.
            </p>
          </div>

          <div className="space-y-4">
            {securityProducts.map(({ id, name, description, icon: Icon, color, border, bg, features, status, cta }) => (
              <Link
                key={id}
                href={cta}
                className={`group flex flex-col md:flex-row md:items-center gap-4 rounded-2xl border ${border} ${bg} px-6 py-5 hover:border-opacity-60 transition-all`}
              >
                <div className="flex items-center gap-3 md:w-80 shrink-0">
                  <div className={`p-2 rounded-lg border ${border} ${bg}`}>
                    <Icon size={24} className={color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">{status.split(' ')[0]}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widens ${color}`}>{status.split(' ')[1]}</span>
                    </div>
                    <p className="text-lg font-bold text-text-primary">{name}</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary md:w-80 shrink-0 mb-3 md:mb-0">{description}</p>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {features.slice(0, 3).map((f) => (
                      <span 
                        key={f} 
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border text-text-secondary"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <ArrowRight size={16} className={`${color} self-start md:self-auto`} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Status */}
      <section className="w-full border-b border-border bg-surface/40 py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400 mb-3">Compliance Verified</p>
            <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">
              Automated Compliance Evidence
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {complianceStatus.map(({ framework, status, color }) => (
              <div 
                key={framework} 
                className="rounded-xl border border-border bg-surface/30 p-4 flex justify-between items-center"
              >
                <p className="text-sm font-medium text-text-primary">{framework}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${color} bg-current/5`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="w-full border-b border-border py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400 mb-3">Architecture</p>
            <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">
              Defense in Depth
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { name: "HiveIdentity", desc: "Zero-trust authentication", icon: Key },
              { name: "HiveNetwork", desc: "mTLS service mesh", icon: Network },
              { name: "HiveShield", desc: "AI threat detection", icon: Shield },
              { name: "HiveGovern", desc: "Policy enforcement", icon: ShieldCheck },
              { name: "HiveCompliance", desc: "Evidence collection", icon: BarChart3 },
            ].map((layer) => {
              const Icon = layer.icon;
              return (
                <div 
                  key={layer.name} 
                  className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-surface/30"
                >
                  <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                    <Icon size={24} className="text-red-400" />
                  </div>
                  <h3 className="font-space text-sm font-bold text-text-primary mb-2">{layer.name}</h3>
                  <p className="text-xs text-text-secondary">{layer.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full border-b border-border bg-gradient-to-br from-red-500/10 via-transparent to-purple-500/10 py-20">
        <div className="container-wide text-center">
          <h2 className="font-space text-3xl md:text-5xl font-bold text-text-primary mb-6">
            Secure Your Enterprise AI Deployment
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
            Start with a comprehensive security posture assessment or 4–6 week security implementation engagement. 
            Board-ready risk reporting included.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-red-500 text-white font-bold hover:opacity-90 transition-opacity"
            >
              Book Security Assessment
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-text-primary font-bold hover:border-red-500/50 transition-colors"
            >
              View Security Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// ArrowRight icon component
function ArrowRight({ size, className }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size || 16} 
      height={size || 16} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="L12 5l7 7-7 7" />
    </svg>
  );
}
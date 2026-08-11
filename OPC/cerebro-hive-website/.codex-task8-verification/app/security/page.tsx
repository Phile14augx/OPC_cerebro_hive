import type { Metadata } from "next";
import { Shield, AlertTriangle, Brain, Database, Lock, ShieldCheck, BarChart3, Globe } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CerebroCyber — Enterprise AI Cyber Security Suite",
  description: 
    "Zero-trust AI security with prompt injection detection, DLP, compliance automation, and threat intelligence for the CerebroHive Intelligence Mesh.",
};

const threatCategories = [
  {
    title: "Traditional Cyber Threats",
    icon: Shield,
    threats: [
      { name: "External Network Intrusion", icon: "🔐" },
      { name: "Insider Threat", icon: "👤" },
      { name: "Phishing & Social Engineering", icon: "📧" },
      { name: "Ransomware", icon: "⚠️" },
      { name: "Supply Chain Attacks", icon: "🔗" },
    ],
  },
  {
    title: "AI-Specific Threats",
    icon: Brain,
    threats: [
      { name: "Prompt Injection", icon: "🚫" },
      { name: "Indirect Prompt Injection", icon: "📄" },
      { name: "Model Poisoning", icon: "⚗️" },
      { name: "LLM Data Exfiltration", icon: "📤" },
      { name: "Agent Scope Creep", icon: "🕵️" },
    ],
  },
  {
    title: "Multi-Agent Attack Vectors",
    icon: Globe,
    threats: [
      { name: "Orchestrator Compromise", icon: "🎭" },
      { name: "Cross-Agent Data Leakage", icon: "🔀" },
      { name: "Agent Impersonation", icon: "🎭" },
      { name: "Sandbox Escape", icon: "🏃‍♂️" },
    ],
  },
];

const securityLayers = [
  {
    tier: 5,
    title: "Governance & Compliance",
    description: "Policy enforcement, audit trails, regulatory compliance automation",
    icon: ShieldCheck,
    color: "text-green-400",
    services: ["HiveGovern", "HiveCompliance"],
  },
  {
    tier: 4,
    title: "AI Threat Intelligence",
    description: "Real-time prompt injection detection, semantic DLP, behavioral analysis",
    icon: AlertTriangle,
    color: "text-red-400",
    services: ["CerebroCyber", "HiveShield"],
  },
  {
    tier: 3,
    title: "Data Protection",
    description: "Encryption, DLP, PII classification, secure data flows",
    icon: Database,
    color: "text-blue-400",
    services: ["HiveStorage", "HiveData"],
  },
  {
    tier: 2,
    title: "Network & Identity",
    description: "Zero-trust networking, unified IAM, mTLS everywhere",
    icon: Lock,
    color: "text-purple-400",
    services: ["HiveNetwork", "HiveIdentity"],
  },
  {
    tier: 1,
    title: "Infrastructure Security",
    description: "Endpoint protection, container security, threat intel feeds",
    icon: Shield,
    color: "text-orange-400",
    services: ["HiveCompute", "HiveNetwork"],
  },
];

const complianceFrameworks = [
  { name: "SOC 2 Type II", status: "✅ Automated", color: "text-green-400" },
  { name: "HIPAA", status: "✅ Automated", color: "text-blue-400" },
  { name: "GDPR", status: "✅ Automated", color: "text-purple-400" },
  { name: "ISO 27001", status: "✅ Automated", color: "text-yellow-400" },
  { name: "NIST CSF", status: "✅ Automated", color: "text-red-400" },
  { name: "EU AI Act", status: "🔵 In Progress", color: "text-gray-400" },
  { name: "FedRAMP", status: "🔵 In Progress", color: "text-gray-400" },
  { name: "PCI DSS", status: "✅ Automated", color: "text-indigo-400" },
];

const metrics = [
  { value: "99.99%", label: "Platform Uptime SLA", trend: "↑ 0.01%" },
  { value: "0", label: "Successful Breaches", trend: "↓ 100%" },
  { value: "0", label: "DLP Violations Blocked", trend: "↑ 12%" },
  { value: "5min", label: "Avg Threat Response", trend: "↓ 30%" },
  { value: "100%", label: "Compliance Coverage", trend: "↑ 5%" },
];

export default function SecurityPage() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 bg-gradient-to-br from-red-500/10 via-transparent to-purple-500/10 border-b border-border">
        <div className="container-wide text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-red-400 mb-6">
            <Shield size={14} className="mr-2" />
            Zero-Trust AI Security
          </div>
          <h1 className="font-space text-4xl md:text-6xl font-bold text-text-primary max-w-4xl leading-tight mb-6">
            Enterprise AI Cyber Security
          </h1>
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed mx-auto">
            CerebroCyber protects the CerebroHive Intelligence Mesh with AI-native security 
            that detects prompt injection, prevents data exfiltration, and automates compliance 
            across SOC 2, HIPAA, GDPR, and more.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/platform/security"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              View Platform Security
            </Link>
            <Link
              href="/services/security"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-primary font-bold text-sm hover:border-red-500/50 transition-colors"
            >
              Security Services
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-secondary font-semibold text-sm hover:text-text-primary transition-colors"
            >
              Book Security Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="w-full border-b border-border bg-surface/40">
        <div className="container-wide py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {metrics.map(({ value, label, trend }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <span className="font-space text-3xl font-bold text-text-primary">{value}</span>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-text-secondary">{label}</span>
                  <span className="text-xs text-green-400 mt-1">{trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Threat Categories */}
      <section className="w-full border-b border-border py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-3">Threat Landscape</p>
            <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">
              Comprehensive Threat Detection
            </h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              CerebroCyber detects and blocks threats across traditional infrastructure, AI-specific attack vectors, and multi-agent orchestration.
            </p>
          </div>

          <div className="space-y-8">
            {threatCategories.map(({ title, icon: Icon, threats }) => (
              <div key={title} className="rounded-2xl border border-border bg-surface/40 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <Icon size={24} className="text-red-400" />
                  </div>
                  <h3 className="font-space text-2xl font-bold text-text-primary">{title}</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {threats.map((threat) => (
                    <div 
                      key={threat.name} 
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface/30 px-4 py-3"
                    >
                      <span className="text-2xl">{threat.icon}</span>
                      <span className="text-sm font-medium text-text-primary">{threat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture Layers */}
      <section className="w-full border-b border-border bg-surface/40 py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">Defense in Depth</p>
            <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">
              Five-Layer Security Architecture
            </h2>
          </div>

          <div className="space-y-4">
            {securityLayers.map(({ tier, title, description, icon: Icon, color, services }) => (
              <div 
                key={title} 
                className="group flex flex-col md:flex-row md:items-center gap-4 rounded-2xl border border-border bg-surface/40 px-6 py-5 hover:bg-surface/50 transition-all"
              >
                <div className="flex items-center gap-3 md:w-24 shrink-0">
                  <div className="text-sm font-bold text-text-secondary mb-1">Tier {tier}</div>
                  <div className="p-2 rounded-lg border border-border bg-surface/30">
                    <Icon size={20} className={color} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{title}</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary md:w-96 shrink-0">{description}</p>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {services.map((s) => (
                    <span 
                      key={s} 
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border text-text-secondary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="w-full border-b border-border py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400 mb-3">Compliance Automation</p>
            <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">
              Automated Compliance Evidence Collection
            </h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              Continuous compliance monitoring with automated evidence collection for SOC 2, HIPAA, GDPR, and 8 more frameworks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceFrameworks.map(({ name, status, color }) => (
              <div 
                key={name} 
                className="rounded-xl border border-border bg-surface/30 p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-bold text-text-primary">{name}</p>
                  <p className="text-xs text-text-secondary mt-1">{status}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${color} bg-current/5`}>
                  {status.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="w-full border-b border-border bg-surface/40 py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-green-400 mb-3">Key Capabilities</p>
            <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">
              AI-Native Security Features
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Prompt Injection Defense",
                description: "Real-time detection and blocking of prompt injection attacks across all LLM interactions.",
                icon: AlertTriangle,
              },
              {
                title: "Semantic DLP",
                description: "Data Loss Prevention that understands AI-generated content and semantic patterns.",
                icon: Shield,
              },
              {
                title: "Behavioral Anomaly Detection",
                description: "ML-powered agent behavior analysis to detect compromised or malicious agents.",
                icon: BarChart3,
              },
              {
                title: "Zero-Trust Access",
                description: "Fine-grained RBAC for humans and AI agents with automatic privilege escalation detection.",
                icon: Lock,
              },
              {
                title: "Compliance Automation",
                description: "Automated evidence collection and control mapping for SOC 2, HIPAA, GDPR, ISO 27001.",
                icon: ShieldCheck,
              },
              {
                title: "Threat Intelligence",
                description: "Integration with 50+ threat feeds for real-time threat intelligence updates.",
                icon: Globe,
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title} 
                  className="rounded-2xl border border-border bg-surface/30 p-6 hover:border-red-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                      <Icon size={20} className="text-red-400" />
                    </div>
                    <h3 className="font-space text-xl font-bold text-text-primary">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-text-secondary">{feature.description}</p>
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
            Protect Your Enterprise AI
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
            Start with a security posture assessment or 4–6 week security implementation engagement. 
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

      {/* Trust Indicators */}
      <section className="w-full border-b border-border bg-surface/20 py-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-green-400" />
              <span className="text-sm text-text-secondary">SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-blue-400" />
              <span className="text-sm text-text-secondary">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-purple-400" />
              <span className="text-sm text-text-secondary">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-yellow-400" />
              <span className="text-sm text-text-secondary">ISO 27001 Certified</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
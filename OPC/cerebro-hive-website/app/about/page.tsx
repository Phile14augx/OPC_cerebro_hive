import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "About CerebroHive — Enterprise AI Systems Company",
  description:
    "CerebroHive architects enterprise AI systems — 50 platform products, 50 professional services, and Academy education programs. Founded on the belief that AI transformation is an engineering problem.",
};

const VALUES = [
  {
    title: "Engineering Over Hype",
    desc: "Every engagement is scoped with defined deliverables, measurable outcomes, and a fixed timeline. We don't do perpetual discovery.",
  },
  {
    title: "Outcomes, Not Hours",
    desc: "Our professional services are priced by outcome, not time. You buy a result, not a seat.",
  },
  {
    title: "Build to Own",
    desc: "Every system we build is production-grade, documented, and fully handed over. We train your team to own what we build.",
  },
  {
    title: "Security First",
    desc: "Every product and engagement defaults to the highest security posture — SOC 2, NIST, HIPAA, FedRAMP. Compliance is never an afterthought.",
  },
  {
    title: "Vertical Specificity",
    desc: "Generic AI doesn't work in regulated industries. We build with the specific regulatory and operational requirements of each vertical.",
  },
  {
    title: "Practitioner-Led",
    desc: "Our team is built from engineers, not account managers. Every engagement is led and delivered by the people who built the platform.",
  },
];

const MILESTONES = [
  { year: "2021", event: "CerebroHive founded — initial focus on AI strategy and RAG systems for financial services." },
  { year: "2022", event: "Platform engineering team formed. HiveModels™ and HiveData™ reach general availability." },
  { year: "2023", event: "Services organization scales to 5 practices. CerebroStudio™ enters beta with 12 design partners." },
  { year: "2024", event: "50-product platform launched. Academy launched with first 20 courses and 3 certification paths." },
  { year: "2025", event: "15 industry programs launched. FedRAMP authorization achieved for government deployments." },
  { year: "2026", event: "2,400+ practitioners trained. 50 services portfolio complete across 5 practice areas." },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-12">
      {/* Hero */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">
          About
        </p>
        <h1 className="font-space text-4xl font-bold text-text-primary md:text-5xl leading-tight">
          We Build Enterprise AI Systems
        </h1>
        <p className="mt-5 text-lg text-text-secondary max-w-2xl leading-relaxed">
          CerebroHive is an enterprise AI systems company — 50 platform products, 50 professional services, and an Academy that trains the teams building tomorrow's AI infrastructure. We believe AI transformation is an engineering problem, not a consulting project.
        </p>
      </div>

      {/* Mission */}
      <div className="rounded-2xl border border-primary-accent/30 bg-primary-accent/5 p-8 mb-14">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-accent mb-4">
          Mission
        </p>
        <p className="text-xl font-bold text-text-primary leading-relaxed">
          Make enterprise AI transformation predictable — with defined scope, measurable outcomes, and teams that own what gets built.
        </p>
      </div>

      {/* Values */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-6">
          How We Work
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-surface/30 p-5">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle size={14} className="text-primary-accent shrink-0 mt-0.5" />
                <h3 className="text-sm font-bold text-text-primary">{v.title}</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed pl-5">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Numbers */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-6">
          By the Numbers
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: "50", label: "Platform Products" },
            { value: "50", label: "Professional Services" },
            { value: "15", label: "Industry Programs" },
            { value: "2,400+", label: "Practitioners Trained" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-surface/30 p-4 text-center"
            >
              <p className="text-2xl font-bold text-primary-accent">{stat.value}</p>
              <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-6">
          Company Timeline
        </p>
        <div className="space-y-4">
          {MILESTONES.map((m) => (
            <div key={m.year} className="flex gap-5">
              <div className="shrink-0 w-12 text-right">
                <span className="text-xs font-bold text-primary-accent font-mono">{m.year}</span>
              </div>
              <div className="border-l border-border pl-5 pb-4">
                <p className="text-sm text-text-secondary">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Work With Us <ArrowRight size={14} />
        </Link>
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-primary font-bold text-sm hover:border-primary-accent transition-colors"
        >
          Join the Team <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}

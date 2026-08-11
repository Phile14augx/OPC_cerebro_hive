import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Company — CerebroHive",
  description:
    "CerebroHive company overview — press, partners, legal, security disclosures, and investor information.",
};

const SECTIONS = [
  {
    title: "About",
    desc: "Our mission, values, and the story of how we got here.",
    href: "/about",
    color: "text-primary-accent",
    border: "border-primary-accent/30",
    bg: "bg-primary-accent/5",
  },
  {
    title: "Careers",
    desc: "Open roles across Engineering, Strategy, Security, and Academy.",
    href: "/careers",
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
  },
  {
    title: "Contact",
    desc: "Book a discovery call or reach out for any inquiry.",
    href: "/contact",
    color: "text-teal-400",
    border: "border-teal-500/30",
    bg: "bg-teal-500/5",
  },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Security Policy", href: "/legal/security" },
  { label: "Data Processing Agreement", href: "/legal/dpa" },
  { label: "Cookie Policy", href: "/legal/cookies" },
  { label: "Acceptable Use Policy", href: "/legal/aup" },
];

const SECURITY_CERTS = [
  { label: "SOC 2 Type II", status: "Certified", desc: "Annual third-party audit. Report available under NDA." },
  { label: "ISO 27001", status: "In Progress", desc: "Certification expected Q3 2026." },
  { label: "NIST AI RMF", status: "Aligned", desc: "Full AI Risk Management Framework alignment across platform." },
  { label: "FedRAMP Moderate", status: "Authorized", desc: "Government-grade cloud authorization for federal deployments." },
  { label: "HIPAA", status: "BAA Available", desc: "Business Associate Agreement available for healthcare clients." },
  { label: "EU AI Act", status: "Compliant", desc: "High-risk AI system requirements met across applicable products." },
];

const PRESS = [
  {
    outlet: "Enterprise AI Weekly",
    headline: "CerebroHive Launches 50-Product AI Platform for Regulated Industries",
    date: "March 2025",
  },
  {
    outlet: "AI Infrastructure Report",
    headline: "How CerebroHive's Tier Architecture Is Changing Enterprise AI Procurement",
    date: "January 2025",
  },
  {
    outlet: "GovTech Today",
    headline: "CerebroHive Achieves FedRAMP Authorization for Government AI Platform",
    date: "November 2024",
  },
];

export default function CompanyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-12">
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">
          Company
        </p>
        <h1 className="font-space text-4xl font-bold text-text-primary md:text-5xl">
          CerebroHive
        </h1>
        <p className="mt-3 text-text-secondary max-w-xl">
          Enterprise AI systems company. Platform, professional services, and education programs for the organizations building on AI at scale.
        </p>
      </div>

      {/* Section cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-14">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`group rounded-xl border ${s.border} ${s.bg} p-5 hover:shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-sm font-bold ${s.color}`}>{s.title}</h2>
              <ArrowRight
                size={13}
                className={`${s.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
            </div>
            <p className="text-xs text-text-secondary">{s.desc}</p>
          </Link>
        ))}
      </div>

      {/* Security & Compliance */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-5">
          Security & Compliance
        </p>
        <div className="space-y-3">
          {SECURITY_CERTS.map((cert) => (
            <div
              key={cert.label}
              className="rounded-xl border border-border bg-surface/30 px-5 py-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-bold text-text-primary">{cert.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{cert.desc}</p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  cert.status === "Certified" || cert.status === "Authorized" || cert.status === "Compliant"
                    ? "bg-primary-accent/15 text-primary-accent"
                    : cert.status === "BAA Available"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-yellow-500/15 text-yellow-400"
                }`}
              >
                {cert.status}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-secondary">
          Security inquiries:{" "}
          <a
            href="mailto:security@cerebro-hive.com"
            className="text-primary-accent hover:underline"
          >
            security@cerebro-hive.com
          </a>
        </p>
      </div>

      {/* Press */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-5">
          Press
        </p>
        <div className="space-y-3">
          {PRESS.map((item) => (
            <div
              key={item.headline}
              className="rounded-xl border border-border bg-surface/30 px-5 py-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                {item.outlet} · {item.date}
              </p>
              <p className="text-sm font-semibold text-text-primary">{item.headline}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-secondary">
          Press inquiries:{" "}
          <a
            href="mailto:press@cerebro-hive.com"
            className="text-primary-accent hover:underline"
          >
            press@cerebro-hive.com
          </a>
        </p>
      </div>

      {/* Legal */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-5">
          Legal
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-accent transition-colors"
            >
              <ArrowRight size={12} className="text-primary-accent/60" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="rounded-2xl border border-border bg-surface/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-text-primary">Questions about CerebroHive?</p>
          <p className="text-sm text-text-secondary mt-0.5">
            We respond to all inquiries within 1 business day.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Get in Touch <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}

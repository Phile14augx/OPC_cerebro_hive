import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "CerebroHive Academy — Enterprise AI Education",
  description:
    "Practitioner-grade enterprise AI education. Courses, certifications, learning paths, and corporate training programs for the teams building tomorrow's AI systems.",
};

const PROGRAMS = [
  {
    href: "/academy/courses",
    icon: BookOpen,
    color: "text-primary-accent",
    border: "border-primary-accent/30",
    bg: "bg-primary-accent/5",
    label: "Courses",
    name: "Individual Courses",
    tagline: "Practitioner-grade AI courses you can apply on Monday.",
    features: [
      "40+ courses across Strategy, Engineering, Operations, and Security",
      "Hands-on labs in CerebroStudio™ environment",
      "Certificate of completion per course",
      "Self-paced, lifetime access",
    ],
    cta: "Browse Courses",
  },
  {
    href: "/academy/learning-paths",
    icon: ArrowRight,
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    label: "Paths",
    name: "Learning Paths",
    tagline: "Structured paths from practitioner to certified expert.",
    features: [
      "6 curated paths: AI Engineer, ML Engineer, AI Strategist, AI Governance Lead, AI Ops, AI Security",
      "Capstone project with CerebroHive review",
      "CerebroHive Certified designation",
      "12–24 weeks per path",
    ],
    cta: "View Learning Paths",
  },
  {
    href: "/academy/corporate-programs",
    icon: Briefcase,
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    label: "Corporate",
    name: "Corporate Programs",
    tagline: "AI upskilling programs for your entire organization.",
    features: [
      "Team licenses with admin dashboard",
      "Custom curriculum aligned to your tech stack",
      "Live cohort sessions with CerebroHive practitioners",
      "Progress reporting and completion tracking",
    ],
    cta: "Get Corporate Pricing",
  },
  {
    href: "/academy/referral",
    icon: Gift,
    color: "text-rose-400",
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
    label: "Referral",
    name: "Referral Program",
    tagline: "Earn while you share enterprise AI education.",
    features: [
      "20% commission on referred course and path purchases",
      "45-day cookie window",
      "Monthly payouts via Stripe",
      "Co-marketing support for partners",
    ],
    cta: "Join the Program",
  },
];

const STATS = [
  { value: "40+", label: "Courses" },
  { value: "6", label: "Certified Paths" },
  { value: "2,400+", label: "Practitioners Trained" },
  { value: "4.8/5", label: "Average Rating" },
];

export default function AcademyPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">
          Academy
        </p>
        <h1 className="font-space text-4xl font-bold text-text-primary md:text-5xl">
          Enterprise AI Education
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-text-secondary text-lg">
          Practitioner-grade courses and certifications built by the engineers who architect enterprise AI systems for the world&apos;s most demanding organizations.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-primary-accent">{s.value}</p>
              <p className="text-xs text-text-secondary uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Program cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {PROGRAMS.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.href}
              href={p.href}
              className={`group rounded-2xl border ${p.border} ${p.bg} p-6 hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 ${p.color}`}>
                  <Icon size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                    {p.label}
                  </span>
                </div>
                <ArrowRight
                  size={14}
                  className={`${p.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-2">{p.name}</h2>
              <p className="text-sm text-text-secondary mb-4">{p.tagline}</p>
              <ul className="space-y-2 mb-5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className={`shrink-0 mt-0.5 ${p.color}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${p.color}`}>
                {p.cta} <ArrowRight size={11} />
              </span>
            </Link>
          );
        })}
      </div>

      {/* CTA band */}
      <div className="mt-14 rounded-2xl border border-border bg-surface/40 p-8 text-center">
        <h2 className="font-space text-2xl font-bold text-text-primary mb-3">
          Need a custom corporate AI training program?
        </h2>
        <p className="text-text-secondary mb-6 max-w-xl mx-auto">
          We build bespoke training programs aligned to your specific platform, use cases, and team structure — delivered live by CerebroHive practitioners.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Discuss Corporate Training <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}

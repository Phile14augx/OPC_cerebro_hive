import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Corporate AI Training Programs — CerebroHive Academy",
  description:
    "Enterprise AI upskilling programs for your entire organization. Custom curriculum, live cohort sessions, admin dashboard, and completion tracking.",
};

const TIERS = [
  {
    name: "Team",
    seats: "5–25 seats",
    price: "$1,200",
    unit: "/ seat / year",
    color: "text-primary-accent",
    border: "border-primary-accent/30",
    bg: "bg-primary-accent/5",
    features: [
      "Full access to all 40+ courses",
      "2 learning paths per seat",
      "Admin dashboard + progress reporting",
      "1 live Q&A session per month with CerebroHive engineer",
      "Completion certificates",
      "Slack community access",
    ],
    cta: "Start Team Trial",
  },
  {
    name: "Department",
    seats: "26–100 seats",
    price: "$950",
    unit: "/ seat / year",
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    features: [
      "Everything in Team",
      "Unlimited learning paths",
      "Custom curriculum aligned to your tech stack",
      "2 live cohort sessions per month",
      "SSO / SAML integration",
      "Dedicated customer success manager",
    ],
    cta: "Get Department Pricing",
    highlighted: true,
  },
  {
    name: "Enterprise",
    seats: "100+ seats",
    price: "Custom",
    unit: "pricing",
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    features: [
      "Everything in Department",
      "Bespoke curriculum built from scratch",
      "Live in-person or virtual bootcamps",
      "Private Slack channel with CerebroHive engineers",
      "Custom certification program with your branding",
      "API integration with your LMS",
      "Volume SLA and DPA",
    ],
    cta: "Contact Enterprise Sales",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Discovery Call",
    desc: "We map your team's current AI maturity, tech stack, and learning objectives in a 1-hour session.",
  },
  {
    step: "02",
    title: "Curriculum Design",
    desc: "Our team curates or builds a curriculum aligned to your specific platforms, use cases, and role mix.",
  },
  {
    step: "03",
    title: "Cohort Launch",
    desc: "Your team starts learning — self-paced modules plus live sessions with CerebroHive practitioners.",
  },
  {
    step: "04",
    title: "Progress Tracking",
    desc: "Admin dashboard shows completion rates, assessment scores, and certification progress in real time.",
  },
];

export default function CorporateProgramsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-8">
      <Link
        href="/academy"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"
      >
        <ArrowLeft size={14} /> Academy
      </Link>

      <div className="mt-6 mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">
          Corporate Programs
        </p>
        <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
          AI Upskilling for Your Entire Organization
        </h1>
        <p className="mt-3 text-text-secondary max-w-2xl">
          From 5-person teams to enterprise-wide programs — structured AI training built by the engineers who run production AI systems at scale.
        </p>
      </div>

      {/* How it works */}
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-6">
          How It Works
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.step}
              className="rounded-xl border border-border bg-surface/30 p-4"
            >
              <p className="font-mono text-2xl font-bold text-primary-accent opacity-40 mb-2">
                {step.step}
              </p>
              <p className="text-sm font-bold text-text-primary mb-1">{step.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing tiers */}
      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-6">
        Pricing
      </p>
      <div className="grid gap-5 md:grid-cols-3 mb-12">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl border ${tier.border} ${tier.bg} p-6 flex flex-col ${tier.highlighted ? "ring-1 ring-primary-accent/40" : ""}`}
          >
            {tier.highlighted && (
              <div className="mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-accent/20 text-primary-accent">
                  Most Popular
                </span>
              </div>
            )}
            <h2 className={`text-lg font-bold ${tier.color}`}>{tier.name}</h2>
            <p className="text-xs text-text-secondary mb-4">{tier.seats}</p>
            <div className="mb-5">
              <span className="text-3xl font-bold text-text-primary">{tier.price}</span>
              <span className="text-xs text-text-secondary ml-1">{tier.unit}</span>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-text-secondary">
                  <CheckCircle size={12} className={`${tier.color} shrink-0 mt-0.5`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-opacity hover:opacity-80 ${
                tier.highlighted
                  ? "bg-primary-accent text-background"
                  : `border ${tier.border} ${tier.color}`
              }`}
            >
              {tier.cta} <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      {/* Custom programs note */}
      <div className="rounded-2xl border border-border bg-surface/40 p-6">
        <h3 className="font-bold text-text-primary mb-2">Need a fully custom program?</h3>
        <p className="text-sm text-text-secondary mb-4">
          We build bespoke corporate training programs from scratch — custom curriculum, custom labs, live delivery by CerebroHive engineers, and your organization's branding on every certificate. Ideal for organizations deploying AI at scale who need their teams upskilled on a specific platform or methodology.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-accent hover:opacity-80 transition-opacity"
        >
          Discuss a Custom Program <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}

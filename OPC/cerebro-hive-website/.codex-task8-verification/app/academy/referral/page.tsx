import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, DollarSign, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Referral Program — CerebroHive Academy",
  description:
    "Earn 20% commission on every CerebroHive Academy referral. 45-day cookie window, monthly Stripe payouts, co-marketing support.",
};

const STATS = [
  { icon: DollarSign, value: "20%", label: "Commission rate" },
  { icon: TrendingUp, value: "45 days", label: "Cookie window" },
  { icon: Users, value: "Monthly", label: "Payout cadence" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Apply",
    desc: "Submit your application — we review all applicants within 3 business days. Educators, consultants, practitioners, and content creators welcome.",
  },
  {
    step: "02",
    title: "Get Your Link",
    desc: "Receive your unique referral link and access to our partner portal with real-time click and conversion tracking.",
  },
  {
    step: "03",
    title: "Share & Earn",
    desc: "Share your link with your network, courses, or content. Earn 20% on every course, path, or corporate program purchased through your link.",
  },
  {
    step: "04",
    title: "Get Paid",
    desc: "Earnings are paid monthly via Stripe to any country we support. No minimum payout threshold for the first $500.",
  },
];

const EARNABLE = [
  { product: "Individual Course", price: "$299–$599", commission: "$60–$120 per sale" },
  { product: "Learning Path", price: "$1,200–$1,800", commission: "$240–$360 per sale" },
  { product: "Team License (5 seats)", price: "$6,000/year", commission: "$1,200 per sale" },
  { product: "Department License (26+ seats)", price: "$24,700+/year", commission: "$4,940+ per sale" },
];

const IDEAL_PARTNERS = [
  "AI educators and course creators",
  "Enterprise technology consultants",
  "CIOs, CTOs, and AI/ML practitioners",
  "LinkedIn creators in the AI/enterprise tech space",
  "University professors teaching AI or data science",
  "Staffing and recruiting firms placing AI talent",
];

export default function ReferralPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-8">
      <Link
        href="/academy"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"
      >
        <ArrowLeft size={14} /> Academy
      </Link>

      <div className="mt-6 mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">
          Referral Program
        </p>
        <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
          Earn While You Share Enterprise AI Education
        </h1>
        <p className="mt-3 text-text-secondary max-w-2xl">
          Recommend CerebroHive Academy to your network and earn 20% on every purchase — individual courses, certification paths, and corporate programs.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-4 text-center"
            >
              <Icon size={18} className="text-primary-accent mx-auto mb-2" />
              <p className="text-xl font-bold text-primary-accent">{s.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-5">
          How It Works
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.step}
              className="rounded-xl border border-border bg-surface/30 p-4"
            >
              <p className="font-mono text-xl font-bold text-primary-accent opacity-40 mb-2">
                {step.step}
              </p>
              <p className="text-sm font-bold text-text-primary mb-1">{step.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What you can earn */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-5">
          What You Can Earn
        </p>
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/40">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Product
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Price
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-accent">
                  Your Commission
                </th>
              </tr>
            </thead>
            <tbody>
              {EARNABLE.map((row, i) => (
                <tr
                  key={row.product}
                  className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-surface/20"}`}
                >
                  <td className="px-4 py-3 text-text-primary font-medium">{row.product}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{row.price}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary-accent">{row.commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ideal partners */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4">
          Who This Is For
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {IDEAL_PARTNERS.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle size={13} className="text-primary-accent shrink-0" />
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-primary-accent/30 bg-primary-accent/5 p-8 text-center">
        <h2 className="font-space text-2xl font-bold text-text-primary mb-3">
          Ready to join?
        </h2>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          Apply in 2 minutes. We review applications within 3 business days and have partners earning within a week of approval.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Apply to the Referral Program <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}

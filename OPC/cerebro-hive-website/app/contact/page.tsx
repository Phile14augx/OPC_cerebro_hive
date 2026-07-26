"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { api } from "@/lib/api-client";

const ENGAGEMENT_TYPES = [
  { label: "AI Strategy Engagement",         value: "enterprise_ai" },
  { label: "Platform / Product Demo",        value: "ml_infrastructure" },
  { label: "Professional Services Scoping",  value: "digital_transform" },
  { label: "Workforce Automation",           value: "workforce_automation" },
  { label: "Security & Compliance",          value: "security_compliance" },
  { label: "Academy / Training",             value: "academy" },
  { label: "General Inquiry",                value: "general" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    engagementType: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const [firstName, ...rest] = form.name.trim().split(" ");
      await api.crm.submitLead({
        email: form.email,
        firstName: firstName ?? form.name,
        lastName: rest.join(" ") || "—",
        company: form.company,
        jobTitle: form.role,
        engagementType: form.engagementType || "general",
        message: form.message,
        source: "website-contact",
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try emailing hello@cerebrohive.com directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-12">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">
          Contact
        </p>
        <h1 className="font-space text-4xl font-bold text-text-primary md:text-5xl">
          Let's Talk
        </h1>
        <p className="mt-3 text-text-secondary max-w-xl">
          Whether you're scoping an AI strategy engagement, evaluating the platform, or exploring training programs — book a call and we'll scope the right starting point in 1 hour.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-5">
        {/* Form */}
        <div className="md:col-span-3">
          {submitted ? (
            <div className="rounded-2xl border border-primary-accent/30 bg-primary-accent/5 p-8 text-center">
              <CheckCircle size={32} className="text-primary-accent mx-auto mb-4" />
              <h2 className="text-xl font-bold text-text-primary mb-2">
                We'll be in touch within 1 business day.
              </h2>
              <p className="text-sm text-text-secondary">
                A CerebroHive team member will reach out to schedule a discovery call and confirm engagement scope.
              </p>
            </div>
          ) : (
            <>
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 mb-4 text-sm text-red-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-surface/40 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary-accent focus:outline-none transition-colors"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-surface/40 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary-accent focus:outline-none transition-colors"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={form.company}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-surface/40 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary-accent focus:outline-none transition-colors"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Your Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-surface/40 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary-accent focus:outline-none transition-colors"
                    placeholder="CTO / VP Engineering / ..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  How Can We Help?
                </label>
                <select
                  name="engagementType"
                  value={form.engagementType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-surface/40 px-4 py-2.5 text-sm text-text-primary focus:border-primary-accent focus:outline-none transition-colors appearance-none"
                >
                  <option value="">Select engagement type...</option>
                  {ENGAGEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tell Us About Your Situation
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-xl border border-border bg-surface/40 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary-accent focus:outline-none transition-colors resize-none"
                  placeholder="What are you trying to accomplish? What's the timeline? Any specific constraints we should know about?"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity w-full sm:w-auto justify-center disabled:opacity-60"
              >
                {submitting ? "Sending…" : <><span>Book a Discovery Call</span><ArrowRight size={14} /></>}
              </button>
            </form>
            </>
          )}
        </div>

        {/* Info sidebar */}
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-xl border border-border bg-surface/30 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              What to Expect
            </p>
            <ul className="space-y-2">
              {[
                "Response within 1 business day",
                "60-minute discovery call to scope the engagement",
                "No sales pressure — honest fit assessment",
                "Proposal with fixed scope, timeline, and price within 5 days",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
                  <CheckCircle size={12} className="text-primary-accent shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface/30 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              Not Sure Where to Start?
            </p>
            <p className="text-xs text-text-secondary mb-3">
              Start with an AI Readiness Assessment. We'll map your current state, identify the highest-value opportunities, and recommend the right starting point.
            </p>
            <p className="text-xs font-semibold text-primary-accent">4–6 weeks · From $45,000</p>
          </div>

          <div className="rounded-xl border border-border bg-surface/30 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              Security & Compliance
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["SOC 2 Type II", "NIST AI RMF", "HIPAA BAA", "FedRAMP", "GDPR"].map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary-accent/30 text-primary-accent"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle2, Building2, Calendar, ChevronDown } from "lucide-react";
import { TrackedButton } from "@/components/ui/TrackedButton";
import { TrackedLink } from "@/components/ui/TrackedLink";

const industries = ["Financial Services", "Healthcare & Life Sciences", "Manufacturing", "Retail & E-Commerce", "Technology", "Government & Public Sector", "Energy & Utilities", "Education", "Other"];
const companyRanges = ["1–50", "51–200", "201–1,000", "1,001–10,000", "10,000+"];
const budgetRanges = ["< $50K", "$50K – $150K", "$150K – $500K", "$500K – $1M", "$1M+", "Not determined yet"];
const projectTypes = ["AI Strategy & Roadmap", "AI Agent Development", "Data Engineering", "Enterprise Software", "Cloud Modernization", "AI Training & Enablement", "Research Partnership", "Other"];
const timelines = ["ASAP (< 1 month)", "1–3 months", "3–6 months", "6–12 months", "Exploring options"];

const contactChannels = [
  { label: "Sales", email: "sales@cerebro-hive.com", desc: "Enterprise sales and partnerships" },
  { label: "Support", email: "support@cerebro-hive.com", desc: "Existing client support" },
  { label: "Partnerships", email: "partners@cerebro-hive.com", desc: "Technology and channel partnerships" },
  { label: "Media & Press", email: "press@cerebro-hive.com", desc: "Media inquiries and press releases" },
  { label: "Careers", email: "talent@cerebro-hive.com", desc: "Job applications and talent network" },
];

const sessionTypes = [
  { title: "30-Min Discovery Call", desc: "Understand your AI challenges and goals", icon: "30" },
  { title: "45-Min Architecture Workshop", desc: "Technical scoping with our AI architects", icon: "45" },
  { title: "60-Min Executive Consultation", desc: "Strategic alignment for C-suite leaders", icon: "60" },
];

const SelectField = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary font-inter text-sm focus:outline-none focus:border-primary-accent/50 transition-colors appearance-none pr-10"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
    </div>
  </div>
);

const InputField = ({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder: string; type?: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary font-inter text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors"
    />
  </div>
);

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", industry: "", companySize: "", budget: "", projectType: "", timeline: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `[${form.projectType || "Inquiry"}] from ${form.company}`,
          message: `Company: ${form.company}\nPhone: ${form.phone}\nIndustry: ${form.industry}\nCompany Size: ${form.companySize}\nBudget: ${form.budget}\nTimeline: ${form.timeline}\n\n${form.message}`,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,122,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] dark:block hidden" style={{ backgroundSize: '40px 40px' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="container-wide flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise Engagement</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Let&apos;s Build Something<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Exceptional</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed">
            Connect with our enterprise AI architects. We respond to every inquiry within one business day.
          </p>
        </motion.div>
      </section>

      {/* Main Grid: Form + Booking */}
      <section className="section-pad">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

          {/* LEFT: Enterprise Contact Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Enterprise Contact Form</span>
              <h2 className="text-3xl font-space font-bold text-text-primary mb-3">Tell Us About Your Initiative</h2>
              <p className="text-text-secondary text-sm leading-relaxed">Share your challenge and we'll match you with the right architects and consultants.</p>
            </div>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 rounded-2xl bg-primary-accent/10 border border-primary-accent/30 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
                <CheckCircle2 size={48} className="text-primary-accent" />
                <h3 className="text-2xl font-space font-bold text-text-primary">Inquiry Received</h3>
                <p className="text-text-secondary max-w-sm">Our team will review your initiative and respond within one business day. Expect a detailed response from a senior architect.</p>
                <div className="flex items-center gap-2 text-primary-accent text-sm font-bold">
                  <Clock size={14} />
                  Response SLA: ≤ 24 business hours
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Full Name *" placeholder="Alexandra Chen" value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} />
                  <InputField label="Company *" placeholder="Acme Corporation" value={form.company} onChange={(v) => setForm(f => ({ ...f, company: v }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Business Email *" placeholder="alex@acme.com" type="email" value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} />
                  <InputField label="Phone (Optional)" placeholder="+1 (555) 000-0000" type="tel" value={form.phone} onChange={(v) => setForm(f => ({ ...f, phone: v }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Industry *" options={industries} value={form.industry} onChange={(v) => setForm(f => ({ ...f, industry: v }))} />
                  <SelectField label="Company Size" options={companyRanges} value={form.companySize} onChange={(v) => setForm(f => ({ ...f, companySize: v }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Estimated Budget" options={budgetRanges} value={form.budget} onChange={(v) => setForm(f => ({ ...f, budget: v }))} />
                  <SelectField label="Project Type" options={projectTypes} value={form.projectType} onChange={(v) => setForm(f => ({ ...f, projectType: v }))} />
                </div>
                <SelectField label="Timeline" options={timelines} value={form.timeline} onChange={(v) => setForm(f => ({ ...f, timeline: v }))} />
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Message *</label>
                  <textarea
                    placeholder="Describe your initiative, current challenges, and what success looks like for your organization..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary font-inter text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors resize-none"
                  />
                </div>
                <TrackedButton type="submit" disabled={isLoading} analyticsEvent="form_submit" analyticsCategory="conversion" analyticsLabel="Submit Inquiry — Contact Form" className="group relative mt-2 px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-transform shadow-elevated disabled:opacity-60 disabled:cursor-not-allowed">
                  {isLoading ? "Sending…" : "Submit Inquiry"}
                  {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </TrackedButton>
                {error && <p className="text-red-400 text-xs text-center mt-1">{error}</p>}
                <p className="text-[11px] text-text-muted text-center">We respect your privacy. Your information is never shared with third parties.</p>
              </form>

            )}
          </motion.div>

          {/* RIGHT: Booking + Contacts */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="flex flex-col gap-8">

            {/* Strategy Call Booking */}
            <div className="p-8 rounded-2xl bg-surface border border-border shadow-elevated">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Strategy Sessions</span>
              <h2 className="text-2xl font-space font-bold text-text-primary mb-2">Book a Strategy Call</h2>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">Speak directly with a senior AI architect. Choose the session that fits your stage.</p>
              <div className="flex flex-col gap-3 mb-6">
                {sessionTypes.map((s) => (
                  <div key={s.title} className="flex items-start gap-4 p-4 rounded-xl bg-surface-elevated border border-border hover:border-primary-accent/40 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-primary-accent font-space font-bold text-sm">{s.icon}m</span>
                    </div>
                    <div>
                      <div className="font-space font-bold text-text-primary text-sm mb-1 group-hover:text-primary-accent transition-colors">{s.title}</div>
                      <div className="text-text-muted text-xs">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <TrackedLink href="https://calendly.com/cerebro-hive" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Schedule Meeting — Calendly" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-transform">
                <Calendar size={16} />
                Schedule Meeting
              </TrackedLink>
            </div>

            {/* Office Info */}
            <div className="p-8 rounded-2xl bg-surface border border-border shadow-elevated">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Headquarters</span>
              <h3 className="text-xl font-space font-bold text-text-primary mb-5">Bengaluru, India</h3>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-start gap-3 text-text-secondary">
                  <MapPin size={16} className="text-primary-accent mt-0.5 shrink-0" />
                  <span>Electronic City Phase II, Bengaluru — 560 100, Karnataka, India</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <Clock size={16} className="text-primary-accent shrink-0" />
                  <span>Mon – Fri, 9:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>

            {/* Direct Channels */}
            <div className="p-8 rounded-2xl bg-surface border border-border shadow-elevated">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Direct Channels</span>
              <h3 className="text-xl font-space font-bold text-text-primary mb-5">Contact by Department</h3>
              <div className="flex flex-col gap-3">
                {contactChannels.map((ch) => (
                  <TrackedLink key={ch.label} href={`mailto:${ch.email}`} analyticsEvent="contact_channel_click" analyticsCategory="engagement" analyticsLabel={`${ch.label} — ${ch.email}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-elevated border border-transparent hover:border-border transition-all group">
                    <div>
                      <div className="text-sm font-bold text-text-primary group-hover:text-primary-accent transition-colors">{ch.label}</div>
                      <div className="text-xs text-text-muted">{ch.desc}</div>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted text-xs">
                      <Mail size={12} />
                      <span>{ch.email}</span>
                    </div>
                  </TrackedLink>
                ))}
              </div>
            </div>

            {/* SLA Guarantee */}
            <div className="p-6 rounded-2xl bg-primary-accent/5 border border-primary-accent/20 flex items-center gap-4">
              <CheckCircle2 size={24} className="text-primary-accent shrink-0" />
              <div>
                <div className="font-space font-bold text-text-primary text-sm mb-1">Response Guarantee</div>
                <div className="text-text-secondary text-xs">Every enterprise inquiry receives a personal response from a senior architect within one business day.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Cpu, BrainCircuit, Users, Globe2, Sparkles, Code2, GraduationCap, Heart, Zap, Shield, Coffee, Briefcase, Send } from "lucide-react";

const cultureValues = [
  { icon: BrainCircuit, title: "Research-First", desc: "We publish, benchmark, and contribute to the discipline. Every engineer is expected to think, not just build." },
  { icon: Cpu, title: "Production-Grade", desc: "We ship. Every internal project has real accountability, real SLAs, and real consequences." },
  { icon: Globe2, title: "Enterprise Ambition", desc: "We work at the scale and complexity that fewer than 1% of engineers ever encounter." },
  { icon: Users, title: "No-Politics Culture", desc: "Ideas win on merit. Hierarchy exists for accountability, not gatekeeping." },
  { icon: Shield, title: "High Trust, High Ownership", desc: "You own your domain end-to-end. No hand-holding, no micromanagement." },
  { icon: Sparkles, title: "Craft Excellence", desc: "We are obsessed with quality. Bad architecture, poor naming, or missing tests are rejected in code review." },
];

const domains = [
  { icon: BrainCircuit, title: "AI Research & Engineering", desc: "LLMs, RAG, agents, multimodal systems, and enterprise AI platform architecture." },
  { icon: Code2, title: "Platform Engineering", desc: "Distributed systems, cloud-native infrastructure, DevSecOps, and data pipelines." },
  { icon: Briefcase, title: "AI Consulting", desc: "Enterprise architecture, executive advisory, roadmap design, and delivery governance." },
  { icon: GraduationCap, title: "AI Education", desc: "Curriculum design, corporate training, and technical enablement programs." },
  { icon: Zap, title: "Automation Engineering", desc: "RPA, workflow orchestration, hyperautomation, and process intelligence." },
  { icon: Users, title: "Operations & Delivery", desc: "Project management, client success, and enterprise delivery excellence." },
];

const benefits = [
  { icon: Globe2, label: "Remote-First", desc: "Work from anywhere. Results matter, not your timezone." },
  { icon: Heart, label: "Health Coverage", desc: "Comprehensive medical, dental, and vision for you and your family." },
  { icon: GraduationCap, label: "Learning Budget", desc: "₹1L+ annual budget for courses, conferences, and certifications." },
  { icon: Coffee, label: "Equipment Stipend", desc: "Best-in-class hardware. No compromises on your workstation." },
  { icon: Zap, label: "Fast Trajectory", desc: "Early-stage means rapid growth. Your career moves as fast as you do." },
  { icon: Sparkles, label: "Research Time", desc: "20% time protected for independent research and open-source." },
];

export default function CareersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "", portfolio: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.portfolio || "Not provided",
          type: "career-application",
          inputs: { role: form.role, portfolio: form.portfolio, message: form.message },
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please email talent@cerebro-hive.com directly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,245,122,0.07),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:block hidden" style={{ backgroundSize: '48px 48px' }} />
        <motion.div initial={{ opacity: 0.4, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="container-wide flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Join the Team</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Build the Future of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Enterprise Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
            We are assembling a team of exceptional engineers, researchers, architects, and consultants who are obsessed with building enterprise AI systems that actually work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#apply" className="px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl flex items-center gap-3 hover:-translate-y-0.5 transition-transform shadow-elevated">
              Join Our Talent Network <ArrowRight size={16} />
            </a>
            <a href="#domains" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:border-primary-accent/40 hover:bg-surface-elevated transition-all">
              Explore Domains
            </a>
          </div>
        </motion.div>
        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </motion.div>
      </section>

      {/* Not Hiring Banner */}
      <section className="py-6 bg-surface-elevated border-b border-border">
        <div className="container-wide flex items-center justify-center gap-4 text-center">
          <div className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
          <p className="text-sm text-text-secondary font-inter">
            <span className="font-bold text-text-primary">Talent Network Open.</span> We don&apos;t have active job postings right now, but we welcome conversations with exceptional people. Submit your profile and we&apos;ll reach out when the right opportunity opens.
          </p>
        </div>
      </section>

      {/* Engineering Culture */}
      <section className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Life at CerebroHive</span>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">How We Think & Build</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">CerebroHive is not a consulting farm or a body shop. We are an engineering organization with research ambitions and enterprise-scale accountability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cultureValues.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0.4, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-8 rounded-2xl bg-surface border border-border hover:border-primary-accent/40 transition-all group">
                <v.icon size={32} className="text-primary-accent mb-5" strokeWidth={1.5} />
                <h3 className="font-space font-bold text-text-primary text-lg mb-3 group-hover:text-primary-accent transition-colors">{v.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section id="domains" className="section-pad border-b border-border bg-surface-elevated">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Future Opportunities</span>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">We Hire Across These Domains</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">When we open roles, they will fall within these areas. Build your profile now and we'll match you when a suitable opportunity arises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((d, i) => (
              <motion.div key={d.title} initial={{ opacity: 0.4, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-start gap-5 p-7 rounded-2xl bg-background border border-border hover:border-primary-accent/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center shrink-0 group-hover:bg-primary-accent/20 transition-colors">
                  <d.icon size={22} className="text-primary-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-space font-bold text-text-primary mb-2">{d.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{d.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Compensation & Benefits</span>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">What We Offer</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {benefits.map((b, i) => (
              <motion.div key={b.label} initial={{ opacity: 0.4, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border hover:border-primary-accent/40 transition-all">
                <b.icon size={28} className="text-primary-accent mb-4" strokeWidth={1.5} />
                <div className="font-space font-bold text-text-primary text-sm mb-2">{b.label}</div>
                <div className="text-text-muted text-xs leading-relaxed">{b.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="section-pad bg-surface-elevated">
        <div className="container-wide max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Talent Network</span>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Submit Your Profile</h2>
            <p className="text-text-secondary max-w-xl mx-auto">We review every submission. If your background aligns with our roadmap, a senior team member will reach out personally.</p>
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0.4, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 rounded-2xl bg-primary-accent/10 border border-primary-accent/30 flex flex-col items-center text-center gap-4">
              <CheckCircle2 size={48} className="text-primary-accent" />
              <h3 className="text-2xl font-space font-bold text-text-primary">Profile Received</h3>
              <p className="text-text-secondary max-w-sm">We've added your profile to our talent network. We review submissions quarterly and will reach out if we see a strong match.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 md:p-10 rounded-2xl bg-background border border-border shadow-elevated">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Full Name *</label>
                  <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alexandra Chen" className="px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="alex@acme.com" className="px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Domain / Role You&apos;re Interested In *</label>
                <input required value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. AI Research Engineer, Enterprise Consultant..." className="px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Portfolio / LinkedIn / GitHub</label>
                <input value={form.portfolio} onChange={(e) => setForm(f => ({ ...f, portfolio: e.target.value }))} placeholder="https://" className="px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Tell Us About Yourself *</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} placeholder="What are you working on? What kind of problems excite you? What are you looking for in your next role?" className="px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors resize-none" />
              </div>
              <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-3 px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-transform shadow-elevated mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                <Send size={16} />
                {isLoading ? "Sending…" : "Submit Profile"}
              </button>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

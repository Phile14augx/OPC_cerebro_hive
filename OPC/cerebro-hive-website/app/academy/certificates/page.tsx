import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Certificates — CerebroHive Academy",
  description:
    "CerebroHive Academy certifications: verifiable, revocable credentials issued on completion of an assessed learning path, anchored to the HiveIdentity registry.",
};

type Certification = {
  name: string;
  track: string;
  level: "Foundation" | "Professional" | "Expert";
  hours: number;
  assessment: string;
  path: string;
};

const CERTIFICATIONS: Certification[] = [
  {
    name: "Certified CerebroHive Practitioner",
    track: "Strategy",
    level: "Foundation",
    hours: 16,
    assessment: "Scenario exam · 60 questions · 75% to pass",
    path: "Enterprise AI Foundations",
  },
  {
    name: "Certified Agent Engineer",
    track: "Engineering",
    level: "Professional",
    hours: 40,
    assessment: "Hands-on lab · build and evaluate a production agent",
    path: "Agent Engineering with HiveForge",
  },
  {
    name: "Certified Workflow Architect",
    track: "Engineering",
    level: "Professional",
    hours: 32,
    assessment: "Hands-on lab · design a durable CerebroFlow pipeline",
    path: "Automation & Orchestration",
  },
  {
    name: "Certified AI Governance Lead",
    track: "Security",
    level: "Professional",
    hours: 28,
    assessment: "Case study · author a policy set and defend it in review",
    path: "AI Governance & Compliance",
  },
  {
    name: "Certified Platform Operator",
    track: "Operations",
    level: "Professional",
    hours: 36,
    assessment: "Incident simulation · triage, mitigate, and write the postmortem",
    path: "Platform Operations & AgentOps",
  },
  {
    name: "Certified Intelligence Mesh Architect",
    track: "Strategy",
    level: "Expert",
    hours: 60,
    assessment: "Capstone · design a multi-tenant mesh deployment, reviewed by a panel",
    path: "Enterprise Intelligence Mesh",
  },
];

const LEVEL_STYLE: Record<Certification["level"], string> = {
  Foundation: "border-primary-accent/40 bg-primary-accent/10 text-primary-accent",
  Professional: "border-yellow-400/40 bg-yellow-400/10 text-yellow-400",
  Expert: "border-purple-400/40 bg-purple-400/10 text-purple-400",
};

export default function CertificatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link
        href="/academy"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary transition-colors hover:text-primary-accent"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Academy
      </Link>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">
        CerebroHive Academy
      </p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">
        Certifications — verifiable, revocable, tied to a real assessment
      </h1>
      <p className="mt-3 max-w-3xl text-text-secondary">
        Every CerebroHive credential is issued only on a passed assessment, carries an expiry, and is
        independently verifiable. Credentials are anchored to the HiveIdentity registry, so a holder can
        prove a certificate and an employer can confirm it has not been revoked or superseded.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">Available certifications</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {CERTIFICATIONS.map((cert) => (
            <article key={cert.name} className="rounded-2xl border border-border bg-surface/40 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Award size={18} className="mt-0.5 shrink-0 text-primary-accent" aria-hidden="true" />
                  <h3 className="font-semibold text-text-primary">{cert.name}</h3>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${LEVEL_STYLE[cert.level]}`}
                >
                  {cert.level}
                </span>
              </div>
              <dl className="mt-3 space-y-1 text-xs text-text-secondary">
                <div className="flex gap-1.5">
                  <dt className="font-semibold text-text-primary">Track:</dt>
                  <dd>{cert.track}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="font-semibold text-text-primary">Effort:</dt>
                  <dd>{cert.hours} hours</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="font-semibold text-text-primary">Assessment:</dt>
                  <dd>{cert.assessment}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="font-semibold text-text-primary">Prepares via:</dt>
                  <dd>{cert.path}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-primary-accent/30 bg-primary-accent/5 p-5">
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary-accent" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-text-primary">How verification works</h2>
            <ul className="mt-3 space-y-1.5">
              {[
                "Each credential is issued with a unique ID, an issue date, and a two-year expiry.",
                "Verification resolves against HiveIdentity — no PDF is treated as proof on its own.",
                "Revocation is immediate and visible: a revoked credential fails verification, it does not merely lapse.",
                "Re-certification requires re-assessment against the current syllabus, not a renewal fee.",
                "Assessment results and issuance events are written to the immutable audit log.",
              ].map((line) => (
                <li key={line} className="flex gap-2 text-xs text-text-secondary">
                  <span aria-hidden="true" className="text-primary-accent">
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/academy/learning-paths"
          className="inline-flex items-center gap-1.5 rounded-md border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent transition-colors hover:bg-primary-accent/10"
        >
          Browse learning paths <ArrowRight size={14} aria-hidden="true" />
        </Link>
        <Link
          href="/academy/corporate-programs"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
        >
          Certify a team <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}

'use client';
import { useUser } from '@cerebro/auth';
import { PageContainer, PageHeader } from '@cerebro/ui';
import React, { useState } from 'react';

const modules = [
  { label: 'AI Planner',          href: '/planner',      color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',  desc: 'Turn ideas into structured project plans' },
  { label: 'Requirements Studio', href: '/requirements', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',        desc: 'Auto-generate PRDs, user stories, schemas' },
  { label: 'Architecture Studio', href: '/architect',    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',        desc: 'Microservices, DDD, clean architecture' },
  { label: 'UI/UX Studio',        href: '/ui-studio',    color: 'bg-pink-500/10 text-pink-400 border-pink-500/20',        desc: 'Branding, wireframes, design tokens' },
  { label: 'Code Generation',     href: '/codegen',      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',     desc: 'Multi-framework production code' },
  { label: 'Mobile Studio',       href: '/mobile',       color: 'bg-green-500/10 text-green-400 border-green-500/20',     desc: 'Android, iOS, React Native, Flutter' },
  { label: 'Web Studio',          href: '/web',          color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',           desc: 'CRM, ERP, SaaS, dashboards' },
  { label: 'Desktop Studio',      href: '/desktop',      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',  desc: 'Electron, Tauri, .NET MAUI' },
  { label: 'CerebroBots',         href: '/bots',         color: 'bg-red-500/10 text-red-400 border-red-500/20',           desc: 'WhatsApp, Slack, Teams, Voice bots' },
  { label: 'Backend Studio',      href: '/backend',      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',  desc: 'NestJS, Spring Boot, FastAPI, Go' },
  { label: 'Database Studio',     href: '/database',     color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',        desc: 'Schema, migrations, ER diagrams' },
  { label: 'API Studio',          href: '/api',          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',  desc: 'REST, GraphQL, gRPC, OpenAPI' },
  { label: 'Testing Intelligence',href: '/testing',      color: 'bg-lime-500/10 text-lime-400 border-lime-500/20',        desc: 'Unit, E2E, performance, security' },
  { label: 'AI Code Review',      href: '/review',       color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',  desc: 'SOLID, security, performance analysis' },
  { label: 'Deployment Studio',   href: '/deploy',       color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',desc: 'Docker, K8s, Terraform, CI/CD' },
  { label: 'Repository Manager',  href: '/repos',        color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',     desc: 'Git repos, commits, PRs by AI agents' },
  { label: 'AI Documentation',    href: '/docs',         color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',        desc: 'API refs, user guides, runbooks' },
];

export default function ForgeLanding() {
  const user = useUser();
  const [prompt, setPrompt] = useState('');

  return (
    <PageContainer>
      <PageHeader
        title="CerebroForge™ — AI Software Factory"
        description="Describe any software. Cerebro designs, builds, tests, and ships it."
      />

      {/* AI Build Input */}
      <div className="mt-8 relative">
        <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-amber-500/30 bg-background shadow-lg">
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder='e.g. "Build a Hospital ERP with patient management, billing, and doctor scheduling..."'
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
          />
          <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors text-sm">
            Build →
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Hospital ERP', 'Airline Booking', 'SaaS CRM', 'E-Commerce', 'Banking App'].map(s => (
            <button key={s} onClick={() => setPrompt(`Build a ${s}`)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-amber-400 hover:border-amber-500/30 transition-colors bg-background">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Studio Modules */}
      <div className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-5">
          {modules.length} Studio Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((mod, i) => (
            <a key={i} href={mod.href}
              className="p-5 rounded-2xl border bg-card hover:shadow-md transition-all group cursor-pointer">
              <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold mb-3 ${mod.color}`}>
                {mod.label}
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                {mod.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

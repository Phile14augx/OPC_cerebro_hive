"use client";

import Link from "next/link";
import { executivePathways } from "@/lib/config/pathways";

export function ExecutiveDecisionPlatform() {
  return (
    <section className="py-32 relative bg-background text-text-primary border-t border-border overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Executive Decision Center
          </h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto text-center">
            Select your role to explore tailored enterprise AI integration paths.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {executivePathways.map((pathway) => (
            <div 
              key={pathway.id}
              className="bg-surface border border-border rounded-2xl p-8 backdrop-blur-md flex flex-col h-full"
            >
              <h3 className="text-xl font-bold mb-6 text-text-primary border-b border-border pb-4">
                {pathway.role}
              </h3>
              
              <div className="flex flex-col gap-4 flex-grow justify-end">
                {pathway.actions.map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                      action.primary
                        ? "bg-primary-accent text-background font-semibold hover:bg-primary-accent/90"
                        : "bg-surface text-text-secondary border border-border hover:bg-surface-elevated"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{action.label}</span>
                      <span className="opacity-50">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Global Ecosystem Links */}
        <div className="mt-20 pt-10 border-t border-border flex flex-wrap justify-center gap-8 text-sm text-text-muted">
          <Link href="/products/cerebro-archive" className="hover:text-text-primary transition-colors">CerebroArchive</Link>
          <Link href="/research" className="hover:text-text-primary transition-colors">Research Hub</Link>
          <Link href="/legal/security" className="hover:text-text-primary transition-colors">Enterprise Trust Center</Link>
          <Link href="/tools/solution-finder" className="hover:text-text-primary transition-colors">ROI Calculator</Link>
          <Link href="/platform/live-runtime" className="hover:text-text-primary transition-colors">Architecture Playground</Link>
        </div>

      </div>
    </section>
  );
}

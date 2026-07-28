"use client";

import { executivePathways } from "@/lib/config/pathways";
import { TrackedLink } from "@/components/cerebro/TrackedLink";

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
                  <TrackedLink
                    key={idx}
                    href={action.href}
                    analyticsEvent="executive_pathway_action_click"
                    analyticsCategory="executive-decision-platform"
                    analyticsLabel={`${pathway.role} - ${action.label}`}
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
                  </TrackedLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Global Ecosystem Links */}
        <div className="mt-20 pt-10 border-t border-border flex flex-wrap justify-center gap-8 text-sm text-text-muted">
          <TrackedLink href="/products/cerebro-archive" analyticsEvent="ecosystem_link_click" analyticsCategory="executive-decision-platform" analyticsLabel="CerebroArchive" className="hover:text-text-primary transition-colors">CerebroArchive</TrackedLink>
          <TrackedLink href="/research" analyticsEvent="ecosystem_link_click" analyticsCategory="executive-decision-platform" analyticsLabel="Research Hub" className="hover:text-text-primary transition-colors">Research Hub</TrackedLink>
          <TrackedLink href="/legal/security" analyticsEvent="ecosystem_link_click" analyticsCategory="executive-decision-platform" analyticsLabel="Enterprise Trust Center" className="hover:text-text-primary transition-colors">Enterprise Trust Center</TrackedLink>
          <TrackedLink href="/tools/solution-finder" analyticsEvent="ecosystem_link_click" analyticsCategory="executive-decision-platform" analyticsLabel="ROI Calculator" className="hover:text-text-primary transition-colors">ROI Calculator</TrackedLink>
          <TrackedLink href="/platform/live-runtime" analyticsEvent="ecosystem_link_click" analyticsCategory="executive-decision-platform" analyticsLabel="Architecture Playground" className="hover:text-text-primary transition-colors">Architecture Playground</TrackedLink>
        </div>

      </div>
    </section>
  );
}

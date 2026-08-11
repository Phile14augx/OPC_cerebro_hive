"use client";

import { impactMetrics } from "@/lib/config/impact";

export function ProofOfImpact() {
  return (
    <section className="py-24 relative bg-background text-text-primary border-t border-border">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Proven Enterprise Impact
          </h2>
          <p className="text-xl text-text-muted">
            We don't just build models; we engineer measurable business outcomes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactMetrics.map((impact) => (
            <div 
              key={impact.id} 
              className="bg-surface border border-border rounded-2xl p-8 backdrop-blur-sm flex flex-col justify-between hover:bg-surface-elevated transition-colors"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-6">
                  {impact.domain}
                </span>
                
                <h3 className="text-5xl font-bold text-text-primary mb-2">
                  {impact.metric}
                </h3>
                <p className="text-lg font-medium text-text-secondary mb-8">
                  {impact.label}
                </p>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-text-muted leading-relaxed">
                  <span className="font-semibold text-text-secondary block mb-1">Architecture:</span>
                  {impact.architecture}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

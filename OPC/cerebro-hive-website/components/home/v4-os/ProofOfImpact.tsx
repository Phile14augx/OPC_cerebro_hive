"use client";

import { impactMetrics } from "@/lib/config/impact";

export function ProofOfImpact() {
  return (
    <section className="py-24 relative bg-black text-white border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Proven Enterprise Impact
          </h2>
          <p className="text-xl text-gray-400">
            We don't just build models; we engineer measurable business outcomes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactMetrics.map((impact) => (
            <div 
              key={impact.id} 
              className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm flex flex-col justify-between hover:bg-white/10 transition-colors"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-6">
                  {impact.domain}
                </span>
                
                <h3 className="text-5xl font-bold text-white mb-2">
                  {impact.metric}
                </h3>
                <p className="text-lg font-medium text-gray-300 mb-8">
                  {impact.label}
                </p>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400 leading-relaxed">
                  <span className="font-semibold text-gray-300 block mb-1">Architecture:</span>
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

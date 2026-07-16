"use client";

import React from "react";
import { ArrowRight, MapPin, Code, Cpu, Target } from "lucide-react";

export default function GlobalOperatingModel() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Global Operating Model</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            Our teams are distributed to ensure continuous development, global research coverage, and 24/7 enterprise support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          <div className="p-8 rounded-2xl bg-surface border border-border">
            <MapPin size={24} className="text-accent-secondary mb-6" />
            <h3 className="text-xl font-space font-bold text-text-primary mb-2">Headquarters</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">India</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              The center of our operations, driving product strategy, enterprise consulting, and customer success globally.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border">
            <Code size={24} className="text-accent-primary mb-6" />
            <h3 className="text-xl font-space font-bold text-text-primary mb-2">Platform Engineering</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Distributed</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Our core infrastructure teams operate across major technical hubs, ensuring resilient systems and compliance.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border">
            <Cpu size={24} className="text-[#7B61FF] mb-6" />
            <h3 className="text-xl font-space font-bold text-text-primary mb-2">AI Research</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Global Network</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Our research division collaborates with academic institutions and open-source communities worldwide.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

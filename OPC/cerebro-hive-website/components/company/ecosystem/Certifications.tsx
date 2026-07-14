"use client";

import React from "react";
import { certifications } from "@/lib/content/company/certifications";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export const Certifications = () => {
  return (
    <section className="section-pad-sm bg-background border-y border-border">
      <div className="container-wide max-w-4xl">
        
        <div className="flex flex-col md:flex-row gap-12">
          {/* Achieved */}
          <div className="flex-1">
            <h3 className="text-sm font-space font-bold uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary-accent" />
              Achieved Certifications
            </h3>
            {certifications.achieved.length > 0 ? (
              <ul className="space-y-4">
                {certifications.achieved.map(cert => (
                  <li key={cert} className="px-6 py-4 rounded-xl bg-surface-elevated border border-primary-accent/20 font-space font-medium text-text-primary">
                    {cert}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-4 rounded-xl bg-surface-elevated border border-border text-text-muted font-inter italic text-sm">
                No active certifications to display.
              </div>
            )}
          </div>

          {/* Roadmap */}
          <div className="flex-1">
            <h3 className="text-sm font-space font-bold uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
              <ShieldAlert size={16} className="text-warning" />
              Certification Roadmap
            </h3>
            {certifications.roadmap.length > 0 ? (
              <ul className="space-y-4 opacity-70">
                {certifications.roadmap.map(cert => (
                  <li key={cert} className="px-6 py-4 rounded-xl bg-surface-elevated border border-border font-space text-text-secondary border-dashed">
                    {cert}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-4 rounded-xl bg-surface-elevated border border-border text-text-muted font-inter italic text-sm">
                Roadmap currently empty.
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

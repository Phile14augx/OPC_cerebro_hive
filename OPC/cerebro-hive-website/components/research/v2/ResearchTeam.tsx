"use client";

import React from "react";
import { Code2, Users, FileText, FlaskConical, ExternalLink } from "lucide-react";
import { withBasePath } from "@/lib/utils";

const researchers = [
  {
    name: "Dr. Elena Rostova",
    role: "Head of AI Architecture",
    interests: ["Agentic Networks", "Distributed Memory Systems"],
    stats: { papers: 14, experiments: 8, talks: 5 },
    avatar: "/images/people/elena.jpg"
  },
  {
    name: "Marcus Chen",
    role: "Lead Research Engineer",
    interests: ["RAG Optimization", "Vector Databases", "Compliance"],
    stats: { papers: 9, experiments: 12, talks: 2 },
    avatar: "/images/people/marcus.jpg"
  },
  {
    name: "Dr. Sarah Jenkins",
    role: "Director of AI Evaluation",
    interests: ["Automated Benchmarking", "Hallucination Mitigation"],
    stats: { papers: 11, experiments: 15, talks: 7 },
    avatar: "/images/people/sarah.jpg"
  }
];

export const ResearchTeam = () => {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Research Authors</h2>
            <p className="text-text-secondary max-w-2xl font-inter">
              The engineers and scientists building the CerebroHive platform.
            </p>
          </div>
          <button className="text-sm font-bold text-primary-accent hover:text-text-primary transition-colors flex items-center gap-2">
            View All Staff <ExternalLink size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {researchers.map((person, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-6 hover:border-border-strong transition-colors">
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-surface-secondary border border-border overflow-hidden flex items-center justify-center shrink-0">
                  {/* Fallback avatar if image missing */}
                  <div className="text-xl font-bold text-text-muted">{person.name.charAt(0)}</div>
                </div>
                <div>
                  <h3 className="text-lg font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                    {person.name}
                  </h3>
                  <div className="text-xs text-primary-accent uppercase tracking-widest font-bold">
                    {person.role}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Research Interests</div>
                <div className="flex flex-wrap gap-2">
                  {person.interests.map((interest, j) => (
                    <span key={j} className="px-2 py-1 rounded bg-surface border border-border text-xs text-text-secondary">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-4 border-t border-border mb-4 text-center">
                <div>
                  <div className="text-text-primary font-bold flex items-center justify-center gap-1"><FileText size={12} className="text-text-muted"/> {person.stats.papers}</div>
                  <div className="text-[9px] uppercase tracking-widest text-text-muted mt-1">Papers</div>
                </div>
                <div>
                  <div className="text-text-primary font-bold flex items-center justify-center gap-1"><FlaskConical size={12} className="text-accent-secondary"/> {person.stats.experiments}</div>
                  <div className="text-[9px] uppercase tracking-widest text-text-muted mt-1">Exps</div>
                </div>
                <div>
                  <div className="text-text-primary font-bold">{person.stats.talks}</div>
                  <div className="text-[9px] uppercase tracking-widest text-text-muted mt-1">Talks</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button className="p-2 rounded-lg bg-surface text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
                  <Code2 size={16} />
                </button>
                <button className="p-2 rounded-lg bg-surface text-text-secondary hover:bg-[#0077b5] hover:text-text-primary transition-colors">
                  <Users size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

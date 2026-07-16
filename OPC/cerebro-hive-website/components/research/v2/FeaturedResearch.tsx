"use client";

import React from "react";
import { ArrowRight, Clock, User, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const featured = {
  category: "Applied Research",
  title: "Agentic Retrieval-Augmented Generation in High-Compliance Environments",
  desc: "An architectural deep-dive into maintaining strict data governance while deploying autonomous agents across siloed enterprise databases. We evaluate our novel routing mechanism against standard RAG baselines.",
  authors: "Dr. Elena Rostova, Marcus Chen",
  date: "October 12, 2025",
  readTime: "14 min read"
};

const trending = [
  { title: "Dynamic Task Planning for ERP Automation", category: "Production Systems", date: "Sep 28" },
  { title: "Mitigating Hallucinations via Multi-Agent Debate", category: "Foundational", date: "Sep 14" },
  { title: "The Economics of Small Specialized Models", category: "Applied Research", date: "Aug 30" }
];

export const FeaturedResearch = () => {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-space font-bold text-text-primary">Editorial Curation</h2>
          <button className="text-sm font-bold text-primary-accent hover:text-white transition-colors flex items-center gap-2">
            View All Publications <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Feature */}
          <div className="lg:col-span-8 group cursor-pointer">
            <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 h-full flex flex-col justify-end relative overflow-hidden transition-all hover:border-primary-accent/50">
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/80 to-transparent z-10" />
              {/* Simulated cover image abstract */}
              <div className="absolute inset-0 opacity-20 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `radial-gradient(circle at 50% 0%, #00F57A 0%, transparent 70%)` }} />
              
              <div className="relative z-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-text-primary uppercase tracking-widest mb-6">
                  {featured.category}
                </div>
                <h3 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4 leading-tight group-hover:text-primary-accent transition-colors">
                  {featured.title}
                </h3>
                <p className="text-text-secondary text-lg mb-8 max-w-2xl">
                  {featured.desc}
                </p>
                <div className="flex flex-wrap items-center gap-6 text-xs text-text-muted font-medium">
                  <div className="flex items-center gap-2"><User size={14} className="text-primary-accent" /> {featured.authors}</div>
                  <div className="flex items-center gap-2"><Clock size={14} /> {featured.readTime}</div>
                  <div>{featured.date}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trending List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-black/40 border border-border rounded-2xl p-6 mb-2">
              <div className="text-xs uppercase tracking-widest text-accent-secondary font-bold mb-1 flex items-center gap-2">
                <Bookmark size={14} /> Trending Now
              </div>
            </div>
            
            {trending.map((item, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-6 group cursor-pointer hover:bg-white/5 transition-colors flex flex-col justify-between h-full">
                <div>
                  <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-3">{item.category}</div>
                  <h4 className="text-lg font-space font-bold text-text-primary mb-2 leading-snug group-hover:text-[#00E5FF] transition-colors">{item.title}</h4>
                </div>
                <div className="text-xs text-text-muted mt-4">{item.date}</div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

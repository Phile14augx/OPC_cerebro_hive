"use client";

import React from "react";
import { motion } from "framer-motion";
import { FlaskConical, FileText, BarChart, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

const researchItems = [
  {
    title: "The Economics of AI Agents",
    type: "Whitepaper",
    icon: FileText,
    desc: "A quantitative analysis of ROI across 50 enterprise agent deployments.",
    date: "August 2024"
  },
  {
    title: "RAG vs. Fine-Tuning Benchmarks",
    type: "Benchmark",
    icon: BarChart,
    desc: "Performance and cost comparison for enterprise knowledge retrieval.",
    date: "July 2024"
  },
  {
    title: "Secure LLM Gateway Architecture",
    type: "Architecture Pattern",
    icon: BookOpen,
    desc: "Reference architecture for deploying generative AI in highly regulated environments.",
    date: "June 2024"
  }
];

export function ResearchLayer() {
  return (
    <section className="py-24 border-b border-border bg-background relative overflow-hidden">
      
      {/* Background visual */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-surface-elevated to-transparent hidden lg:block" />

      <div className="container-wide relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-6">
            <FlaskConical size={14} className="text-primary-accent" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">CerebroHive Labs</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Research-Driven Implementation</h2>
          <p className="text-text-secondary text-lg mb-8">
            Our solutions are backed by rigorous research. We constantly benchmark foundation models, test orchestration frameworks, and publish our findings to ensure your architecture is state-of-the-art.
          </p>

          <Link href="/research" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary-accent hover:text-[#00E5FF] transition-colors">
            Explore All Research <ArrowRight size={16} />
          </Link>
        </div>

        {/* Right Content - Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {researchItems.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface border border-border p-6 rounded-2xl hover:border-primary-accent/40 transition-colors shadow-sm group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-muted font-bold">
                  <item.icon size={12} className="text-primary-accent" />
                  {item.type}
                </div>
                <span className="text-[10px] text-text-muted">{item.date}</span>
              </div>
              <h3 className="font-space font-bold text-text-primary text-sm mb-2 group-hover:text-primary-accent transition-colors">{item.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-2">{item.desc}</p>
            </motion.div>
          ))}
          
          {/* Daily Briefing Signup Card */}
          <div className="bg-primary-accent/5 border border-primary-accent/20 p-6 rounded-2xl flex flex-col justify-center items-start">
             <h3 className="font-space font-bold text-text-primary text-sm mb-2">Enterprise AI Briefing</h3>
             <p className="text-xs text-text-secondary mb-4">Get our weekly technical breakdown of AI research and architecture patterns.</p>
             <div className="flex w-full gap-2">
               <input type="email" placeholder="Enter work email" className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary-accent" />
               <button className="bg-primary-accent text-black px-4 py-2 rounded-lg text-xs font-bold hover:shadow-elevated transition-shadow">Subscribe</button>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}

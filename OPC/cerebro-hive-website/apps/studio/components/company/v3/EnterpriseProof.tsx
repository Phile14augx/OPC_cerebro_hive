"use client";

import React, { useState } from "react";
import { BookOpen, Box, Cpu, Building2, Code, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const categories = [
  { id: "research", label: "Research", icon: BookOpen, stat: "35+", subtitle: "Papers Published" },
  { id: "products", label: "Products", icon: Box, stat: "3", subtitle: "Enterprise Platforms" },
  { id: "frameworks", label: "Frameworks", icon: Cpu, stat: "12", subtitle: "Architecture Blueprints" },
  { id: "industry", label: "Industry", icon: Building2, stat: "42+", subtitle: "F500 Deployments" },
  { id: "opensource", label: "Open Source", icon: Code, stat: "120+", subtitle: "Repositories" },
  { id: "community", label: "Community", icon: Users, stat: "10k+", subtitle: "Engineers & Researchers" },
];

export default function EnterpriseProof() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">The Breadth of our Ecosystem</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter text-center">
            We don't just build software. We contribute to the foundational science of AI, maintain open standards, and foster a global community of enterprise architects.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-3",
                activeCategory === cat.id ? "bg-surface-elevated border-border shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-105" : "bg-surface border-border hover:border-border-strong"
              )}
            >
              <cat.icon size={24} className={activeCategory === cat.id ? "text-text-primary" : "text-text-muted"} />
              <div className="font-space font-bold text-sm text-text-primary">{cat.label}</div>
            </button>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 md:p-16 min-h-[300px] flex items-center justify-center text-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {categories.map(cat => cat.id === activeCategory && (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0.4, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <div className="text-6xl md:text-8xl font-space font-bold text-text-primary mb-4 tracking-tighter">
                  {cat.stat}
                </div>
                <div className="text-xl md:text-2xl text-text-secondary font-inter">
                  {cat.subtitle}
                </div>
                <button className="mt-8 px-6 py-3 border border-border rounded-lg text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-surface transition-colors">
                  Explore {cat.label}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

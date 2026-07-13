"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { executiveLeadership as leadershipTeam } from "@/lib/content/company/leadership";
import { ArrowUpRight, Globe, ChevronDown } from "lucide-react";
import Image from "next/image";
import { cn, withBasePath } from "@/lib/utils";

// Group the team by category
const groupedLeadership = leadershipTeam.reduce((acc, leader) => {
  if (!acc[leader.category]) {
    acc[leader.category] = [];
  }
  acc[leader.category].push(leader);
  return acc;
}, {} as Record<string, typeof leadershipTeam>);

const categories = ["Executive", "Engineering", "Research", "Product", "Operations"];

export const LeadershipGrid = () => {
  // Open by default for Executive
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Executive: true,
    Engineering: true,
    Research: true,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <section className="section-pad overflow-hidden bg-background">
      <div className="container-wide">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24 border-b border-border pb-12">
          <div className="max-w-2xl">
            <h2 className="text-sm font-space font-bold tracking-widest uppercase text-text-muted mb-4">
              Our Leadership
            </h2>
            <h3 className="text-4xl md:text-5xl font-space font-bold text-text-primary tracking-tight">
              Guided by Experience. <br/>
              Driven by <span className="text-primary-accent">Execution.</span>
            </h3>
          </div>
          <p className="text-text-secondary font-inter max-w-sm">
            Our leadership team brings decades of experience scaling enterprise software, securing regulated architectures, and delivering measurable ROI.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {categories.map((category) => {
            const team = groupedLeadership[category];
            // If we don't have members for this category in our dummy data, skip rendering or render empty state.
            // Let's only render if there are members to keep it clean.
            if (!team || team.length === 0) return null;

            const isExpanded = !!expandedCategories[category];

            return (
              <div key={category} className="border border-border rounded-3xl bg-surface-elevated overflow-hidden">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-white/[0.02] transition-colors"
                >
                  <h4 className="text-2xl font-space font-bold text-text-primary">
                    {category}
                  </h4>
                  <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-surface">
                    <ChevronDown size={20} className={cn("text-text-secondary transition-transform duration-300", isExpanded && "rotate-180")} />
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 md:p-8 pt-0 border-t border-border mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((leader, index) => (
                          <motion.div
                            key={leader.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="group cursor-pointer"
                          >
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-surface border border-border">
                              {/* Fallback pattern */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                              </div>
                              
                              {/* Leader Image */}
                              {leader.image && (
                                <Image 
                                  src={withBasePath(leader.image)} 
                                  alt={leader.name} 
                                  fill 
                                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 z-0" 
                                />
                              )}

                              
                              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                              
                              <div className="absolute bottom-4 right-4 z-20 flex gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <button className="w-8 h-8 rounded-full bg-surface/80 backdrop-blur border border-border flex items-center justify-center text-text-primary hover:text-primary-accent hover:border-primary-accent transition-colors">
                                  <Globe size={14} />
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-xl font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                                  {leader.name}
                                </h4>
                                <ArrowUpRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
                              </div>
                              <p className="text-sm font-space font-medium text-text-secondary uppercase tracking-wider mb-3">
                                {leader.role}
                              </p>
                              <p className="text-sm text-text-muted font-inter leading-relaxed line-clamp-3">
                                {leader.bio}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

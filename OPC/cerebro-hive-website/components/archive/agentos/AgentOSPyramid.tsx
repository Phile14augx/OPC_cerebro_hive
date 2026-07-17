"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Users,
  Cpu,
  BrainCircuit,
  Server,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pyramidTiers } from "@/lib/data/products/agentos-pyramid";

const tierIcons: Record<string, LucideIcon> = {
  LayoutGrid,
  Users,
  Cpu,
  BrainCircuit,
  Server,
};

export const AgentOSPyramid = () => {
  const [activeTierId, setActiveTierId] = useState(pyramidTiers[2].id);
  const [activeSubsystemId, setActiveSubsystemId] = useState<string | null>(null);
  const activeTier = pyramidTiers.find((t) => t.id === activeTierId) || pyramidTiers[0];

  return (
    <section className="section-pad border-b border-border bg-background">
      <div className="container-wide">
        <SectionHeading
          label="The AgentOS Pyramid"
          title="Five layers. Twenty-four subsystems. One runtime."
          description="Every capability an enterprise needs from an AI operating system, organized the way an OS is organized: applications on top, infrastructure underneath."
        />

        <div className="grid lg:grid-cols-12 gap-8 mt-16">
          {/* Pyramid selector */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {pyramidTiers.map((tier, i) => {
              const Icon = tierIcons[tier.icon] || Server;
              const isActive = tier.id === activeTierId;
              return (
                <button
                  key={tier.id}
                  onClick={() => {
                    setActiveTierId(tier.id);
                    setActiveSubsystemId(null);
                  }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                    isActive
                      ? "bg-primary-accent/10 border-primary-accent/50 shadow-[0_0_20px_rgba(0,245,122,0.1)]"
                      : "bg-surface border-border hover:border-border-strong"
                  )}
                  style={{ marginLeft: `${i * 4}%`, width: `${100 - i * 4}%` }}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", isActive ? "bg-primary-accent/20 text-primary-accent" : "bg-surface-elevated text-text-muted group-hover:text-text-primary")}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{tier.tier}</div>
                    <div className={cn("font-space font-bold truncate", isActive ? "text-text-primary" : "text-text-secondary")}>{tier.name}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tier detail */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTier.id}
                initial={{ opacity: 0.4, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-surface border border-border rounded-2xl p-6 md:p-8 h-full"
              >
                <div className="mb-6 pb-6 border-b border-border">
                  <h3 className="text-2xl font-space font-bold text-text-primary mb-2">{activeTier.name}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{activeTier.description}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {activeTier.subsystems.map((sub) => {
                    const expanded = activeSubsystemId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubsystemId(expanded ? null : sub.id)}
                        className={cn(
                          "text-left p-4 rounded-xl border transition-all",
                          expanded ? "bg-background border-primary-accent/40" : "bg-background border-border hover:border-border-strong"
                        )}
                      >
                        <div className="text-sm font-bold text-text-primary mb-2">{sub.name}</div>
                        <AnimatePresence>
                          {expanded && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-text-secondary leading-relaxed mb-3 overflow-hidden"
                            >
                              {sub.blurb}
                            </motion.p>
                          )}
                        </AnimatePresence>
                        <div className="flex flex-wrap gap-1.5">
                          {(expanded ? sub.tags : sub.tags.slice(0, 3)).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-surface-elevated border border-border rounded text-[10px] text-text-muted">
                              {tag}
                            </span>
                          ))}
                          {!expanded && sub.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-[10px] text-text-muted">+{sub.tags.length - 3} more</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

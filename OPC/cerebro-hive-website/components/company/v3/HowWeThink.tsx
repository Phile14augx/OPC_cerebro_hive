"use client";

import React from "react";
import { BookOpen, Box, Cpu, Package, Target, Handshake, ArrowDown } from "lucide-react";

const steps = [
  { icon: BookOpen, title: "Research", desc: "Discovering fundamental capabilities in reasoning and agent orchestration.", color: "text-[#7B61FF]" },
  { icon: Box, title: "Frameworks", desc: "Standardizing discoveries into repeatable technical patterns.", color: "text-accent-secondary" },
  { icon: Cpu, title: "Engineering", desc: "Hardening frameworks for enterprise scale, security, and performance.", color: "text-accent-primary" },
  { icon: Package, title: "Products", desc: "Packaging engineering into intuitive platforms like AgentOS.", color: "text-warning" },
  { icon: Target, title: "Transformation", desc: "Deploying products to fundamentally rewire business operations.", color: "text-accent-secondary" },
  { icon: Handshake, title: "Long-term Partnership", desc: "Evolving the architecture as the enterprise scales.", color: "text-text-primary" }
];

export default function HowWeThink() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">How We Think</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            We don't do bespoke consulting. Every client engagement is backed by a rigorous pipeline that turns theoretical research into hardened enterprise products.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              
              <div className="w-full bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 group hover:border-border-strong transition-colors">
                <div className={`w-14 h-14 rounded-full bg-surface-elevated flex items-center justify-center shrink-0 border border-border ${step.color}`}>
                  <step.icon size={24} />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-space font-bold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-sm text-text-secondary">{step.desc}</p>
                </div>
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="py-4">
                  <ArrowDown size={20} className="text-text-muted" />
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

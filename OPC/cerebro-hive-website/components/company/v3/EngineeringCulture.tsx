"use client";

import React from "react";
import { Terminal, Users, Network, Code2 } from "lucide-react";

export default function EngineeringCulture() {
  return (
    <section className="py-24 border-b border-white/5 bg-[#05070A]">
      <div className="container-wide">
        
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-6">Our Engineering Culture</h2>
          <p className="text-lg text-text-secondary font-inter">
            We don't offer generic perks. We offer the hardest problems in enterprise AI and the autonomy to solve them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          <div className="p-8 rounded-2xl bg-surface border border-white/10 group hover:border-[#7B61FF]/50 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#7B61FF]/10 text-[#7B61FF] flex items-center justify-center">
                <Terminal size={24} />
              </div>
              <h3 className="text-xl font-space font-bold text-white">How We Build</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              We deploy to production daily. Engineers own the full lifecycle from architecture to monitoring. If it isn't automated, it's a bug.
            </p>
            <ul className="space-y-2">
              <li className="text-xs font-bold text-white flex items-center gap-2"><span className="text-[#7B61FF]">•</span> CI/CD as a religion</li>
              <li className="text-xs font-bold text-white flex items-center gap-2"><span className="text-[#7B61FF]">•</span> Infrastructure as Code</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-white/10 group hover:border-[#00E5FF]/50 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center">
                <Network size={24} />
              </div>
              <h3 className="text-xl font-space font-bold text-white">How We Research</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Research isn't siloed. Every researcher works directly with platform engineers to ensure models can scale reliably.
            </p>
            <ul className="space-y-2">
              <li className="text-xs font-bold text-white flex items-center gap-2"><span className="text-[#00E5FF]">•</span> Applied ML Labs</li>
              <li className="text-xs font-bold text-white flex items-center gap-2"><span className="text-[#00E5FF]">•</span> Open Source Contributions</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-white/10 group hover:border-[#00F57A]/50 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00F57A]/10 text-[#00F57A] flex items-center justify-center">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-space font-bold text-white">How We Collaborate</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              We prefer written design docs over endless meetings. Ideas are debated rigorously, but once a decision is made, we execute as a unit.
            </p>
            <ul className="space-y-2">
              <li className="text-xs font-bold text-white flex items-center gap-2"><span className="text-[#00F57A]">•</span> Asynchronous first</li>
              <li className="text-xs font-bold text-white flex items-center gap-2"><span className="text-[#00F57A]">•</span> Radical candor</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-white/10 group hover:border-[#FFB300]/50 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#FFB300]/10 text-[#FFB300] flex items-center justify-center">
                <Code2 size={24} />
              </div>
              <h3 className="text-xl font-space font-bold text-white">How We Innovate</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Hackathons are built into our operating rhythm. If you have a thesis that challenges our architecture, you have the budget to prove it.
            </p>
            <ul className="space-y-2">
              <li className="text-xs font-bold text-white flex items-center gap-2"><span className="text-[#FFB300]">•</span> Monthly Hack Weeks</li>
              <li className="text-xs font-bold text-white flex items-center gap-2"><span className="text-[#FFB300]">•</span> Innovation Grants</li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}

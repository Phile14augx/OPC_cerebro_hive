"use client";

import React from "react";
import { ArrowDown, X, Check } from "lucide-react";

export default function WhyCerebroHive() {
  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-6">A Different Approach.</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            We are not a traditional consulting firm that delivers a project and leaves. We are an engineering partner that builds and evolves your architecture.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Traditional Consulting */}
          <div className="bg-surface border border-white/10 rounded-2xl p-8 relative overflow-hidden opacity-70">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-400" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center text-red-400">
                <X size={20} />
              </div>
              <h3 className="text-xl font-space font-bold text-white">Traditional Consulting</h3>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-full p-4 rounded-lg bg-black/50 border border-white/5 text-center text-sm text-text-secondary font-bold">Discover</div>
              <ArrowDown size={16} className="text-white/20" />
              <div className="w-full p-4 rounded-lg bg-black/50 border border-white/5 text-center text-sm text-text-secondary font-bold">Design</div>
              <ArrowDown size={16} className="text-white/20" />
              <div className="w-full p-4 rounded-lg bg-black/50 border border-white/5 text-center text-sm text-text-secondary font-bold">Deliver Project</div>
              <ArrowDown size={16} className="text-white/20" />
              <div className="w-full p-4 rounded-lg bg-red-400/10 border border-red-400/20 text-center text-sm text-red-400 font-bold">Leave</div>
            </div>
          </div>

          {/* CerebroHive */}
          <div className="bg-surface border border-[#00E5FF]/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.05)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00E5FF]" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                <Check size={20} />
              </div>
              <h3 className="text-xl font-space font-bold text-white">CerebroHive</h3>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-full p-4 rounded-lg bg-black/50 border border-[#00E5FF]/10 text-center text-sm text-white font-bold">Research</div>
              <ArrowDown size={16} className="text-[#00E5FF]/50" />
              <div className="w-full p-4 rounded-lg bg-black/50 border border-[#00E5FF]/10 text-center text-sm text-white font-bold">Architecture</div>
              <ArrowDown size={16} className="text-[#00E5FF]/50" />
              <div className="w-full p-4 rounded-lg bg-black/50 border border-[#00E5FF]/10 text-center text-sm text-white font-bold">Platform</div>
              <ArrowDown size={16} className="text-[#00E5FF]/50" />
              <div className="w-full p-4 rounded-lg bg-black/50 border border-[#00E5FF]/10 text-center text-sm text-white font-bold">Deployment</div>
              <ArrowDown size={16} className="text-[#00E5FF]/50" />
              <div className="w-full p-4 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-center text-sm text-[#00E5FF] font-bold">Continuous Evolution</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

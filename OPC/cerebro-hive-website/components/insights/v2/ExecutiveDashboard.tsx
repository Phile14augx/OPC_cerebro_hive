"use client";

import React from "react";
import { Activity, Clock, ShieldCheck, Cpu, Briefcase, FileText, Globe2 } from "lucide-react";

const readinessIndex = [
  { metric: "AI Adoption", score: 76, color: "bg-[#00E5FF]" },
  { metric: "Data Readiness", score: 82, color: "bg-[#00F57A]" },
  { metric: "Automation", score: 68, color: "bg-[#FFB300]" },
  { metric: "Governance", score: 71, color: "bg-[#7B61FF]" },
  { metric: "AI Talent", score: 59, color: "bg-[#FF6B6B]" },
];

const dashboardStats = [
  { label: "AI Trends", value: "23 Active", icon: TrendingUpIcon },
  { label: "Research", value: "142 Papers", icon: BookOpenIcon },
  { label: "Market", value: "Updated Today", icon: Globe2 },
  { label: "Regulations", value: "8 Changes", icon: ShieldCheck },
  { label: "Enterprise", value: "12 Reports", icon: Briefcase },
];

// Helper icons since I didn't import all above
function TrendingUpIcon(props: any) { return <Activity {...props} />; }
function BookOpenIcon(props: any) { return <FileText {...props} />; }

export const ExecutiveDashboard = () => {
  return (
    <section className="py-12 border-b border-white/5 bg-[#05070A]">
      <div className="container-wide">
        
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left: General Stats Ticker */}
          <div className="lg:col-span-8 bg-surface border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold mb-6 flex items-center gap-2">
              <Clock size={12} /> Executive Intelligence Ticker
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {dashboardStats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <stat.icon size={16} className="text-text-muted" />
                  <div className="text-lg font-space font-bold text-white leading-tight">{stat.value}</div>
                  <div className="text-[9px] uppercase tracking-widest font-bold text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI Readiness Benchmark */}
          <div className="lg:col-span-4 bg-surface border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="text-[10px] uppercase tracking-widest text-[#00F57A] font-bold mb-6 flex items-center gap-2">
              <Cpu size={12} /> Enterprise AI Readiness Index
            </div>
            
            <div className="space-y-4">
              {readinessIndex.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 text-[10px] uppercase tracking-widest text-text-secondary font-bold truncate">
                    {item.metric}
                  </div>
                  <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }} />
                  </div>
                  <div className="w-6 text-right text-xs font-mono text-white font-bold">{item.score}</div>
                </div>
              ))}
            </div>
            
          </div>

        </div>

      </div>
    </section>
  );
};

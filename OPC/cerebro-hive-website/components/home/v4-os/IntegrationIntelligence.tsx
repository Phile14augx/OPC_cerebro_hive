"use client";

import { BrainCircuit } from "lucide-react";
import { ecosystemIntegrations } from "@/lib/config/ecosystem";
import { Node } from "@/components/ui/visualization/Node";
import { Edge } from "@/components/ui/visualization/Edge";

export function IntegrationIntelligence() {
  const categories = Array.from(new Set(ecosystemIntegrations.map((i) => i.category)));

  return (
    <section className="py-24 relative overflow-hidden bg-black text-white">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Integration Intelligence
          </h2>
          <p className="text-xl text-gray-400">
            Secure, bidirectional interoperability with your existing enterprise investments.
          </p>
        </div>

        {/* Abstract Constellation Layout */}
        <div className="relative max-w-5xl mx-auto aspect-video rounded-3xl border border-white/10 bg-white/[0.02] p-8 lg:p-16 flex items-center justify-center">
          
          {/* Central Cerebro OS Node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <Node icon={<BrainCircuit />} label="Cerebro OS" isActive size="lg" />
          </div>

          {/* Render Categories in an orbit-like structure */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {categories.map((category, index) => {
              // Calculate positions on a circle
              const angle = (index / categories.length) * Math.PI * 2;
              const radius = 40; // Percentage of container
              const top = `${50 + Math.sin(angle) * radius}%`;
              const left = `${50 + Math.cos(angle) * radius}%`;
              
              const integrations = ecosystemIntegrations.filter(i => i.category === category);

              return (
                <div 
                  key={category} 
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ top, left }}
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm shadow-xl pointer-events-auto">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 text-center">{category}</h3>
                    <div className="flex flex-col gap-2">
                      {integrations.map(integration => (
                        <div key={integration.id} className="text-sm text-gray-300 bg-black/40 px-3 py-1.5 rounded-md border border-white/5 text-center whitespace-nowrap">
                          {integration.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Edges simulating data flow */}
          <svg className="absolute inset-0 w-full h-full z-0 opacity-30" preserveAspectRatio="none">
            {categories.map((_, index) => {
               const angle = (index / categories.length) * Math.PI * 2;
               // SVG coordinates (0-100% equivalent)
               const x2 = 50 + Math.cos(angle) * 30; // Shorter radius to hit the box edge
               const y2 = 50 + Math.sin(angle) * 30;
               return (
                 <g key={index}>
                   <line x1="50%" y1="50%" x2={`${x2}%`} y2={`${y2}%`} stroke="url(#gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                 </g>
               )
            })}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

        </div>
      </div>
    </section>
  );
}

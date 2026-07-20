"use client";

import { complianceStandards, securityFeatures } from "@/lib/config/security";
import { ShieldCheck, Activity, Globe, Lock } from "lucide-react";

const getIcon = (iconStr: string) => {
  switch (iconStr) {
    case "ShieldCheck": return <ShieldCheck className="w-6 h-6 text-green-400" />;
    case "Activity": return <Activity className="w-6 h-6 text-blue-400" />;
    case "Globe": return <Globe className="w-6 h-6 text-indigo-400" />;
    case "Lock": return <Lock className="w-6 h-6 text-purple-400" />;
    default: return <ShieldCheck className="w-6 h-6 text-text-muted" />;
  }
};

export function EnterpriseSecurity() {
  return (
    <section className="py-24 relative overflow-hidden bg-background text-text-primary">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Uncompromising Security
          </h2>
          <p className="text-xl text-text-muted">
            Engineered for highly regulated industries. Zero data egress, immutable audit trails, and strict compliance.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Security Features Grid */}
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-4">
            {securityFeatures.map((feature) => (
              <div 
                key={feature.id} 
                className="bg-surface border border-border rounded-2xl p-6 backdrop-blur-sm hover:bg-surface-elevated transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Compliance Standards Panel */}
          <div className="lg:col-span-4 bg-gradient-to-b from-white/10 to-white/5 border border-border rounded-2xl p-8 backdrop-blur-md">
            <h3 className="text-sm uppercase tracking-widest text-text-muted mb-6 font-semibold">
              Certified Compliance
            </h3>
            <div className="flex flex-col gap-6">
              {complianceStandards.map((standard) => (
                <div key={standard.id} className="flex gap-4 items-start">
                  <div className="p-2 bg-background/40 rounded-lg border border-border">
                    {getIcon(standard.icon)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">{standard.name}</h4>
                    <p className="text-sm text-text-muted mt-1">{standard.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

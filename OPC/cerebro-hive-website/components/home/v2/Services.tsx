import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

const services = [
  {
    title: "Enterprise AI Platforms",
    desc: "Architect, build, and scale custom AI infrastructure tailored to your proprietary data and operational needs.",
    visual: "bg-gradient-to-br from-[#0E131A] to-[#141B24] border border-white/5",
    accent: "text-primary-accent"
  },
  {
    title: "Agentic Workflows",
    desc: "Deploy autonomous digital workers that handle complex, multi-step processes across your software ecosystem.",
    visual: "bg-gradient-to-tr from-[#0E131A] to-[#141B24] border border-white/5",
    accent: "text-secondary-accent"
  }
];

export default function Services() {
  return (
    <section className="section-pad bg-secondary">
      <div className="container-wide">
        <SectionHeading 
          label="Services"
          title="World-Class Engineering"
          description="We do not just advise. We build. Our engineering teams deliver production-ready systems that scale."
          className="mb-16"
        />

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((svc, idx) => (
            <div key={idx} className="group relative rounded-3xl overflow-hidden bg-card border border-white/10 transition-all hover:border-white/20">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 pointer-events-none" />
              
              {/* Abstract Visual Placeholder */}
              <div className={`h-[300px] w-full ${svc.visual} relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity hex-pattern" />
                <div className={`w-32 h-32 rounded-full blur-[80px] bg-current opacity-50 ${svc.accent}`} />
              </div>

              <div className="relative z-20 p-8 md:p-12 -mt-20">
                <h3 className="text-3xl md:text-4xl font-space font-bold mb-4">
                  {svc.title}
                </h3>
                <p className="text-lg text-text-muted font-inter mb-8 max-w-md">
                  {svc.desc}
                </p>
                <AnimatedButton variant="outline">
                  Explore Architecture
                </AnimatedButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

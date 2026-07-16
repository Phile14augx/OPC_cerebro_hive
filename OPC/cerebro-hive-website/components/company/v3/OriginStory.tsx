"use client";

import React, { useState } from "react";
import { AlertTriangle, XCircle, Lightbulb, Zap, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const storySteps = [
  {
    id: "problem",
    icon: AlertTriangle,
    title: "The Enterprise AI Problem",
    content: "Enterprise AI today is deeply fragmented. Organizations are deploying dozens of isolated copilots, but fundamental knowledge remains trapped in silos, and automation is still disconnected.",
    color: "text-[#FFB300]",
    bgColor: "bg-[#FFB300]"
  },
  {
    id: "failure",
    icon: XCircle,
    title: "Why Existing Approaches Fail",
    content: "Most AI projects never reach production because they treat AI as an application layer. Building wrappers around LLMs without restructuring the underlying data architecture is a recipe for hallucinations and failure.",
    color: "text-red-400",
    bgColor: "bg-red-400"
  },
  {
    id: "insight",
    icon: Lightbulb,
    title: "The Insight",
    content: "We realized that to make AI work for the Fortune 500, we couldn't just sell software. We had to rethink the entire enterprise architecture—from the database to the decision engine.",
    color: "text-[#00E5FF]",
    bgColor: "bg-[#00E5FF]"
  },
  {
    id: "decision",
    icon: Zap,
    title: "The Decision",
    content: "We founded CerebroHive to bridge the gap between frontier AI research and production engineering. We stopped building tools and started building an operating system.",
    color: "text-[#7B61FF]",
    bgColor: "bg-[#7B61FF]"
  },
  {
    id: "mission",
    icon: Rocket,
    title: "Our Mission",
    content: "To build the infrastructure that allows organizations to become AI-native—transforming static knowledge into autonomous action.",
    color: "text-[#00F57A]",
    bgColor: "bg-[#00F57A]"
  }
];

export default function OriginStory() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide">
        
        <div className="mb-16 max-w-2xl">
          <h2 className="text-sm font-bold tracking-widest uppercase text-text-muted mb-4">Origin Story</h2>
          <h3 className="text-3xl md:text-5xl font-space font-bold text-white leading-tight">
            We didn't set out to build another AI company. We set out to solve a systems engineering problem.
          </h3>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Timeline Selector */}
          <div className="lg:col-span-5 relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-white/10" />
            <div className="flex flex-col gap-6">
              {storySteps.map((step, idx) => {
                const isActive = activeStep === idx;
                const isPast = activeStep > idx;
                
                return (
                  <button 
                    key={step.id} 
                    onClick={() => setActiveStep(idx)}
                    className="flex items-center gap-6 group text-left relative z-10"
                  >
                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? `border-[#0A0D14] ${step.bgColor} text-black` :
                      isPast ? `border-[#0A0D14] bg-white/10 text-white` :
                      `border-white/10 bg-[#0A0D14] text-text-muted group-hover:text-white group-hover:border-white/30`
                    }`}>
                      <step.icon size={20} />
                    </div>
                    <div className={`text-lg font-space font-bold transition-colors ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}>
                      {step.title}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Story Display */}
          <div className="lg:col-span-7">
            <div className="bg-surface border border-white/10 rounded-2xl p-8 md:p-16 min-h-[350px] flex items-center shadow-2xl relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 ${storySteps[activeStep].color}`}>
                    {React.createElement(storySteps[activeStep].icon, { size: 32 })}
                  </div>
                  <h4 className="text-2xl font-space font-bold text-white mb-6">{storySteps[activeStep].title}</h4>
                  <p className="text-xl text-text-secondary leading-relaxed font-inter font-light">
                    {storySteps[activeStep].content}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

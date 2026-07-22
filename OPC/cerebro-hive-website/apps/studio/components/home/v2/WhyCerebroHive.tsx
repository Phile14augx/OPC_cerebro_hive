"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Database, Cloud, LineChart, Sparkles, Bot, BrainCircuit, CheckCircle2, Server, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  {
    id: "digital",
    title: "Digital Transformation",
    subtitle: "Enterprise Foundation",
    description: "Modernize legacy systems and establish a digital backbone for future scaling.",
    metric: "40% Faster Processes",
    features: ["Paperless Workflows", "API Integration", "Data Digitization"],
    tech: ["PostgreSQL", "React", "Node.js"],
    icon: Database
  },
  {
    id: "cloud",
    title: "Cloud Native",
    subtitle: "Modern Infrastructure",
    description: "Migrate to scalable, resilient cloud architectures to eliminate operational bottlenecks.",
    metric: "99.99% Availability",
    features: ["Microservices", "Containerization", "Auto-scaling"],
    tech: ["Kubernetes", "AWS", "Azure"],
    icon: Cloud
  },
  {
    id: "predictive",
    title: "Predictive AI",
    subtitle: "Data-Driven Decisions",
    description: "Leverage machine learning for accurate forecasting and anomaly detection.",
    metric: "92% Forecast Accuracy",
    features: ["Time-Series Analysis", "Churn Prediction", "Fraud Detection"],
    tech: ["TensorFlow", "Scikit-Learn", "Snowflake"],
    icon: LineChart
  },
  {
    id: "generative",
    title: "Generative AI",
    subtitle: "Knowledge Intelligence",
    description: "Synthesize unstructured information and generate contextual content dynamically.",
    metric: "10x Knowledge Retrieval",
    features: ["RAG Pipelines", "Semantic Search", "Document Analysis"],
    tech: ["LLMs", "Vector DBs", "LangChain"],
    icon: Sparkles
  },
  {
    id: "agentic",
    title: "Agentic AI",
    subtitle: "Reasoning & Execution",
    description: "AI systems that reason, plan and execute multi-step enterprise workflows.",
    metric: "85% Task Automation",
    features: ["Multi-Agent Systems", "Workflow Automation", "Tool Integration"],
    tech: ["LangGraph", "Cerebro Gateway", "Function Calling"],
    icon: Bot
  },
  {
    id: "autonomous",
    title: "Autonomous Enterprise",
    subtitle: "Self-Optimizing Business",
    description: "Fully interconnected AI systems managing end-to-end enterprise operations.",
    metric: "24×7 Autonomous Ops",
    features: ["Self-Healing Systems", "Dynamic Resource Allocation", "Strategic Reasoning"],
    tech: ["Swarm AI", "Continuous Learning", "Digital Twins"],
    icon: BrainCircuit
  }
];

// Special glowing AI Core component for the final node
const AICore = ({ isActive }: { isActive: boolean }) => (
  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
    <motion.div 
      animate={isActive ? { scale: [1, 1.4, 1], rotate: 360, opacity: [0.5, 0.8, 0.5] } : { scale: 1, rotate: 0, opacity: 0.3 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 border border-primary-accent rounded-full border-dashed"
    />
    <motion.div 
      animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : { scale: 1, opacity: 0.1 }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-primary-accent blur-md rounded-full"
    />
    <div className={cn("relative z-10 p-2 rounded-full border border-border transition-colors duration-500", isActive ? "bg-surface-elevated text-primary-accent shadow-[0_0_20px_#00F57A]" : "bg-surface/50 text-text-muted")}>
      <BrainCircuit size={20} />
    </div>
  </div>
);

export default function WhyCerebroHive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(stages[0].id);

  // Scroll logic for the glowing line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });
  
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Intersection Observer to track active nodes
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most-intersecting entry (in case multiple fire at once)
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          // IDs are "stage-digital", "stage-cloud" etc. — strip the prefix
          const rawId = visible[0].target.id.replace("stage-", "");
          setActiveStage(rawId);
        }
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    stages.forEach((stage) => {
      const el = document.getElementById(`stage-${stage.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const activeData = stages.find(s => s.id === activeStage) || stages[0];

  return (
    <section className="section-pad bg-surface-elevated relative font-inter" ref={containerRef}>
      
      {/* Subtle Background Layer Transitions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence mode="wait">
           {activeStage === "digital" && (
             <motion.div key="bg-1" initial={{ opacity: 0.4 }} animate={{ opacity: 0.03 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
           )}
           {activeStage === "generative" && (
             <motion.div key="bg-2" initial={{ opacity: 0.4 }} animate={{ opacity: 0.05 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background" />
           )}
           {(activeStage === "agentic" || activeStage === "autonomous") && (
             <motion.div key="bg-3" initial={{ opacity: 0.4 }} animate={{ opacity: 0.08 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-accent/10 via-background to-background" />
           )}
        </AnimatePresence>
      </div>

      <div className="container-wide relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
           <span className="text-xs uppercase tracking-widest text-primary-accent font-bold mb-4 block">CerebroHive Enterprise Evolution</span>
           <h2 className="text-4xl md:text-5xl font-bold font-space text-text-primary tracking-tighter">The Journey to Autonomy</h2>
           <p className="mt-6 text-text-secondary text-lg">We don't just implement AI. We guide organizations through the inevitable evolution from traditional IT to fully self-optimizing enterprises.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
          
          {/* Left Column: The Timeline */}
          <div className="relative pl-12">
            {/* Background static line */}
            <div className="absolute left-[24px] top-4 bottom-4 w-px bg-border -translate-x-1/2 z-0" />
            
            {/* Animated glowing progress line */}
            <motion.div 
              style={{ scaleY, originY: 0 }}
              className="absolute left-[24px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary-accent/50 via-primary-accent to-primary-accent shadow-[0_0_15px_rgba(0,245,122,0.5)] -translate-x-1/2 z-10"
            />

            <div className="flex flex-col gap-24 relative z-20 py-8">
              {stages.map((stage, idx) => {
                const isActive = activeStage === stage.id;
                const isFinal = idx === stages.length - 1;
                
                return (
                  <div 
                    key={stage.id} 
                    id={`stage-${stage.id}`}
                    className="relative group cursor-pointer"
                    onClick={() => {
                      document.getElementById(`stage-${stage.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                  >
                    {/* Node Visual */}
                    <div className="absolute left-[-48px] top-0 -translate-x-1/2 bg-surface-elevated py-2 z-20">
                      {isFinal ? (
                         <AICore isActive={isActive} />
                      ) : (
                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500", isActive ? "border-primary-accent bg-primary-accent/10 shadow-[0_0_15px_rgba(0,245,122,0.3)] scale-125" : "border-border bg-surface group-hover:border-primary-accent/40")}>
                          <div className={cn("w-2 h-2 rounded-full transition-colors", isActive ? "bg-primary-accent" : "bg-transparent group-hover:bg-primary-accent/20")} />
                        </div>
                      )}
                    </div>
                    
                    {/* Content Block */}
                    <div className="pt-0.5">
                      <span className={cn("text-[10px] uppercase tracking-widest font-bold block mb-2 transition-colors duration-500", isActive ? "text-primary-accent" : "text-text-muted")}>
                         {stage.subtitle}
                      </span>
                      <h3 className={cn("text-2xl md:text-3xl font-space font-bold transition-colors duration-500", isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary")}>
                        {stage.title}
                      </h3>
                      
                      {/* Expandable Description */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div 
                            initial={{ opacity: 0.4, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                             <p className="text-sm text-text-secondary leading-relaxed pr-8">{stage.description}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sticky Dynamic Details */}
          <div className="hidden lg:block relative">
            <div className="sticky top-32 flex flex-col gap-6">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0.4, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-8 bg-surface border border-border rounded-3xl p-10 shadow-2xl relative overflow-hidden"
                >
                  {/* Background Icon Watermark */}
                  <div className="absolute -right-8 -bottom-8 opacity-5">
                    <activeData.icon size={250} />
                  </div>

                   <div className="flex items-center gap-4 border-b border-border pb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center text-primary-accent shrink-0">
                      <activeData.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold font-space text-text-primary">{activeData.title}</h4>
                      <p className="text-xs uppercase tracking-widest text-text-muted font-bold">{activeData.subtitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Primary Metric */}
                     <div className="col-span-2 bg-surface-elevated border border-border rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Business Outcome</span>
                      <span className="text-3xl font-mono font-bold text-text-primary tracking-tight">{activeData.metric}</span>
                    </div>

                    {/* Features */}
                     <div className="flex flex-col gap-4">
                      <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Capabilities</span>
                      <ul className="flex flex-col gap-3">
                        {activeData.features.map(feat => (
                          <li key={feat} className="flex items-start gap-2 text-sm text-text-secondary">
                            <CheckCircle2 size={16} className="text-primary-accent shrink-0 mt-0.5" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Technology */}
                     <div className="flex flex-col gap-4">
                      <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Technology Stack</span>
                      <div className="flex flex-wrap gap-2">
                        {activeData.tech.map(tech => (
                          <span key={tech} className="px-3 py-1.5 bg-surface-elevated border border-border rounded text-xs text-text-secondary flex items-center gap-2">
                            <Server size={12} className="text-text-muted"/>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                   <div className="mt-4 pt-6 border-t border-border">
                     <button className="text-sm font-bold text-primary-accent flex items-center gap-2 group hover:text-text-primary transition-colors">
                       View Architecture Reference <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>

                </motion.div>
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

"use client";
import React, { useRef, useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, CheckCircle2, Database, Cloud, Webhook, Activity, 
  Snowflake, Box, Triangle, Network, Share2, Waypoints, Bot, 
  Layers, Hexagon, Boxes, BrainCircuit, MessageSquare, Sparkles, 
  Cpu, Workflow, Users, Clock, GitMerge, Zap, BarChart2, LineChart, Code2
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Custom SVGs for the 8 modules
const VisDataSources = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
    <rect x="20" y="25" width="15" height="15" rx="2" strokeWidth="1" />
    <rect x="65" y="25" width="15" height="15" rx="2" strokeWidth="1" />
    <circle cx="50" cy="75" r="10" strokeWidth="1" />
    <path d="M27.5 40 L50 65" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
    <path d="M72.5 40 L50 65" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
  </svg>
);

const VisLakehouse = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
    <ellipse cx="50" cy="40" rx="30" ry="10" strokeWidth="1" />
    <path d="M20 40 v20 a30 10 0 0 0 60 0 v-20" strokeWidth="1" />
    <path d="M20 50 a30 10 0 0 0 60 0" strokeWidth="1" strokeDasharray="2 2" />
    <path d="M50 20 v10" strokeWidth="1.5" className="animate-pulse" />
  </svg>
);

const VisKnowledgeGraph = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
    <circle cx="30" cy="30" r="4" fill="currentColor" />
    <circle cx="70" cy="30" r="4" fill="currentColor" />
    <circle cx="50" cy="50" r="6" fill="currentColor" />
    <circle cx="30" cy="70" r="4" fill="currentColor" />
    <circle cx="70" cy="70" r="4" fill="currentColor" />
    <path d="M30 30 L50 50 L70 30" strokeWidth="1" />
    <path d="M30 70 L50 50 L70 70" strokeWidth="1" />
    <path d="M30 30 L30 70" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
    <path d="M70 30 L70 70" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
  </svg>
);

const VisVectorDB = () => {
  // Use a deterministic array of radii instead of Math.random() for hydration safety
  const radii = [1.2, 2.5, 1.8, 2.1, 1.5, 2.8, 1.1, 2.4, 1.9, 1.4, 2.7, 1.3, 2.6, 1.7, 2.2];
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
      {Array.from({ length: 15 }).map((_, i) => (
        <circle 
          key={i} 
          cx={20 + (i * 13) % 60} 
          cy={20 + (i * 27) % 60} 
          r={radii[i % radii.length]} 
          fill="currentColor" 
          className="animate-pulse" 
          style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
    <path d="M10 50 L90 50" strokeWidth="0.5" opacity="0.3" />
    <path d="M50 10 L50 90" strokeWidth="0.5" opacity="0.3" />
  </svg>
  );
};

const VisLLMCore = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
    <circle cx="50" cy="50" r="25" strokeWidth="1" strokeDasharray="4 2" className="animate-[spin_10s_linear_infinite]" />
    <circle cx="50" cy="50" r="15" strokeWidth="1.5" className="animate-[spin_7s_linear_infinite_reverse]" />
    <circle cx="50" cy="50" r="5" fill="currentColor" className="animate-pulse" />
  </svg>
);

const VisAgentSwarm = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
    <rect x="40" y="40" width="20" height="20" rx="4" strokeWidth="1.5" />
    <circle cx="20" cy="20" r="8" strokeWidth="1" />
    <circle cx="80" cy="20" r="8" strokeWidth="1" />
    <circle cx="20" cy="80" r="8" strokeWidth="1" />
    <circle cx="80" cy="80" r="8" strokeWidth="1" />
    <path d="M25 25 L40 40 M75 25 L60 40 M25 75 L40 60 M75 75 L60 60" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
  </svg>
);

const VisWorkflow = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
    <rect x="10" y="40" width="20" height="20" rx="2" strokeWidth="1" />
    <path d="M30 50 L45 50" strokeWidth="1" />
    <polygon points="55,30 65,50 55,70 45,50" strokeWidth="1" />
    <path d="M60 40 L75 20 M60 60 L75 80" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
    <rect x="75" y="10" width="15" height="15" rx="2" strokeWidth="1" />
    <rect x="75" y="70" width="15" height="15" rx="2" strokeWidth="1" />
  </svg>
);

const VisDashboard = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
    <rect x="10" y="15" width="80" height="70" rx="4" strokeWidth="1.5" />
    <line x1="10" y1="30" x2="90" y2="30" strokeWidth="1" />
    <rect x="20" y="45" width="25" height="30" rx="2" strokeWidth="1" />
    <rect x="55" y="45" width="25" height="30" rx="2" strokeWidth="1" />
    <path d="M25 65 L32 55 L40 60 L45 50" strokeWidth="1" className="text-current opacity-80" />
    <path d="M60 65 L65 58 L70 68 L75 50" strokeWidth="1" className="text-current opacity-80" />
  </svg>
);

const pipelineSteps = [
  {
    id: "ingest",
    phase: "Ingest",
    title: "Data Sources",
    subtitle: "Structured & Unstructured Enterprise Data",
    color: "rgba(59, 130, 246, 1)", // blue-500
    glowClass: "from-blue-500/20",
    textClass: "text-blue-400",
    borderClass: "border-blue-500",
    visual: VisDataSources,
    technologies: [
      { name: "PostgreSQL", Icon: Database },
      { name: "MongoDB", Icon: Database },
      { name: "S3", Icon: Cloud },
      { name: "REST APIs", Icon: Webhook },
      { name: "Kafka", Icon: Activity }
    ],
    features: ["Batch & Stream Ingestion", "Change Data Capture", "Unstructured Parsing", "API Connectors"],
    metric: "2.4B Records",
  },
  {
    id: "unify",
    phase: "Unify",
    title: "Lakehouse",
    subtitle: "Centralized Data Processing",
    color: "rgba(14, 165, 233, 1)", // sky-500
    glowClass: "from-sky-500/20",
    textClass: "text-sky-400",
    borderClass: "border-sky-500",
    visual: VisLakehouse,
    technologies: [
      { name: "Snowflake", Icon: Snowflake },
      { name: "Databricks", Icon: Box },
      { name: "Delta Lake", Icon: Triangle },
      { name: "Kafka", Icon: Activity }
    ],
    features: ["ACID Transactions", "Time Travel", "Data Governance", "Real-time Streaming"],
    metric: "98% Quality",
  },
  {
    id: "understand",
    phase: "Understand",
    title: "Knowledge Graph",
    subtitle: "Semantic Enterprise Memory",
    color: "rgba(6, 182, 212, 1)", // cyan-500
    glowClass: "from-cyan-500/20",
    textClass: "text-cyan-400",
    borderClass: "border-cyan-500",
    visual: VisKnowledgeGraph,
    technologies: [
      { name: "Neo4j", Icon: Network },
      { name: "RDF", Icon: Share2 },
      { name: "Ontology", Icon: Waypoints },
      { name: "GraphRAG", Icon: Bot }
    ],
    features: ["Entity Linking", "Relationship Discovery", "Graph Search", "Context Enrichment"],
    metric: "120 ms Query",
  },
  {
    id: "reason-1",
    phase: "Reason",
    title: "Vector DB",
    subtitle: "Multi-dimensional Embeddings",
    color: "rgba(20, 184, 166, 1)", // teal-500
    glowClass: "from-teal-500/20",
    textClass: "text-teal-400",
    borderClass: "border-teal-500",
    visual: VisVectorDB,
    technologies: [
      { name: "Pinecone", Icon: Layers },
      { name: "Milvus", Icon: Database },
      { name: "Qdrant", Icon: Hexagon },
      { name: "Weaviate", Icon: Boxes }
    ],
    features: ["Semantic Search", "Similarity Matching", "Hybrid Search", "Scalable Indexing"],
    metric: "99% Recall",
  },
  {
    id: "reason-2",
    phase: "Reason",
    title: "LLM Core",
    subtitle: "Neural Decision Engine",
    color: "rgba(16, 185, 129, 1)", // emerald-500
    glowClass: "from-emerald-500/20",
    textClass: "text-emerald-400",
    borderClass: "border-emerald-500",
    visual: VisLLMCore,
    technologies: [
      { name: "GPT-4o", Icon: BrainCircuit },
      { name: "Claude 3.5", Icon: MessageSquare },
      { name: "Gemini 1.5", Icon: Sparkles },
      { name: "Llama 3", Icon: Cpu }
    ],
    features: ["Few-shot Prompting", "Fine-tuning", "Function Calling", "Guardrails"],
    metric: "97% Accuracy",
  },
  {
    id: "decide",
    phase: "Decide",
    title: "Agent Swarm",
    subtitle: "Autonomous Digital Workers",
    color: "rgba(34, 197, 94, 1)", // green-500
    glowClass: "from-green-500/20",
    textClass: "text-green-400",
    borderClass: "border-green-500",
    visual: VisAgentSwarm,
    technologies: [
      { name: "LangGraph", Icon: Workflow },
      { name: "CrewAI", Icon: Users },
      { name: "AutoGen", Icon: Bot }
    ],
    features: ["Multi-Agent Routing", "Tool Execution", "Memory Management", "Self-Reflection"],
    metric: "24 Active Agents",
  },
  {
    id: "act",
    phase: "Act",
    title: "Workflow Orchestration",
    subtitle: "Intelligent Process Execution",
    color: "rgba(132, 204, 22, 1)", // lime-500
    glowClass: "from-lime-500/20",
    textClass: "text-lime-400",
    borderClass: "border-lime-500",
    visual: VisWorkflow,
    technologies: [
      { name: "Temporal", Icon: Clock },
      { name: "Camunda", Icon: GitMerge },
      { name: "n8n", Icon: Zap }
    ],
    features: ["Stateful Workflows", "Human-in-the-loop", "Error Handling", "Distributed Execution"],
    metric: "35 Workflows",
  },
  {
    id: "measure",
    phase: "Measure",
    title: "Enterprise Dashboard",
    subtitle: "Executive Analytics & ROI",
    color: "rgba(0, 245, 122, 1)", // primary-accent
    glowClass: "from-primary-accent/20",
    textClass: "text-primary-accent",
    borderClass: "border-primary-accent",
    visual: VisDashboard,
    technologies: [
      { name: "Power BI", Icon: BarChart2 },
      { name: "Grafana", Icon: LineChart },
      { name: "Custom React", Icon: Code2 }
    ],
    features: ["Real-time Metrics", "Predictive Analytics", "Drill-down Views", "Role-based Access"],
    metric: "99.99% Uptime",
  }
];

export default function ArchitectureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // GSAP Scroll Animation for Entrance
    const cards = gsap.utils.toArray<HTMLElement>('.arch-card', containerRef.current);
    const connectors = gsap.utils.toArray<HTMLElement>('.arch-connector', containerRef.current);
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 70%",
      }
    });

    cards.forEach((card, i) => {
      tl.fromTo(card, 
        { opacity: 0, y: 30, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)" },
        i === 0 ? 0 : "-=0.3"
      );
      
      if (i < connectors.length) {
        const line = connectors[i].querySelector('.connector-line');
        tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.inOut" }, "-=0.2");
      }
    });
  }, []);

  return (
    <section className="section-pad bg-[#050A0F] relative border-t border-white/5 font-inter overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(0,245,122,0.04),_transparent_60%)] pointer-events-none" />

      <div className="container-wide" ref={containerRef}>
        <SectionHeading 
          label="CerebroHive Framework"
          title="The AI-Native Blueprint"
          description="How we structure modern enterprise intelligence, from raw data to autonomous action. A living architecture."
          className="mb-16"
        />

        {/* Horizontal Scroll Wrapper */}
        <div 
          className="relative w-full overflow-x-auto pb-32 pt-10 scrollbar-hide" 
          ref={scrollWrapperRef}
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="flex items-start justify-start min-w-max px-4">
            {pipelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                
                {/* Module Card */}
                <div 
                  className="arch-card relative flex flex-col items-center"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Phase Label Above */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-space font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
                    {step.phase}
                  </div>

                  {/* Glassmorphism Card Core */}
                  <div 
                    className={cn(
                      "relative w-[280px] rounded-2xl bg-[#0A1018]/90 backdrop-blur-xl border transition-all duration-500 overflow-hidden flex flex-col",
                      hoveredIdx === idx ? `border-transparent shadow-[0_0_40px_rgba(0,0,0,0.7)] z-20 -translate-y-2` : "border-[#1A2332] shadow-xl z-10"
                    )}
                    style={{
                      borderColor: hoveredIdx === idx ? step.color : undefined,
                      boxShadow: hoveredIdx === idx ? `0 10px 40px -10px ${step.color}60` : undefined,
                    }}
                  >
                    {/* Top Section (Always Visible) */}
                    <div className="p-6 flex flex-col items-center text-center min-h-[260px] relative z-10">
                      
                      {/* Gradient Glow */}
                      <div className={cn("absolute inset-0 bg-gradient-to-b opacity-10 transition-opacity", step.glowClass, hoveredIdx === idx ? "opacity-30" : "")} />
                      
                      {/* Visual Icon */}
                      <div className={cn("w-14 h-14 mb-5 relative z-10 transition-colors duration-300 shrink-0", hoveredIdx === idx ? step.textClass : "text-white/40")}>
                        <step.visual />
                      </div>

                      {/* Titles */}
                      <div className="relative z-10">
                        <h3 className="text-[17px] font-space font-bold text-white mb-1">{step.title}</h3>
                        <p className="text-[12px] text-gray-400 leading-snug px-2">{step.subtitle}</p>
                      </div>

                      {/* Small metric pill at bottom of unexpanded state */}
                      <div className="mt-auto pt-4 relative z-10 flex justify-center w-full">
                        <div className={cn(
                          "inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-medium transition-opacity duration-300",
                          hoveredIdx === idx ? "opacity-0" : "opacity-100 text-white/70"
                        )}>
                          {step.metric}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content (Revealed on hover via CSS Grid animation) */}
                    <div 
                      className={cn(
                        "grid transition-all duration-500 ease-in-out relative z-10 bg-[#050A0F]/50",
                        hoveredIdx === idx ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-6 pt-2 flex flex-col items-center justify-between border-t border-white/5 text-center">
                          <div className="mt-2 w-full">
                            <h4 className="text-[10px] font-space text-white/40 uppercase tracking-wider mb-3">Key Capabilities</h4>
                            <ul className="flex flex-col gap-2 items-center">
                              {step.features.map((feature, fIdx) => (
                                <li key={fIdx} className="flex items-center justify-center gap-2 text-[12px] text-gray-300">
                                  <CheckCircle2 size={14} className={cn("shrink-0", step.textClass)} />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="w-full">
                            <h4 className="text-[10px] font-space text-white/40 uppercase tracking-wider mb-2 mt-5">Technologies</h4>
                            <div className="flex flex-wrap gap-3 justify-center">
                              {step.technologies.map((tech, tIdx) => (
                                <div 
                                  key={tIdx} 
                                  title={tech.name}
                                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:scale-110 transition-all cursor-pointer animate-[floatIcon_3s_ease-in-out_infinite]"
                                  style={{ animationDelay: `${tIdx * 0.15}s` }}
                                >
                                  <tech.Icon size={14} />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={cn("mt-6 text-[12px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-transform hover:-translate-y-0.5", step.textClass)}>
                            Learn More <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {idx < pipelineSteps.length - 1 && (
                  <div className="arch-connector relative w-12 h-[260px] flex items-center justify-center flex-shrink-0">
                    {/* The track */}
                    <div className="absolute top-[130px] left-0 w-full h-[2px] bg-white/5 overflow-hidden">
                      {/* The colored filled line */}
                      <div 
                        className="connector-line absolute top-0 left-0 h-full w-full origin-left"
                        style={{ background: `linear-gradient(to right, ${step.color}, ${pipelineSteps[idx+1].color})` }}
                      />
                      {/* Animated packet loop */}
                      <div className="absolute top-0 w-4 h-full bg-white blur-[2px] animate-data-flow" />
                    </div>
                  </div>
                )}

              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

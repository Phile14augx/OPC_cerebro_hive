"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Layers, Terminal, Database, Cloud, Zap, ArrowDown, Activity, Code, Paintbrush, Monitor, Cpu, Workflow, Network, Brain, Bot, Box, Share2, Search as SearchIcon, GitMerge, Snowflake, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";

// --- Data Models ---
const architectureLayers = [
  {
    id: "apps",
    title: "User Applications",
    desc: "Enterprise UIs & Interfaces",
    icon: Layers,
    delay: 1.0,
    technologies: [
      { name: "React", category: "Frontend", rating: 5, deployments: 45, desc: "Enterprise UI framework", icon: Code },
      { name: "Next.js", category: "Framework", rating: 5, deployments: 38, desc: "Server-side rendering", icon: Monitor },
      { name: "Tailwind", category: "Styling", rating: 5, deployments: 50, desc: "Utility CSS", icon: Paintbrush },
      { name: "Framer Motion", category: "Animation", rating: 4, deployments: 22, desc: "Complex UI motion", icon: Workflow }
    ]
  },
  {
    id: "agents",
    title: "AI Agent Platform",
    desc: "Autonomous Workflow Orchestration",
    icon: Terminal,
    delay: 0.8,
    technologies: [
      { name: "LangGraph", category: "Orchestration", rating: 5, deployments: 28, desc: "Stateful multi-actor LLM apps", icon: Network },
      { name: "CrewAI", category: "Framework", rating: 4, deployments: 14, desc: "Role-based agents", icon: Bot },
      { name: "AutoGen", category: "Framework", rating: 4, deployments: 19, desc: "Multi-agent conversations", icon: Brain },
      { name: "MCP", category: "Protocol", rating: 3, deployments: 8, desc: "Model Context Protocol", icon: Share2 }
    ]
  },
  {
    id: "llm",
    title: "LLM Gateway & Models",
    desc: "Inference & Routing",
    icon: Zap,
    delay: 0.6,
    technologies: [
      { name: "GPT-4o", category: "Model", rating: 5, deployments: 60, desc: "OpenAI multimodal model", icon: Cpu },
      { name: "Claude 3", category: "Model", rating: 5, deployments: 52, desc: "Anthropic Opus/Sonnet", icon: Cpu },
      { name: "Llama 3", category: "Model", rating: 4, deployments: 31, desc: "Meta open-weights", icon: Cpu },
      { name: "Gemini", category: "Model", rating: 4, deployments: 25, desc: "Google native multimodal", icon: Cpu }
    ]
  },
  {
    id: "knowledge",
    title: "Knowledge & Retrieval",
    desc: "Vector & Graph Databases",
    icon: Database,
    delay: 0.4,
    technologies: [
      { name: "Neo4j", category: "Graph DB", rating: 5, deployments: 22, desc: "Enterprise knowledge graphs", icon: Share2 },
      { name: "Pinecone", category: "Vector DB", rating: 5, deployments: 41, desc: "Managed vector search", icon: SearchIcon },
      { name: "Milvus", category: "Vector DB", rating: 4, deployments: 18, desc: "Scalable vector DB", icon: Box },
      { name: "Qdrant", category: "Vector DB", rating: 4, deployments: 15, desc: "High-performance retrieval", icon: Box }
    ]
  },
  {
    id: "data",
    title: "Data & Streaming Platform",
    desc: "Real-time Processing",
    icon: Activity,
    delay: 0.2,
    technologies: [
      { name: "Kafka", category: "Streaming", rating: 5, deployments: 33, desc: "Event streaming", icon: Activity },
      { name: "Spark", category: "Processing", rating: 4, deployments: 24, desc: "Big data processing", icon: GitMerge },
      { name: "Airflow", category: "Orchestration", rating: 5, deployments: 40, desc: "Pipeline orchestration", icon: Workflow },
      { name: "Snowflake", category: "Data Warehouse", rating: 5, deployments: 29, desc: "Cloud data platform", icon: Snowflake }
    ]
  },
  {
    id: "cloud",
    title: "Cloud & Infrastructure",
    desc: "Scalable Compute",
    icon: Cloud,
    delay: 0.0,
    technologies: [
      { name: "AWS", category: "Cloud", rating: 5, deployments: 55, desc: "Amazon Web Services", icon: Cloud },
      { name: "Azure", category: "Cloud", rating: 5, deployments: 42, desc: "Microsoft Azure", icon: Cloud },
      { name: "Kubernetes", category: "Containerization", rating: 5, deployments: 68, desc: "Container orchestration", icon: Server },
      { name: "Docker", category: "Containerization", rating: 5, deployments: 85, desc: "Container runtime", icon: Box }
    ]
  }
];

export default function TechStack() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  // Helper to determine if a layer/tech is highlighted based on search/filter
  const isMatch = (techName: string, layerId: string) => {
    if (searchQuery) return techName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter !== "all") {
      if (activeFilter === "ai" && (layerId === "agents" || layerId === "llm" || layerId === "knowledge")) return true;
      if (activeFilter === "cloud" && (layerId === "cloud" || layerId === "data")) return true;
      if (activeFilter === "frontend" && layerId === "apps") return true;
      return false;
    }
    return true; // If no filter/search, everything is normal
  };

  const isLayerActive = (layerId: string) => {
    if (searchQuery) return architectureLayers.find(l => l.id === layerId)?.technologies.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeFilter !== "all") {
      if (activeFilter === "ai" && (layerId === "agents" || layerId === "llm" || layerId === "knowledge")) return true;
      if (activeFilter === "cloud" && (layerId === "cloud" || layerId === "data")) return true;
      if (activeFilter === "frontend" && layerId === "apps") return true;
      return false;
    }
    return true;
  };

  return (
    <section className="section-pad bg-[#010306] relative overflow-hidden font-inter border-t border-white/5">
      
      {/* Ambient Blueprint Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="blueprint" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00F57A" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint)" />
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#010306]/80 to-[#010306]" />
      </div>

      <div className="container-wide relative z-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-primary-accent font-bold mb-4 block">Enterprise AI Ecosystem</span>
            <h2 className="text-4xl md:text-5xl font-bold font-space text-white tracking-tighter">Living Architecture</h2>
            <p className="mt-4 text-gray-400">See how we assemble best-in-class technologies into highly scalable, autonomous enterprise systems.</p>
          </div>
          
          {/* Controls: Search & Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-black/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary-accent/50 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {["all", "ai", "cloud", "frontend"].map(filter => (
                <button 
                  key={filter}
                  onClick={() => { setActiveFilter(filter); setSearchQuery(""); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                    activeFilter === filter ? "bg-primary-accent/10 border-primary-accent text-primary-accent" : "bg-transparent border-white/10 text-gray-500 hover:text-white"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Architecture Diagram */}
        <div className="relative max-w-4xl mx-auto flex flex-col gap-8 pb-10">
          
          {/* Animated Backbone Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2 z-0" />
          
          {/* Continuously Flowing Packets */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-0 overflow-hidden pointer-events-none">
             <motion.div initial={{ y: "100%" }} animate={{ y: "-100%" }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-0.5 h-32 bg-gradient-to-t from-transparent via-primary-accent to-transparent opacity-70 blur-[1px]" />
             <motion.div initial={{ y: "-100%" }} animate={{ y: "100%" }} transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }} className="w-0.5 h-20 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-50 blur-[1px]" />
          </div>

          {architectureLayers.map((layer, index) => {
            const isActive = isLayerActive(layer.id);
            const isLast = index === architectureLayers.length - 1;

            return (
              <motion.div 
                key={layer.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: isActive ? 1 : 0.2, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: layer.delay, ease: "easeOut" }}
                className="relative z-10 flex flex-col gap-4 group"
              >
                {/* Layer Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-3">
                    <layer.icon size={16} className={isActive ? "text-primary-accent" : "text-gray-600"} />
                    <h3 className={cn("text-sm font-bold font-space tracking-wide transition-colors", isActive ? "text-white" : "text-gray-500")}>
                      {layer.title}
                    </h3>
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono hidden md:block">{layer.desc}</span>
                </div>

                {/* Technologies Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {layer.technologies.map(tech => {
                    const techMatch = isMatch(tech.name, layer.id);
                    const isHovered = hoveredTech === tech.name;

                    return (
                      <div 
                        key={tech.name}
                        onMouseEnter={() => setHoveredTech(tech.name)}
                        onMouseLeave={() => setHoveredTech(null)}
                        className={cn(
                          "relative rounded-xl border transition-all duration-300 cursor-default overflow-hidden",
                          techMatch ? "bg-[#050A11] border-white/10 hover:border-primary-accent/50 hover:bg-[#0A1424]" : "bg-black/20 border-white/5 opacity-40 grayscale",
                          isHovered && techMatch ? "z-20 scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.8)]" : "z-10"
                        )}
                        style={{ padding: '20px' }}
                      >
                        {/* Hover Gradient */}
                        <div className={cn("absolute inset-0 bg-gradient-to-br from-primary-accent/5 to-transparent opacity-0 transition-opacity duration-300", isHovered && "opacity-100")} />
                        
                        <div className="relative z-10 flex flex-col h-full">
                          <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-2 font-bold block">{tech.category}</span>
                          <div className="flex items-center gap-2 mb-1">
                            {tech.icon && <tech.icon size={14} className={isHovered && techMatch ? "text-primary-accent" : "text-gray-500"} />}
                            <span className={cn("text-base font-bold font-space transition-colors", isHovered && techMatch ? "text-white" : "text-gray-300")}>{tech.name}</span>
                          </div>
                          
                          {/* Expanded Glass Card Content */}
                          <AnimatePresence>
                            {isHovered && techMatch && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: "auto" }} 
                                exit={{ opacity: 0, height: 0 }} 
                                style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}
                              >
                                <p style={{ fontSize: '10px', color: 'rgb(156,163,175)', lineHeight: '1.4' }}>{tech.desc}</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgb(107,114,128)' }}>System Maturity</span>
                                  <div style={{ display: 'flex', gap: '2px' }}>
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={cn("w-2.5 h-2.5", i < tech.rating ? "text-primary-accent fill-current" : "text-gray-700 fill-current")} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgb(107,114,128)' }}>Deployments</span>
                                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'white', fontWeight: 700 }}>{tech.deployments} Enterprise Apps</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Visual Data Link to next layer */}
                {!isLast && (
                  <div className="flex justify-center py-2 opacity-30">
                    <ArrowDown size={14} className={isActive ? "text-primary-accent animate-bounce" : "text-gray-600"} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise Metrics Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.2 }}
          className="max-w-4xl mx-auto mt-8 border-t border-white/10 pt-8 flex flex-wrap justify-around gap-6"
        >
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold font-mono text-white">60+</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">Core Technologies</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold font-mono text-white">20+</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">Cloud Services</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold font-mono text-white">15+</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">AI Frameworks</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold font-mono text-primary-accent">100+</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">Successful Deployments</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DigitalTwinConfig, NodeState, TwinNode, TwinConnection, TwinEvent } from "@/lib/data/industries/types";
import { Activity, Database, Server, Bot, Hexagon, Maximize2, Zap, LayoutDashboard } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IntelligentOrb } from "@/components/motion/primitives/IntelligentOrb";
import { HoverCard } from "@/components/motion/primitives/HoverCard";
import { AnimatedConnector } from "@/components/motion/primitives/AnimatedConnector";
import { PulseRing } from "@/components/motion/primitives/PulseRing";

interface Props {
  config?: DigitalTwinConfig;
}

export function EnterpriseDigitalTwin({ config }: Props) {
  const [viewMode, setViewMode] = useState<"overview" | "workflow" | "architecture" | "metrics">("workflow");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Simulation State
  const [simulationTime, setSimulationTime] = useState(0);
  const [activeEvents, setActiveEvents] = useState<TwinEvent[]>([]);
  const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>({});
  const [nodeMessages, setNodeMessages] = useState<Record<string, string>>({});

  // Restart simulation loop every 15 seconds
  useEffect(() => {
    if (!config) return;
    
    let startTime = Date.now();
    let animationFrameId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      
      // Loop every 15 seconds
      if (elapsed > 15000) {
        startTime = Date.now();
        setNodeStates({});
        setNodeMessages({});
        setActiveEvents([]);
      } else {
        setSimulationTime(elapsed);
        
        // Find events that should have fired by now
        const fired = config.events.filter(e => e.timeOffset <= elapsed);
        setActiveEvents(fired);
        
        // Update states based on the latest event for each node
        const newStates: Record<string, NodeState> = {};
        const newMsgs: Record<string, string> = {};
        
        fired.forEach(e => {
          newStates[e.nodeId] = e.state;
          newMsgs[e.nodeId] = e.message;
        });
        
        setNodeStates(newStates);
        setNodeMessages(newMsgs);
      }
      
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [config]);

  if (!config) return null;

  const views = [
    { id: "overview", label: "Overview", icon: Maximize2 },
    { id: "workflow", label: "Agent Workflow", icon: Activity },
    { id: "architecture", label: "Architecture", icon: Server },
    { id: "metrics", label: "Live KPI Metrics", icon: LayoutDashboard }
  ] as const;

  const currentNodes = viewMode === "workflow" ? config.workflow.nodes : config.architecture.nodes;
  const currentConnections = viewMode === "workflow" ? config.workflow.connections : config.architecture.connections;
  
  const selectedNode = currentNodes?.find(n => n.id === selectedNodeId);

  const getIcon = (type: TwinNode['type']) => {
    switch(type) {
      case "agent": return Bot;
      case "database": return Database;
      case "system": return Server;
      case "logic": return Hexagon;
      default: return Zap;
    }
  };

  const getOrbVariant = (type: TwinNode['type']) => {
    switch(type) {
      case "agent": return "agent";
      case "database": return "knowledge";
      case "system": return "executive";
      case "logic": return "reasoning";
      default: return "default";
    }
  };

  return (
    <section className="section-pad border-t border-border bg-background relative z-10 overflow-hidden">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <SectionHeading 
            label="Enterprise Digital Twin" 
            title="Live Operations Simulator" 
            description="Watch the AI operating system execute workflows autonomously across enterprise layers." 
          />
          
          {/* View Modes (Semantic Zoom) */}
          <div className="flex p-1 bg-surface-secondary border border-border rounded-xl">
            {views.map(view => (
              <button
                key={view.id}
                onClick={() => {
                  setViewMode(view.id);
                  setSelectedNodeId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  viewMode === view.id 
                    ? "bg-surface shadow-sm text-text-primary" 
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <view.icon size={16} />
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-[600px]">
          
          {/* Main Visualization Canvas Area (Controlled Layout) */}
          <div className={`theme-panel relative overflow-hidden flex flex-col p-8 transition-all duration-500 ${selectedNode ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            
            {/* Blueprint Background */}
            <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10" 
                 style={{ backgroundImage: 'linear-gradient(to right, #64748B 1px, transparent 1px), linear-gradient(to bottom, #64748B 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <AnimatePresence mode="wait">
              {viewMode === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col justify-center max-w-2xl">
                  <h3 className="text-4xl font-space font-bold mb-6">{config.overview.title}</h3>
                  <p className="text-xl text-text-secondary leading-relaxed mb-8">{config.overview.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <HoverCard className="p-6">
                      <div className="text-xs uppercase tracking-widest text-accent-primary font-bold mb-2">Integrations</div>
                      <div className="flex flex-wrap gap-2">
                        {config.integrations.map(int => (
                          <span key={int} className="px-2 py-1 bg-surface-secondary border border-border rounded text-xs text-text-secondary font-bold">{int}</span>
                        ))}
                      </div>
                    </HoverCard>
                    <HoverCard className="p-6">
                      <div className="text-xs uppercase tracking-widest text-[#7B61FF] font-bold mb-2">Agent Swarm</div>
                      <div className="flex flex-col gap-2">
                        {config.agents.map(ag => (
                          <div key={ag.id} className="text-sm font-bold flex items-center gap-2 text-text-secondary"><Bot size={14}/> {ag.name}</div>
                        ))}
                      </div>
                    </HoverCard>
                  </div>
                </motion.div>
              )}

              {(viewMode === "workflow" || viewMode === "architecture") && (
                <motion.div key={viewMode} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex-1 relative">
                  
                  {/* Semantic Node Grid Layout */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center w-full max-w-4xl relative z-10">
                      
                      {currentNodes?.map((node, i) => (
                        <React.Fragment key={node.id}>
                          <button
                            onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                            className={`relative flex flex-col items-center gap-3 transition-transform duration-300 ${
                              selectedNodeId === node.id ? 'scale-110' : 'hover:scale-105'
                            } ${selectedNodeId && selectedNodeId !== node.id ? 'opacity-40 grayscale' : 'opacity-100'}`}
                          >
                            <div className="relative">
                              {nodeStates[node.id] === 'completed' && <PulseRing size={80} count={1} duration={1.5} color="var(--success)" />}
                              
                              <IntelligentOrb 
                                state={nodeStates[node.id]} 
                                colorVariant={getOrbVariant(node.type)} 
                                icon={getIcon(node.type)}
                                size="lg"
                              />
                            </div>
                            
                            <div className="text-center relative z-10 bg-background/80 backdrop-blur rounded px-2 py-1">
                              <div className="font-space font-bold text-sm">{node.label}</div>
                              
                              {/* Reasoning State Animation */}
                              <div className="h-4 mt-1">
                                <AnimatePresence mode="wait">
                                  {nodeStates[node.id] && nodeStates[node.id] !== 'idle' && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                      className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold"
                                    >
                                      {nodeMessages[node.id]}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            
                            {/* Motion Design System Connector */}
                            {i < (currentNodes.length - 1) && (
                              <div className="absolute top-8 -right-[3.5rem] md:-right-[5rem] w-8 md:w-12 h-8 -translate-y-1/2 z-0">
                                <AnimatedConnector
                                  startX={0} startY={16} endX={48} endY={16}
                                  variant="straight"
                                  state={nodeStates[node.id] && nodeStates[node.id] !== 'idle' ? 'active' : 'idle'}
                                  showPacket={true}
                                />
                              </div>
                            )}
                          </button>
                        </React.Fragment>
                      ))}

                    </div>
                  </div>
                </motion.div>
              )}

              {viewMode === "metrics" && (
                <motion.div key="metrics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col justify-center items-center">
                  <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                    {config.metrics.map(metric => {
                      // Animate metric value based on simulation progress (completed state triggers change)
                      const isComplete = simulationTime > 12000;
                      const currentValue = isComplete ? metric.endValue : metric.startValue;
                      
                      return (
                        <HoverCard key={metric.id} className="p-8 text-center flex flex-col items-center justify-center">
                          <div className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4">{metric.label}</div>
                          <div className={`text-6xl font-space font-bold transition-all duration-1000 ${isComplete ? 'text-accent-primary scale-110' : 'text-text-primary'}`}>
                            {metric.prefix}{currentValue}{metric.suffix}
                          </div>
                        </HoverCard>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Live Indicator */}
            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-surface rounded-full border border-border shadow-sm">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-primary">Live Engine</span>
              <span className="text-[10px] text-text-muted font-mono ml-2">{(simulationTime / 1000).toFixed(1)}s</span>
            </div>
            
          </div>

          {/* Right-Hand Inspector Panel */}
          {selectedNode && (viewMode === 'workflow' || viewMode === 'architecture') && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-4 theme-card flex flex-col h-full overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-surface-secondary flex items-center gap-4">
                <IntelligentOrb state="idle" colorVariant={getOrbVariant(selectedNode.type)} icon={getIcon(selectedNode.type)} size="sm" />
                <div>
                  <h4 className="font-space font-bold text-lg text-text-primary">{selectedNode.label}</h4>
                  <div className="text-xs uppercase tracking-widest text-text-muted">{selectedNode.type}</div>
                </div>
              </div>
              
              <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                {selectedNode.purpose && (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-accent-primary font-bold mb-2">Purpose</div>
                    <p className="text-sm text-text-secondary leading-relaxed">{selectedNode.purpose}</p>
                  </div>
                )}
                
                {selectedNode.techStack && (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-[#7B61FF] font-bold mb-2">Technologies</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.techStack.map(tech => (
                        <span key={tech} className="px-2 py-1 bg-surface-secondary border border-border rounded text-xs font-bold text-text-secondary">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Simulated Log Feed */}
                <div>
                  <div className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Node Event Log</div>
                  <div className="bg-[#05070A] text-[#00F57A] font-jetbrains text-xs p-4 rounded-xl border border-border h-48 overflow-y-auto flex flex-col-reverse shadow-inner">
                    {activeEvents.filter(e => e.nodeId === selectedNode.id).map((e, idx) => (
                      <div key={idx} className="opacity-90 py-1">
                        <span className="text-text-muted mr-2">[{ (e.timeOffset / 1000).toFixed(1) }s]</span> 
                        {e.message}
                      </div>
                    ))}
                    {activeEvents.filter(e => e.nodeId === selectedNode.id).length === 0 && (
                      <div className="text-text-muted italic">Waiting for telemetry...</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}

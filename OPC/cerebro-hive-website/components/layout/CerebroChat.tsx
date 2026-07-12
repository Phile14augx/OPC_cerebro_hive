"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, Send, Network, Cpu, LineChart, FileText, Download, Briefcase, Zap, 
  Bot, Box, BrainCircuit, Activity, Lock, Database, Play, Cloud, Shield, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Sender = "user" | "bot" | "system";

interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  isGenerating?: boolean;
  actions?: { label: string; icon: any; action: string }[];
  businessImpact?: {
    roi: string;
    timeline: string;
    savings: string;
    risk: string;
  };
}

const navigatorItems = [
  { id: "strategy", label: "AI Strategy", desc: "Enterprise Roadmaps", icon: BrainCircuit },
  { id: "agents", label: "AI Agents", desc: "Autonomous Systems", icon: Bot },
  { id: "platforms", label: "Enterprise Platforms", desc: "SAP & ERP Integration", icon: Box },
  { id: "cloud", label: "Cloud", desc: "Hybrid & Multi-Cloud", icon: Cloud },
  { id: "data", label: "Data Engineering", desc: "Vector DBs & Lakes", icon: Database },
];

const suggestedPrompts = [
  { id: "arch", text: "🚀 AI Roadmap" },
  { id: "erp", text: "🏗 Modernize ERP" },
  { id: "agents", text: "🤖 Build AI Agents" },
  { id: "proposal", text: "📄 Generate Proposal" },
  { id: "roi", text: "📈 ROI Estimator" }
];

export default function CerebroChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"architecture" | "workflow" | "security" | "deployment">("architecture");
  const [generationStage, setGenerationStage] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { 
        id: "1", 
        sender: "bot", 
        text: "System initialized. What enterprise challenge are you solving today?", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generationStage]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    // Command Mode parsing
    const isCommand = text.startsWith("/");
    
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    simulateGeneration(text);
  };

  const simulateGeneration = (query: string) => {
    const stages = [
      "Analyzing Enterprise Architecture...",
      "Searching Research Library...",
      "Consulting Specialized Agents...",
      "Generating Recommendation...",
      "Done."
    ];
    
    let currentStage = 0;
    const botMsgId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, { id: botMsgId, sender: "bot", text: "", timestamp: "", isGenerating: true }]);

    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setGenerationStage(stages[currentStage]);
        currentStage++;
      } else {
        clearInterval(interval);
        setGenerationStage(null);
        
        const lower = query.toLowerCase();
        let finalText = "Based on our enterprise frameworks, here is the recommended architectural approach. The Digital Twin has been updated.";
        let actions = [
          { label: "Download PDF", icon: Download, action: "pdf" },
          { label: "Book Workshop", icon: Briefcase, action: "book" }
        ];
        let impact = undefined;

        if (lower.includes("sap") || lower.includes("erp") || lower.includes("modernize")) {
          finalText = "Modernizing SAP via our Agentic Gateway allows us to decouple core ERP logic from intelligent workflows. We recommend a 3-phased approach starting with Procure-to-Pay automation.";
          impact = { roi: "12x", timeline: "14 Weeks", savings: "$2.4M", risk: "Low" };
          actions = [
            { label: "Export Architecture", icon: Download, action: "pdf" },
            { label: "Generate Proposal", icon: FileText, action: "proposal" },
            { label: "Share", icon: Share2, action: "share" }
          ];
        } else if (lower.includes("security") || lower.includes("zero trust")) {
          setActiveTab("security");
          finalText = "We enforce a Zero Trust architecture for all LLM interactions, ensuring data sovereignty and role-based access control at the gateway level.";
        }

        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, text: finalText, isGenerating: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), actions, businessImpact: impact } 
            : msg
        ));
      }
    }, 900);
  };

  // --------------------------------------------------------------------------------
  // Animated Components
  // --------------------------------------------------------------------------------
  
  const AICoreOrb = ({ isGenerating }: { isGenerating: boolean }) => (
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
      <motion.div 
        animate={isGenerating ? { scale: [1, 1.4, 1], rotate: 360, opacity: [0.5, 0.8, 0.5] } : { scale: [1, 1.1, 1], rotate: 0, opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: isGenerating ? 2 : 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-primary-accent rounded-full border-dashed"
      />
      <motion.div 
        animate={isGenerating ? { scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.7, 0.4] } : { scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: isGenerating ? 1 : 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-2 bg-primary-accent blur-md rounded-full"
      />
      <div className="relative z-10 p-1.5 rounded-full border border-white/20 bg-black text-primary-accent shadow-[0_0_15px_#00F57A]">
        <BrainCircuit size={16} />
      </div>
    </div>
  );

  // Digital Twin Nodes Data
  const architectureNodes = [
    { id: "ui", label: "User Interface", tech: "React / Next.js", latency: "24ms", x: "50%", y: "10%" },
    { id: "gateway", label: "Agentic Gateway", tech: "Kong / Cerebro", latency: "5ms", x: "50%", y: "30%" },
    { id: "llm", label: "LLM Router", tech: "Llama 3 / Claude", latency: "850ms", x: "30%", y: "55%" },
    { id: "kg", label: "Knowledge Graph", tech: "Neo4j", latency: "12ms", x: "70%", y: "55%" },
    { id: "agents", label: "Specialist Agents", tech: "LangGraph", latency: "45ms", x: "50%", y: "85%" },
  ];

  return (
    <>
      {/* Floating Trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#050B14] border border-primary-accent/30 shadow-[0_0_30px_rgba(0,245,122,0.2)] flex items-center justify-center group z-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
               <Network size={24} className="text-primary-accent" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* OS Command Center Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-2 md:inset-6 z-[100] flex flex-col rounded-xl border border-primary-accent/20 bg-[#03060A]/95 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden font-inter"
          >
            {/* Ambient Neural Mesh Background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20 mix-blend-screen">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="neural-mesh" width="100" height="100" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="#00F57A" opacity="0.3"/>
                    <circle cx="50" cy="50" r="1.5" fill="#00F57A" opacity="0.1"/>
                    <path d="M 2 2 L 50 50 M 50 50 L 100 2 M 50 50 L 50 100" stroke="#00F57A" strokeWidth="0.5" opacity="0.1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#neural-mesh)" />
              </svg>
              <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary-accent/5 blur-[150px] rounded-full" />
            </div>

            {/* Header */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 relative z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-space font-bold text-white tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-primary-accent shadow-[0_0_8px_#00F57A] animate-pulse" />
                  Cerebro AI
                </div>
                <div className="w-px h-4 bg-white/20" />
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold hidden md:block">
                  Enterprise Intelligence OS <span className="text-primary-accent ml-2">v3.2 [Live]</span>
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-6 text-[9px] uppercase tracking-widest text-gray-500 font-mono">
                  <span>Knowledge Base: <strong className="text-gray-300">12,420</strong></span>
                  <span>Research: <strong className="text-gray-300">356</strong></span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Main OS Body: 3 Panels */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 relative z-10">
              
              {/* Left Panel: Navigator */}
              <div className="hidden md:flex flex-col border-r border-white/10 col-span-2 bg-[#050B14]/40 overflow-y-auto pt-6 px-4">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 pl-2">Navigator</span>
                <div className="flex flex-col gap-2">
                  {navigatorItems.map(item => (
                    <button key={item.id} className="flex flex-col text-left p-3 rounded-lg border border-transparent hover:border-primary-accent/30 hover:bg-primary-accent/5 transition-all group relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon size={14} className="text-gray-400 group-hover:text-primary-accent transition-colors" />
                        <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 group-hover:text-gray-400 pl-5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Panel: AI Workspace */}
              <div className="col-span-1 md:col-span-6 flex flex-col relative bg-[#02050A]/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20">
                <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#03060A] to-transparent z-10 pointer-events-none" />
                
                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 pb-32">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-4 w-full", msg.sender === "user" ? "justify-end" : "justify-start")}>
                      {msg.sender === "bot" && <AICoreOrb isGenerating={msg.isGenerating || false} />}
                      
                      <div className={cn("flex flex-col gap-2 max-w-[85%]", msg.sender === "user" ? "items-end" : "items-start")}>
                        
                        {/* Sender Label */}
                        {msg.sender === "bot" && (
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 ml-1">
                            <span>Cerebro</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"/>
                            <span className="text-primary-accent">Enterprise Architect</span>
                          </div>
                        )}

                        {/* Message Card */}
                        <div className={cn(
                          "p-5 rounded-2xl text-[13px] leading-relaxed relative overflow-hidden border",
                          msg.sender === "user" 
                            ? "bg-white/10 text-white rounded-tr-sm border-white/10" 
                            : "bg-[#0A121E] text-gray-300 rounded-tl-sm border-white/5 shadow-lg"
                        )}>
                          {msg.isGenerating && generationStage ? (
                            <div className="flex flex-col gap-5 min-w-[280px]">
                              <span className="text-primary-accent font-mono animate-pulse flex items-center gap-2">
                                <Activity size={14}/> {generationStage}
                              </span>
                              
                              {/* Multi-Agent OS Thinking */}
                              <div className="flex flex-col gap-3">
                                {["Research Agent", "Architecture Agent", "Security Agent"].map((agent, i) => (
                                  <div key={agent} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                                      <span>{agent}</span>
                                      <span>Processing</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5 + (i * 0.5), ease: "easeOut" }}
                                        className="h-full bg-primary-accent"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                          )}
                        </div>

                        {/* Executive Business Impact Card */}
                        {!msg.isGenerating && msg.businessImpact && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 w-full p-4 rounded-xl border border-primary-accent/20 bg-primary-accent/5 flex flex-col gap-4">
                             <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold flex items-center gap-2">
                               <LineChart size={12}/> Business Impact
                             </span>
                             <div className="grid grid-cols-4 gap-4">
                               {Object.entries(msg.businessImpact).map(([k, v]) => (
                                 <div key={k} className="flex flex-col gap-1 border-l border-white/10 pl-3">
                                   <span className="text-[9px] uppercase tracking-widest text-gray-500">{k}</span>
                                   <span className="text-sm font-mono font-bold text-white">{v}</span>
                                 </div>
                               ))}
                             </div>
                          </motion.div>
                        )}
                        
                        {/* Action Chips */}
                        {!msg.isGenerating && msg.actions && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.actions.map(action => (
                              <button key={action.label} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-gray-300 text-[11px] font-bold hover:bg-primary-accent hover:border-primary-accent hover:text-black transition-colors shadow-sm">
                                <action.icon size={12} />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Suggestion Chips */}
                  {messages.length === 1 && (
                    <div className="mt-4 flex flex-wrap gap-2 pl-14">
                      {suggestedPrompts.map(prompt => (
                        <button 
                          key={prompt.id} 
                          onClick={() => handleSend(prompt.text)}
                          className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:border-primary-accent/50 hover:bg-white/10 transition-all text-xs text-gray-300"
                        >
                          {prompt.text}
                        </button>
                      ))}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* IDE-Style Input Area */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-col bg-[#0A121E] border border-white/10 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] focus-within:border-primary-accent/50 transition-colors">
                    <div className="flex items-center px-4 py-3 border-b border-white/5">
                       <span className="text-[10px] text-gray-500 font-mono">⌘ Command Mode ready (type /)</span>
                    </div>
                    <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); }
                      }}
                      placeholder="Ask Cerebro..."
                      className="w-full bg-transparent px-4 py-4 text-sm text-white focus:outline-none resize-none min-h-[60px]"
                    />
                    <div className="flex items-center justify-between px-4 py-2 bg-black/20">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10"><Briefcase size={14}/></button>
                        <button className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10"><Network size={14}/></button>
                        <button className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10"><FileText size={14}/></button>
                      </div>
                      <button 
                        onClick={() => handleSend(input)}
                        disabled={!input.trim()}
                        className="px-3 py-1.5 bg-primary-accent text-black text-xs font-bold rounded flex items-center gap-2 hover:bg-white transition-colors disabled:opacity-50"
                      >
                        Send <Send size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Intelligence Hub (Digital Twin) */}
              <div className="hidden md:flex flex-col border-l border-white/10 col-span-4 bg-[#010204] overflow-hidden">
                
                {/* Tabs */}
                <div className="flex items-center gap-6 px-6 pt-6 border-b border-white/5">
                   {[
                     { id: "architecture", label: "Architecture" },
                     { id: "workflow", label: "Workflow" },
                     { id: "deployment", label: "Deployment" },
                     { id: "security", label: "Security" }
                   ].map(tab => (
                     <button 
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id as any)}
                       className={cn(
                         "pb-3 text-[10px] uppercase tracking-widest font-bold transition-colors relative", 
                         activeTab === tab.id ? "text-primary-accent" : "text-gray-500 hover:text-gray-300"
                       )}
                     >
                       {tab.label}
                       {activeTab === tab.id && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-accent" />}
                     </button>
                   ))}
                </div>

                {/* Digital Twin Visualization */}
                <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
                  
                  {activeTab === "architecture" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                      
                      {/* Connection Lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path d="M 50% 15% L 50% 25%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <path d="M 50% 35% L 50% 45%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <path d="M 50% 45% L 30% 50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <path d="M 50% 45% L 70% 50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <path d="M 30% 60% L 50% 80%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <path d="M 70% 60% L 50% 80%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                      </svg>

                      {/* Animated Packets */}
                      <motion.div 
                        initial={{ top: "15%", opacity: 0 }} animate={{ top: "25%", opacity: [0, 1, 1, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="absolute left-[50%] w-1.5 h-4 bg-primary-accent rounded-full -translate-x-1/2 z-0 shadow-[0_0_10px_#00F57A]"
                      />

                      {/* Nodes */}
                      {architectureNodes.map(node => (
                        <div 
                          key={node.id} 
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                          className={cn(
                            "absolute flex flex-col items-center justify-center p-3 rounded-lg border bg-[#050B14] cursor-help transition-all transform -translate-x-1/2 -translate-y-1/2 z-10 w-28 shadow-xl",
                            hoveredNode === node.id ? "border-primary-accent scale-110" : "border-white/10 hover:border-white/30"
                          )}
                          style={{ left: node.x, top: node.y }}
                        >
                          <span className="text-[9px] font-bold text-gray-300 text-center leading-tight">{node.label}</span>
                          
                          <AnimatePresence>
                            {hoveredNode === node.id && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="w-full flex flex-col gap-1 mt-2 pt-2 border-t border-white/10 overflow-hidden">
                                <span className="text-[8px] text-gray-500 block truncate">{node.tech}</span>
                                <span className="text-[9px] font-mono text-primary-accent">{node.latency}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

                    </motion.div>
                  )}

                  {activeTab === "security" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-10 text-center">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-red-500/30 flex items-center justify-center text-red-500 relative">
                        <Lock size={32} />
                        <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block mb-2">Zero Trust Boundary</span>
                        <p className="text-xs text-gray-500">All agentic actions require role-based verification. Data is air-gapped before entering the LLM router.</p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "deployment" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs text-gray-500">Azure Multi-Region Topology Active</p>
                    </motion.div>
                  )}

                </div>

                {/* Dynamic Knowledge Sidebar (Bottom) */}
                <div className="h-48 border-t border-white/5 bg-[#03060A] p-6 flex flex-col gap-3">
                   <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Referenced Knowledge</span>
                   <div className="flex flex-col gap-2 overflow-y-auto">
                     {["SAP Integration Guide", "Knowledge Graph Architecture", "Agentic Patterns", "Azure Deployment Specs"].map(doc => (
                       <div key={doc} className="text-xs text-gray-400 p-2 rounded bg-white/5 border border-white/5 flex justify-between items-center hover:text-white cursor-pointer group">
                         {doc} <Download size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                     ))}
                   </div>
                </div>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

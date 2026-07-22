"use client";

import React, { useState } from "react";
import { 
  Plus, Play, Save, Code2, Database, MessageSquare,
  Type, Settings2, Trash2, GripVertical, CheckCircle2, ChevronRight,
  BrainCircuit, GitBranch, ArrowRight
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../components/ui/utils";

// Types simulating our backend schema
type WidgetType = "markdown" | "code" | "sql" | "prompt";

interface WidgetBlock {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, any>;
}

export default function AssessmentBuilder() {
  const [blocks, setBlocks] = useState<WidgetBlock[]>([
    { id: "w1", type: "markdown", title: "Problem Introduction", config: { content: "Build a distributed cache..." } },
    { id: "w2", type: "code", title: "Java Implementation", config: { language: "java", timeLimit: 45 } },
  ]);
  
  const [activeBlockId, setActiveBlockId] = useState<string>("w2");
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  const activeBlock = blocks.find(b => b.id === activeBlockId);

  const addBlock = (type: WidgetType, title: string) => {
    const newBlock: WidgetBlock = {
      id: `w${Date.now()}`,
      type,
      title,
      config: type === 'code' ? { language: 'typescript' } : {}
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
    setShowAddMenu(false);
  };

  const removeBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBlocks(blocks.filter(b => b.id !== id));
    if (activeBlockId === id) setActiveBlockId("");
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-4 md:-m-6 bg-background border-t border-border overflow-hidden">
      
      {/* LEFT: Notion-Style Builder Canvas */}
      <div className="w-1/3 min-w-[320px] max-w-[450px] bg-background border-r border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface">
          <div>
            <h1 className="text-sm font-bold text-text-primary">Backend Engineer Assessment</h1>
            <p className="text-xs text-text-muted mt-0.5">Version 3 • Draft</p>
          </div>
          <Button size="sm" className="h-8 gap-2 px-3 text-xs">
            <Save size={14} /> Save
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-1">
            <input 
              type="text" 
              defaultValue="Distributed Caching System" 
              className="w-full bg-transparent text-2xl font-space font-bold text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <p className="text-sm text-text-secondary">Candidates will build, optimize, and debug an LRU cache.</p>
          </div>

          <div className="space-y-3 relative">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              Assessment Workflow
            </h3>
            
            {blocks.map((block, index) => (
              <div 
                key={block.id}
                onClick={() => setActiveBlockId(block.id)}
                className={cn(
                  "group relative p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3",
                  activeBlockId === block.id 
                    ? "bg-primary-accent/10 border-primary-accent" 
                    : "bg-surface border-border hover:border-text-muted"
                )}
              >
                <div className="mt-0.5 text-text-muted cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {block.type === 'markdown' && <Type size={14} className="text-purple-400" />}
                    {block.type === 'code' && <Code2 size={14} className="text-blue-400" />}
                    {block.type === 'sql' && <Database size={14} className="text-orange-400" />}
                    {block.type === 'prompt' && <MessageSquare size={14} className="text-primary-accent" />}
                    
                    <span className="text-xs font-bold uppercase text-text-muted">{block.type} WIDGET</span>
                  </div>
                  <h4 className={cn("text-sm font-bold truncate", activeBlockId === block.id ? "text-primary-accent" : "text-text-primary")}>
                    {block.title}
                  </h4>
                </div>
                
                <button 
                  onClick={(e) => removeBlock(block.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Add Block Menu */}
            <div className="pt-2">
              {!showAddMenu ? (
                <button 
                  onClick={() => setShowAddMenu(true)}
                  className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-border text-text-muted hover:text-text-primary hover:border-text-muted hover:bg-surface transition-all text-sm font-bold justify-center"
                >
                  <Plus size={16} /> Add Activity Widget
                </button>
              ) : (
                <Card className="p-2 space-y-1 bg-surface-elevated animate-in fade-in slide-in-from-top-2">
                  <div className="text-xs font-bold text-text-muted px-2 py-1 uppercase tracking-wider">Widget Library</div>
                  <button onClick={() => addBlock("markdown", "Instructions")} className="w-full flex items-center gap-3 p-2 rounded hover:bg-surface text-left text-sm text-text-primary transition-colors">
                    <Type size={16} className="text-purple-400" /> Markdown / Text
                  </button>
                  <button onClick={() => addBlock("code", "Code Implementation")} className="w-full flex items-center gap-3 p-2 rounded hover:bg-surface text-left text-sm text-text-primary transition-colors">
                    <Code2 size={16} className="text-blue-400" /> Code Editor
                  </button>
                  <button onClick={() => addBlock("sql", "Database Query")} className="w-full flex items-center gap-3 p-2 rounded hover:bg-surface text-left text-sm text-text-primary transition-colors">
                    <Database size={16} className="text-orange-400" /> SQL Sandbox
                  </button>
                  <button onClick={() => addBlock("prompt", "AI Prompting")} className="w-full flex items-center gap-3 p-2 rounded hover:bg-surface text-left text-sm text-text-primary transition-colors">
                    <MessageSquare size={16} className="text-primary-accent" /> AI Prompt Engineer
                  </button>
                </Card>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* MIDDLE: Live Preview Pane */}
      <div className="flex-1 bg-[#0a0a0a] flex flex-col relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-surface border border-border rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold text-text-muted shadow-sm">
          <Play size={12} className="text-primary-accent" /> Candidate Preview Runtime
        </div>
        
        {/* Mock Candidate UI Rendered from Schema */}
        <div className="flex-1 flex flex-col pt-14 p-6 overflow-hidden">
           {activeBlock?.type === 'markdown' && (
             <div className="max-w-2xl mx-auto w-full prose prose-invert">
               <h1>{activeBlock.title}</h1>
               <p>{activeBlock.config.content || "Write your instructions here..."}</p>
             </div>
           )}
           
           {activeBlock?.type === 'code' && (
             <div className="flex-1 border border-border rounded-lg bg-surface flex flex-col overflow-hidden shadow-2xl">
                <div className="h-10 bg-surface-elevated border-b border-border flex items-center px-4">
                  <span className="text-sm font-mono text-text-muted">Solution.{activeBlock.config.language === 'java' ? 'java' : 'ts'}</span>
                </div>
                <div className="flex-1 p-4 font-mono text-sm text-text-secondary">
                  <span className="text-purple-400">class</span> <span className="text-blue-400">Solution</span> {'{'}
                  <br/>&nbsp;&nbsp;<span className="text-text-muted">// Candidate writes code here based on your config</span>
                  <br/>{'}'}
                </div>
             </div>
           )}
           
           {!activeBlock && (
             <div className="flex-1 flex items-center justify-center text-text-muted flex-col gap-4">
                <BrainCircuit size={48} className="opacity-20" />
                <p>Select a widget to preview the candidate experience</p>
             </div>
           )}
        </div>
      </div>

      {/* RIGHT: Configuration Panel */}
      <div className="w-80 bg-surface border-l border-border flex flex-col shrink-0">
        <div className="h-14 border-b border-border flex items-center px-4 gap-2 shrink-0">
          <Settings2 size={18} className="text-text-muted" />
          <span className="font-bold text-sm text-text-primary">Widget Config</span>
        </div>
        
        {activeBlock ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Widget Title</label>
                <input 
                  type="text" 
                  value={activeBlock.title}
                  readOnly
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-accent"
                />
              </div>

              {activeBlock.type === 'code' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Language</label>
                    <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-accent">
                      <option>Java 21</option>
                      <option>Python 3.11</option>
                      <option>TypeScript 5.0</option>
                      <option>Go 1.21</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Starter Code Resource</label>
                    <Button variant="secondary" size="sm" className="w-full justify-start text-xs text-text-secondary bg-background">
                      <GitBranch size={14} className="mr-2" /> Select from Repository...
                    </Button>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5 flex justify-between">
                      Test Cases <Badge variant="secondary" className="px-1 text-[10px]">3 Active</Badge>
                    </label>
                    <div className="space-y-2">
                      <div className="bg-background border border-border rounded p-2 text-xs text-text-secondary flex justify-between items-center">
                        Test 1: Empty Cache <CheckCircle2 size={12} className="text-green-400"/>
                      </div>
                      <div className="bg-background border border-border rounded p-2 text-xs text-text-secondary flex justify-between items-center">
                        Test 2: Eviction <CheckCircle2 size={12} className="text-green-400"/>
                      </div>
                      <Button variant="secondary" size="sm" className="w-full h-7 text-xs border-dashed bg-transparent">
                        + Add Test Case
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {/* Common Configuration: AI Evaluation Rubric */}
              <div className="pt-4 border-t border-border">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-3 flex items-center gap-2">
                  <BrainCircuit size={14} className="text-purple-400" /> AI Reviewer Rubric
                </label>
                <div className="space-y-2">
                  <div className="bg-background border border-border rounded p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-text-primary">Code Quality</span>
                      <span className="text-xs font-bold text-purple-400">40%</span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-tight">Evaluates modularity, naming conventions, and DRY principles.</p>
                  </div>
                  <div className="bg-background border border-border rounded p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-text-primary">Performance (Big O)</span>
                      <span className="text-xs font-bold text-purple-400">60%</span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-tight">Must achieve O(1) time complexity for get and put operations.</p>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full text-xs gap-1 mt-2">
                    <Settings2 size={14} /> Configure Rubric
                  </Button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-text-muted">Select an activity widget to configure its properties, test cases, and AI rubric.</p>
          </div>
        )}
      </div>

    </div>
  );
}

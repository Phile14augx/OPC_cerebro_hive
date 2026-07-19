"use client";

import React, { useState } from "react";
import {
  Files, Search, GitBranch, Play, Terminal, Database, BrainCircuit,
  MessageSquare, Settings, CheckCircle2, AlertTriangle, FileCode2, Code2, PlayCircle, Loader2, ArrowUpRight
} from "lucide-react";
import { CodeEditor } from "../../../components/ui/CodeEditor";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { cn } from "../../../components/ui/utils";

export default function AssessmentWorkspace() {
  const [activeTab, setActiveTab] = useState<"code" | "sql" | "prompt" | "arch">("code");
  const [activeActivity, setActiveActivity] = useState<"explorer" | "search" | "source" | "ai">("explorer");
  const [code, setCode] = useState(`package com.cerebrohive.talent;

import java.util.*;

public class DistributedCache {
    /**
     * Problem: Implement an LRU Cache with TTL (Time To Live).
     * 
     * Requirements:
     * 1. get(key): returns value if exists and not expired, else -1
     * 2. put(key, value, ttlMillis): inserts or updates key
     * 3. Must be O(1) for both operations
     * 4. Must clean up expired keys automatically without blocking
     */
     
    public DistributedCache(int capacity) {
        // TODO: Initialize your data structures
    }
    
    public int get(int key) {
        // TODO: Implement get
        return -1;
    }
    
    public void put(int key, int value, long ttlMillis) {
        // TODO: Implement put
    }
}`);
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("> System Ready. Awaiting execution...\n");

  const handleRun = () => {
    setIsExecuting(true);
    setConsoleOutput("> Compiling Java 21...\n> Running tests...\n");
    setTimeout(() => {
      setConsoleOutput(prev => prev + "> Test 1: get() on empty cache... [PASS]\n> Test 2: put() and get()... [PASS]\n> Test 3: Capacity eviction (LRU)... [FAIL] Expected -1, got 42\n\n> Exit code 1. 2/3 tests passed.");
      setIsExecuting(false);
    }, 2000);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-4 md:-m-6 bg-[#0f0f0f] text-text-secondary border-t border-border overflow-hidden">
      
      {/* Activity Bar (Leftmost) */}
      <div className="w-12 bg-background border-r border-border flex flex-col items-center py-4 space-y-6 shrink-0">
        <button onClick={() => setActiveActivity("explorer")} className={cn("text-text-muted hover:text-text-primary transition-colors", activeActivity === "explorer" && "text-primary-accent")}>
          <Files size={24} strokeWidth={1.5} />
        </button>
        <button onClick={() => setActiveActivity("search")} className={cn("text-text-muted hover:text-text-primary transition-colors", activeActivity === "search" && "text-primary-accent")}>
          <Search size={24} strokeWidth={1.5} />
        </button>
        <button onClick={() => setActiveActivity("source")} className={cn("text-text-muted hover:text-text-primary transition-colors", activeActivity === "source" && "text-primary-accent")}>
          <GitBranch size={24} strokeWidth={1.5} />
        </button>
        <div className="flex-1" />
        <button onClick={() => setActiveActivity("ai")} className={cn("text-text-muted hover:text-text-primary transition-colors", activeActivity === "ai" && "text-primary-accent")}>
          <BrainCircuit size={24} strokeWidth={1.5} />
        </button>
        <button className="text-text-muted hover:text-text-primary transition-colors">
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* Primary Sidebar (Explorer) */}
      <div className="w-64 bg-surface border-r border-border shrink-0 flex flex-col overflow-hidden">
        <div className="h-10 flex items-center px-4 font-bold text-xs tracking-widest uppercase text-text-muted border-b border-border shrink-0">
          Explorer
        </div>
        
        {/* Workspace Files */}
        <div className="p-2 space-y-0.5 overflow-y-auto">
          <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-surface-elevated rounded cursor-pointer text-sm font-bold text-text-primary">
            <ChevronDown size={14} className="text-text-muted" /> TALENT-OS-WORKSPACE
          </div>
          
          <div className="ml-4 space-y-0.5">
            <button 
              onClick={() => setActiveTab("code")}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1 text-sm rounded transition-colors",
                activeTab === "code" ? "bg-primary-accent/10 text-primary-accent" : "hover:bg-surface-elevated"
              )}
            >
              <FileCode2 size={14} className={activeTab === "code" ? "text-primary-accent" : "text-blue-400"} /> DistributedCache.java
            </button>
            <button 
              onClick={() => setActiveTab("sql")}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1 text-sm rounded transition-colors",
                activeTab === "sql" ? "bg-primary-accent/10 text-primary-accent" : "hover:bg-surface-elevated"
              )}
            >
              <Database size={14} className={activeTab === "sql" ? "text-primary-accent" : "text-orange-400"} /> query_optimization.sql
            </button>
            <button 
              onClick={() => setActiveTab("prompt")}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1 text-sm rounded transition-colors",
                activeTab === "prompt" ? "bg-primary-accent/10 text-primary-accent" : "hover:bg-surface-elevated"
              )}
            >
              <MessageSquare size={14} className={activeTab === "prompt" ? "text-primary-accent" : "text-purple-400"} /> AI_Agent_Prompt.md
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Editor Tabs */}
        <div className="flex items-center h-10 border-b border-border overflow-x-auto custom-scrollbar shrink-0">
          <div className={cn("flex items-center gap-2 px-4 h-full border-r border-border border-t-2 cursor-pointer", activeTab === "code" ? "border-t-primary-accent bg-background text-text-primary" : "border-t-transparent bg-surface hover:bg-surface-elevated text-text-muted")} onClick={() => setActiveTab("code")}>
            <FileCode2 size={14} className="text-blue-400" /> DistributedCache.java
          </div>
          <div className={cn("flex items-center gap-2 px-4 h-full border-r border-border border-t-2 cursor-pointer", activeTab === "sql" ? "border-t-primary-accent bg-background text-text-primary" : "border-t-transparent bg-surface hover:bg-surface-elevated text-text-muted")} onClick={() => setActiveTab("sql")}>
            <Database size={14} className="text-orange-400" /> query.sql
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden p-2">
          {activeTab === "code" && (
            <CodeEditor 
              language="java" 
              value={code} 
              onChange={(val) => setCode(val || "")} 
            />
          )}
          {activeTab !== "code" && (
            <div className="flex items-center justify-center h-full text-text-muted border border-border rounded-lg bg-background">
              Module {activeTab} loaded. Select file in explorer.
            </div>
          )}
        </div>

        {/* Terminal / Output Panel */}
        <div className="h-64 border-t border-border bg-background flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 h-10 border-b border-border bg-surface shrink-0">
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-text-muted">
              <button className="text-primary-accent border-b-2 border-primary-accent h-10">Output</button>
              <button className="hover:text-text-primary transition-colors h-10">Terminal</button>
              <button className="hover:text-text-primary transition-colors h-10">Test Cases (3)</button>
            </div>
            <Button size="sm" onClick={handleRun} disabled={isExecuting} className="h-7 text-xs gap-2 px-3">
              {isExecuting ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />} 
              {isExecuting ? "Executing Sandbox..." : "Run Code"}
            </Button>
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
            {consoleOutput}
          </div>
        </div>
      </div>

      {/* AI Interviewer Panel (Rightmost) */}
      <div className="w-80 bg-surface border-l border-border shrink-0 flex flex-col">
        <div className="h-10 flex items-center px-4 border-b border-border gap-2 shrink-0">
          <BrainCircuit size={16} className="text-purple-400" />
          <span className="font-bold text-xs uppercase tracking-widest text-text-primary">AI Assessor</span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <BrainCircuit size={14} />
            </div>
            <div className="bg-surface-elevated p-3 rounded-lg rounded-tl-none border border-border text-sm text-text-secondary">
              Hi candidate! I noticed you are using a standard <code>HashMap</code> for the cache. 
              <br/><br/>
              How does this affect time complexity if multiple threads access the cache simultaneously in a highly concurrent environment?
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-border bg-background">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Reply to AI Assessor..." 
              className="w-full bg-surface-elevated border border-border rounded-lg pl-3 pr-10 py-2.5 text-sm text-text-primary focus:outline-none focus:border-purple-400 transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center transition-colors">
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

// Simple internal icon since we didn't import ChevronDown above
function ChevronDown(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}

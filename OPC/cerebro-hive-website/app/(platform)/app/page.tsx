"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Sparkles, Bot, Workflow, BookOpen, 
  DatabaseZap, ShoppingCart, ArrowRight, Play, MoreVertical, Plus, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Card } from "./components/ui/Card";
import { Badge } from "./components/ui/Badge";
import { Button } from "./components/ui/Button";
import { StatCard } from "./components/ui/StatCard";
import { RightPanel } from "./components/RightPanel";

export default function DashboardHome() {
  const [commandInput, setCommandInput] = useState("");

  const suggestedCommands = [
    "Deploy Sales Copilot",
    "Create HR Knowledge Base",
    "Connect Salesforce Data",
    "Run Weekly Analytics",
  ];

  const quickActions = [
    { title: "Create Agent", icon: Bot, href: "/app/ai/agents/new" },
    { title: "Deploy Workflow", icon: Workflow, href: "/app/automation/builder" },
    { title: "Knowledge Base", icon: BookOpen, href: "/app/ai/knowledge/new" },
    { title: "Marketplace", icon: ShoppingCart, href: "/app/marketplace" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      
      {/* Main Mission Control Area (9 Columns) */}
      <div className="xl:col-span-9 space-y-12">
        
        {/* Header & AI Command Center */}
        <section className="pt-4 pb-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8"
          >
            <h1 className="text-3xl font-space font-bold text-text-primary mb-2">
              Good Morning, Philemon
            </h1>
            <p className="text-text-secondary text-lg">
              Welcome back to HivePulse. What do you want Hive to do?
            </p>
          </motion.div>

          {/* Massive AI Input Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", bounce: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-accent/40 via-purple-500/40 to-blue-500/40 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative bg-surface border-2 border-border group-hover:border-primary-accent/40 rounded-2xl overflow-hidden transition-colors shadow-elevated">
              <div className="flex items-center px-4 py-3">
                <Sparkles className="text-primary-accent shrink-0 ml-2" size={24} />
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="e.g. Deploy an HR Agent with the employee handbook..."
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-text-primary placeholder:text-text-muted text-lg lg:text-xl px-4 py-4 font-medium"
                />
                <Button className="shrink-0 h-12 px-6 rounded-xl font-bold text-base gap-2">
                  Execute <Play size={16} fill="currentColor" />
                </Button>
              </div>
              
              {/* Contextual Suggestions & Quick Actions */}
              <div className="border-t border-border bg-surface-elevated/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider mr-2">Suggestions</span>
                  {suggestedCommands.map((cmd, i) => (
                    <button 
                      key={i}
                      onClick={() => setCommandInput(cmd)}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:text-primary-accent hover:border-primary-accent/30 transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 sm:border-l sm:border-border sm:pl-4">
                  {quickActions.map((action, i) => (
                    <Link 
                      key={i} 
                      href={action.href}
                      title={action.title}
                      className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    >
                      <action.icon size={16} />
                    </Link>
                  ))}
                </div>

              </div>
            </div>
          </motion.div>

          {/* AI Context Prompt */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <p className="text-sm text-text-primary flex-1">
              <span className="font-bold text-blue-400">Context aware:</span> You uploaded 12 PDFs yesterday to 'HR Docs'. Would you like to create a Knowledge Base from them?
            </p>
            <Button size="sm" variant="secondary" className="border-blue-500/30 hover:bg-blue-500/20 text-blue-400 shrink-0">
              Create Knowledge Base
            </Button>
          </motion.div>
        </section>

        {/* Dash Grid: Health & Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Running Agents" 
            value="42" 
            change="▲ +8% vs last week" 
            icon={Bot} 
            trend="up"
            className="border-t-2 border-t-purple-500" 
          />
          <StatCard 
            label="Knowledge Sources" 
            value="184" 
            change="▲ +22 this month" 
            icon={BookOpen} 
            trend="up" 
            className="border-t-2 border-t-blue-500"
          />
          <StatCard 
            label="Active Workflows" 
            value="12" 
            change="Stable" 
            icon={Workflow} 
            trend="neutral" 
            className="border-t-2 border-t-yellow-500"
          />
          <StatCard 
            label="Platform Security" 
            value="Healthy" 
            change="0 critical alerts" 
            icon={DatabaseZap} 
            trend="neutral" 
            className="border-t-2 border-t-green-500"
          />
        </section>

        {/* Dash Grid: Main Content */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Resources */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Active Resources</h2>
              <Link href="/app/ai/agents" className="text-xs font-bold text-primary-accent hover:underline">View All</Link>
            </div>
            <Card className="overflow-hidden p-0">
              {[
                { name: "Sales Agent", status: "Running", icon: Bot, domain: "purple" },
                { name: "HR Policies DB", status: "Synced", icon: BookOpen, domain: "blue" },
                { name: "Invoice Processor", status: "Running", icon: Workflow, domain: "orange" },
              ].map((res, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-surface-elevated transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-${res.domain}-500/10 border border-${res.domain}-500/20 flex items-center justify-center shrink-0`}>
                      <res.icon size={18} className={`text-${res.domain}-500`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-sm group-hover:text-primary-accent transition-colors">{res.name}</h4>
                      <Badge variant="success" className="mt-1 px-1.5 py-0 h-4 text-[10px]">{res.status}</Badge>
                    </div>
                  </div>
                  <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              ))}
            </Card>
          </div>

          {/* Marketplace Recommended */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Marketplace</h2>
              <Link href="/app/marketplace" className="text-xs font-bold text-primary-accent hover:underline">Browse Directory</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "Sales Copilot", publisher: "CerebroHive", ver: "v2.3", installs: "5.4k" },
                { name: "Jira Sync", publisher: "Atlassian", ver: "v1.0", installs: "12k" },
              ].map((plugin, i) => (
                <Card key={i} className="flex flex-col gap-3 p-4 hover:border-primary-accent/40 transition-colors group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
                      <Sparkles size={18} className="text-primary-accent" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-1.5 font-mono">{plugin.ver}</Badge>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-text-primary group-hover:text-primary-accent transition-colors">{plugin.name}</h4>
                      <CheckCircle2 size={12} className="text-blue-400" />
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">by {plugin.publisher}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-3 border-t border-border">
                    <span className="text-[10px] text-text-muted">{plugin.installs} orgs</span>
                    <Button variant="secondary" size="sm" className="h-6 text-xs px-2">Install</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </section>

      </div>

      {/* Right Panel Area (3 Columns) */}
      <div className="hidden xl:block xl:col-span-3 border-l border-border pl-8 py-4">
        <RightPanel />
      </div>

    </div>
  );
}

"use client";

import React from "react";
import { 
  User, CheckCircle2, AlertTriangle, ArrowUpRight, 
  BrainCircuit, Database, Code2, Network, ChevronLeft, Calendar
} from "lucide-react";
import Link from "next/link";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { StatCard } from "../../../components/ui/StatCard";

export default function CandidateReport({ params }: { params: { id: string } }) {
  // Mock data based on the ID (in a real app, this would be fetched)
  const candidateName = params.id.split('-').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

  return (
    <div className="space-y-8">
      {/* Back & Header */}
      <div className="space-y-6">
        <Link href="/app/talent" className="text-sm font-bold text-text-muted hover:text-text-primary flex items-center gap-2 transition-colors">
          <ChevronLeft size={16} /> Back to Pipeline
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-2xl font-space font-bold text-text-primary">{candidateName.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-space font-bold text-text-primary">{candidateName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5"><User size={14} /> Senior Backend Engineer</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> Assessed Oct 24, 2026</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10">Reject</Button>
            <Button className="gap-2 bg-green-500 hover:bg-green-600 text-background">
              Move to Offer <ArrowUpRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Score & Radar Concept */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar / Skill Graph Area */}
        <Card className="lg:col-span-1 p-6 flex flex-col items-center justify-center min-h-[300px] border-primary-accent/20 bg-gradient-to-b from-surface to-surface/50">
          <div className="text-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Overall AI Score</h2>
            <div className="text-5xl font-space font-bold text-green-400 mt-2">92<span className="text-2xl text-text-muted">/100</span></div>
          </div>
          
          {/* Conceptual Radar Chart visualization using simple bars for the prototype */}
          <div className="w-full space-y-4">
            {[
              { label: "Coding (Java)", score: 95, color: "bg-blue-400" },
              { label: "Architecture", score: 88, color: "bg-purple-400" },
              { label: "SQL/DB", score: 96, color: "bg-orange-400" },
              { label: "AI Prompting", score: 91, color: "bg-primary-accent" },
              { label: "Communication", score: 84, color: "bg-yellow-400" },
            ].map((skill, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-text-primary">
                  <span>{skill.label}</span>
                  <span>{skill.score}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Summary & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 h-full flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2 mb-3">
                <BrainCircuit size={16} className="text-purple-400" /> AI Assessor Summary
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {candidateName} demonstrated exceptional backend engineering capability, specifically in Java memory management and complex SQL query optimization. Their system design for the distributed caching challenge was highly scalable, though they missed some edge cases regarding cache invalidation during network partitions. 
                <br /><br />
                During the AI Interview, their communication was clear and they successfully defended their choice of using Redis over Memcached for this specific workload. Highly recommended for a Senior Backend role.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" /> Key Strengths
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span> Wrote O(n log n) solution on first attempt.
                  </li>
                  <li className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span> Excellent understanding of PostgreSQL indexes.
                  </li>
                  <li className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span> Strong prompt engineering for the AI summary task.
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-400" /> Areas for Review
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span> Missed edge cases in distributed cache invalidation.
                  </li>
                  <li className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span> Code modularity could be slightly improved.
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Detailed Activity Breakdown */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Assessment Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { title: "Core Backend (Java)", score: 95, time: "42m 15s", icon: Code2, color: "text-blue-400" },
            { title: "Database Optimization", score: 96, time: "18m 30s", icon: Database, color: "text-orange-400" },
            { title: "System Architecture", score: 88, time: "25m 00s", icon: Network, color: "text-purple-400" },
            { title: "AI Prompt Engineering", score: 91, time: "12m 45s", icon: BrainCircuit, color: "text-primary-accent" },
          ].map((mod, i) => (
            <Card key={i} className="p-4 hover:border-primary-accent/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center ${mod.color}`}>
                  <mod.icon size={18} />
                </div>
                <div className="text-xl font-space font-bold text-text-primary">{mod.score}</div>
              </div>
              <h4 className="text-sm font-bold text-text-primary">{mod.title}</h4>
              <p className="text-xs text-text-muted mt-1">Time taken: {mod.time}</p>
              <Button variant="secondary" size="sm" className="w-full mt-4 text-xs">Review Submission</Button>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}

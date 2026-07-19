import React from "react";
import type { Metadata } from "next";
import { Milestone, CheckCircle2, CircleDashed, Rocket } from "lucide-react";
import { JsonLd } from "@/components/discovery";
import { buildTechArticleSchema } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Developer Roadmap | CerebroHive",
  description: "CerebroHive public developer roadmap — upcoming API features, SDK improvements, MCP integrations, and platform milestones. Track what's coming next.",
  keywords: ["CerebroHive roadmap", "AI platform roadmap", "upcoming API features", "developer preview", "platform milestones"],
  alternates: { canonical: "https://cerebropchive.org/developers/roadmap" },
};

const schema = buildTechArticleSchema({
  title: "CerebroHive Developer Roadmap",
  description: "Public developer roadmap for the CerebroHive platform — upcoming API features, SDK improvements, MCP integrations, and platform milestones.",
  slug: "developers/roadmap",
  urlPath: "/developers/roadmap",
  datePublished: "2026-01-01",
  section: "Roadmap",
  keywords: ["CerebroHive roadmap", "AI platform roadmap", "upcoming features"],
});

export default function RoadmapPage() {
  const roadmapData = [
    {
      category: "Released",
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      items: [
        { title: "WebSocket Telemetry", desc: "Real-time logging for AgentOS." },
        { title: "HNSW Vector Search", desc: "Native high-performance vector retrieval." },
        { title: "RBAC Engine", desc: "Enterprise-grade role-based access control." }
      ]
    },
    {
      category: "Beta",
      icon: Rocket,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      items: [
        { title: "Multi-Agent Swarms", desc: "Enable multiple agents to collaborate on a single task." },
        { title: "Python SDK v2", desc: "Fully asynchronous python client." }
      ]
    },
    {
      category: "In Progress",
      icon: CircleDashed,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      items: [
        { title: "GraphRAG Integration", desc: "Combining Knowledge Graphs with Vector Search." },
        { title: "Edge Deployment", desc: "Deploy lightweight agent nodes directly to edge servers." },
        { title: "SOC2 Compliance", desc: "Finalizing external security audits." }
      ]
    },
    {
      category: "Planned",
      icon: Milestone,
      color: "text-text-muted",
      bg: "bg-surface-elevated",
      border: "border-border",
      items: [
        { title: "Visual Workflow Builder", desc: "Drag-and-drop UI for designing agent logic." },
        { title: "Agent Marketplace", desc: "Public repository of community-built AI agents." },
        { title: "On-Premises ERP Sync", desc: "Direct connectors for legacy on-prem SAP instances." }
      ]
    }
  ];

  return (
    <>
      <JsonLd schema={schema} />
      <div className="flex flex-col gap-12 pb-12 min-h-screen">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4">
          Public Roadmap
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          See what we're building next. Our roadmap is categorized by feature lifecycle to provide transparency into the future of the CerebroHive platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {roadmapData.map((column) => (
          <div key={column.category} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <column.icon size={18} className={column.color} />
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                {column.category}
              </h2>
              <span className="ml-auto text-xs font-mono text-text-muted bg-surface px-2 py-0.5 rounded-full border border-border">
                {column.items.length}
              </span>
            </div>
            
            <div className="flex flex-col gap-4">
              {column.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border bg-surface hover:bg-background transition-colors ${column.border}`}
                >
                  <h3 className="text-sm font-bold text-text-primary mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

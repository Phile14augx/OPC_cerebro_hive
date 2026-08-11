import React from "react";
import type { Metadata } from "next";
import { GitCommit, Search } from "lucide-react";
import { JsonLd } from "@/components/discovery";
import { buildTechArticleSchema } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "API Changelog & Release Notes | CerebroHive",
  description: "CerebroHive API changelog — breaking changes, new endpoints, deprecation notices, and upgrade guides for every platform release.",
  keywords: ["CerebroHive changelog", "API release notes", "API updates", "breaking changes", "API migration"],
  alternates: { canonical: "https://cerebropchive.org/developers/changelog" },
};

const schema = buildTechArticleSchema({
  title: "CerebroHive API Changelog & Release Notes",
  description: "Detailed changelog for the CerebroHive API and platform — breaking changes, new endpoints, deprecation notices, and upgrade guides.",
  slug: "developers/changelog",
  urlPath: "/developers/changelog",
  datePublished: "2026-01-01",
  section: "Changelog",
  keywords: ["CerebroHive changelog", "API release notes", "breaking changes"],
});

export default function ChangelogPage() {
  const changelogs = [
    {
      version: "v2.4.1",
      date: "August 12, 2026",
      changes: [
        { type: "FIX", text: "Resolved connection pool exhaustion when scaling NATS subscribers." },
        { type: "PERF", text: "Optimized vector embedding retrieval latency by 15% using HNSW tuning." },
        { type: "DEPENDENCY", text: "Bumped Go version to 1.23 for core AgentOS services." }
      ]
    },
    {
      version: "v2.4.0",
      date: "August 10, 2026",
      changes: [
        { type: "FEATURE", text: "Introduced WebSocket support for real-time agent logging." },
        { type: "FEATURE", text: "Added `max_tokens` configuration to standard AI Agent YAML definitions." },
        { type: "BREAKING", text: "The `/v1/workflows` endpoint now requires `workflow_id` instead of `id` in the request body." },
        { type: "FIX", text: "Corrected timestamp parsing issues in the dashboard archive viewer." }
      ]
    },
    {
      version: "v2.3.5",
      date: "July 28, 2026",
      changes: [
        { type: "FIX", text: "Fixed race condition in agent memory cleanup routine." },
        { type: "SECURITY", text: "Updated `pgxpool` dependency to patch a minor memory leak during TLS handshakes." }
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FEATURE": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "FIX": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "BREAKING": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "PERF": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <>
      <JsonLd schema={schema} />
      <div className="flex flex-col gap-12 pb-12">
      <div className="border-b border-border pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4">
            Changelog
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            Granular, technical details of all updates, bug fixes, and API changes.
          </p>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search commits..." 
            className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-primary-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {changelogs.map((log) => (
          <div key={log.version} className="relative pl-6 md:pl-8 border-l border-border/50">
            <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-surface border-2 border-primary-accent" />
            
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-space font-bold text-text-primary">{log.version}</h2>
              <span className="text-sm font-mono text-text-muted">{log.date}</span>
            </div>
            
            <ul className="flex flex-col gap-3">
              {log.changes.map((change, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTypeColor(change.type)} shrink-0 mt-0.5`}>
                    {change.type}
                  </span>
                  <span className="text-sm text-text-secondary font-mono leading-relaxed">
                    {change.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

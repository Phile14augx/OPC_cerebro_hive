import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/discovery";
import { buildTechArticleSchema } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Platform Release History | CerebroHive",
  description: "CerebroHive platform release history — version notes, new features, performance improvements, and bug fixes across all platform releases.",
  keywords: ["CerebroHive releases", "platform version history", "AI platform release notes", "software updates"],
  alternates: { canonical: "https://cerebropchive.org/developers/releases" },
};

const schema = buildTechArticleSchema({
  title: "CerebroHive Platform Release History",
  description: "Complete release history for the CerebroHive platform — version notes, feature releases, performance improvements, and bug fixes.",
  slug: "developers/releases",
  urlPath: "/developers/releases",
  datePublished: "2026-01-01",
  section: "Release Notes",
  keywords: ["CerebroHive releases", "platform version history", "release notes"],
});

export default function ReleasesPage() {
  const releases = [
    {
      version: "CerebroHive v2.4",
      date: "August 10, 2026",
      title: "Real-time Agent Telemetry & Enhanced Workflows",
      description: "This major release brings unprecedented visibility into your autonomous agents with our new WebSocket-powered real-time telemetry dashboard. We've also overhauled the workflow engine to support conditional branching and human-in-the-loop approvals natively.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200", // placeholder
      highlights: [
        "Live WebSocket telemetry for AgentOS",
        "Human-in-the-loop workflow pauses",
        "New PostgreSQL persistent memory store for Agents"
      ]
    },
    {
      version: "CerebroHive v2.3",
      date: "June 15, 2026",
      title: "The Knowledge Hub Vector Expansion",
      description: "Enterprise RAG just got a massive upgrade. v2.3 introduces native support for HNSW indexing in our Knowledge Hub, reducing semantic search latency by 40% across million-document corpuses.",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200", // placeholder
      highlights: [
        "HNSW vector indexing",
        "Automated document chunking strategies",
        "Role-Based Access Control (RBAC) down to the document level"
      ]
    }
  ];

  return (
    <>
      <JsonLd schema={schema} />
      <div className="flex flex-col gap-12 pb-12">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4 flex items-center gap-3">
          Release Notes <Sparkles className="text-primary-accent" size={28} />
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Discover the latest features, major improvements, and product announcements across the CerebroHive ecosystem.
        </p>
      </div>

      <div className="flex flex-col gap-16">
        {releases.map((release) => (
          <article key={release.version} className="flex flex-col gap-6 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/50 pb-4">
              <h2 className="text-2xl font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                {release.version}: {release.title}
              </h2>
              <span className="text-sm font-mono text-text-muted shrink-0">{release.date}</span>
            </div>
            
            <div className="w-full h-48 md:h-80 relative rounded-2xl overflow-hidden border border-border">
              <Image 
                src={release.image} 
                alt={release.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  {release.description}
                </p>
                <Link href="/developers/changelog" className="inline-flex items-center gap-2 text-sm font-bold text-text-primary hover:text-primary-accent transition-colors">
                  View full technical changelog <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="bg-surface p-6 rounded-xl border border-border">
                <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4">Highlights</h4>
                <ul className="flex flex-col gap-3">
                  {release.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-accent mt-1.5 shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
    </>
  );
}

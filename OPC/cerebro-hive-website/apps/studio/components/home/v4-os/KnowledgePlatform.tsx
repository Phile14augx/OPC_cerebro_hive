"use client";

import { knowledgeHub } from "@/lib/config/knowledge";
import { TrackedLink } from "@/components/cerebro/TrackedLink";

export function KnowledgePlatform() {
  return (
    <section className="py-24 relative bg-background text-text-primary border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Knowledge Platform
            </h2>
            <p className="text-xl text-text-muted">
              Architectural patterns, engineering playbooks, and research from the CerebroHive labs.
            </p>
          </div>
          <TrackedLink href="/research" analyticsEvent="knowledge_explore_research_click" analyticsCategory="home" analyticsLabel="Explore All Research" className="px-6 py-3 bg-primary-accent text-black font-semibold rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap">
            Explore All Research
          </TrackedLink>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {knowledgeHub.map((item) => (
            <TrackedLink
              href="/research"
              key={item.id}
              analyticsEvent="knowledge_item_click"
              analyticsCategory="home"
              analyticsLabel={item.title}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    {item.type}
                  </span>
                  <span className="text-xs text-text-muted">{item.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
              
              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                <span>Read Document</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </TrackedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

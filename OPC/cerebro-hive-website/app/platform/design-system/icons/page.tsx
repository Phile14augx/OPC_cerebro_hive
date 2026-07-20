import React from "react";
import * as Icons from "@/components/ui/icons";
import { iconRegistry } from "@/components/ui/icons/registry";

export default function IconDesignSystemPage() {
  const categories = ["navigation", "architecture", "chat", "actions", "files", "status", "feedback"];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] p-12 pt-24 font-inter">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <header className="space-y-4">
          <h1 className="text-4xl font-space font-bold tracking-tight">Cerebro AI Chatbot Icon Set</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
            Custom icons for an intelligent enterprise chatbot experience. 
            These dual-tone SVGs are optimized for the Cerebro Enterprise UI.
          </p>
        </header>

        {/* Demo Animations */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-default)] pb-2">
            Animation Support
          </h2>
          <div className="flex gap-8 items-center bg-[var(--bg-surface-elevated)] p-8 rounded-xl border border-[var(--border-default)]">
            <div className="flex flex-col items-center gap-3">
              <Icons.Loading size="lg" spin />
              <span className="text-sm text-[var(--text-secondary)]">spin</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Icons.Thinking size="lg" pulse />
              <span className="text-sm text-[var(--text-secondary)]">pulse</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Icons.AiResponse size="lg" glow />
              <span className="text-sm text-[var(--text-secondary)]">glow</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Icons.Send size="lg" animated />
              <span className="text-sm text-[var(--text-secondary)]">animated (hover)</span>
            </div>
          </div>
        </section>

        {/* Icons Grid by Category */}
        {categories.map((category) => {
          const categoryIcons = Object.values(iconRegistry).filter(icon => icon.category === category);
          
          if (categoryIcons.length === 0) return null;

          return (
            <section key={category} className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-default)] pb-2">
                {category.replace("-", " ")}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                {categoryIcons.map((metadata) => {
                  const IconComponent = (Icons as any)[metadata.name];
                  
                  if (!IconComponent) return null;

                  return (
                    <div 
                      key={metadata.name}
                      className="group flex flex-col items-center justify-center p-6 gap-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-focus)] hover:shadow-lg transition-all"
                    >
                      <IconComponent size="lg" className="group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-center font-medium text-[var(--text-secondary)]">
                        {metadata.name.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

      </div>
    </div>
  );
}

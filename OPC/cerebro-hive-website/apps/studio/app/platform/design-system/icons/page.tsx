import React from "react";
import { IconShowcase } from "./IconShowcase";

export default function IconDesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] p-12 pt-24 font-inter">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <header className="space-y-4">
          <h1 className="text-4xl font-space font-bold tracking-tight">Cerebro Design System: Icons</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
            A comprehensive, animated, and dual-tone enterprise icon taxonomy.
            Explore over 500 semantic concepts tailored for AI workflows.
          </p>
        </header>

        <IconShowcase />

      </div>
    </div>
  );
}

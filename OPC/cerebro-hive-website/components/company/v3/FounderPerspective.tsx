"use client";

import React from "react";
import { Quote } from "lucide-react";

export default function FounderPerspective() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          
          {/* Portrait Placeholder */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl bg-surface border border-border overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00F57A]/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                {/* Replace with actual CEO image */}
                <div className="w-32 h-32 rounded-full border border-border flex items-center justify-center mb-4">
                  <span className="text-4xl font-space font-bold">P</span>
                </div>
                <span className="font-space font-bold text-sm tracking-widest uppercase">Philemon V. Nath</span>
              </div>
            </div>
            {/* Accent elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-primary/20 blur-[50px] rounded-full pointer-events-none" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#00E5FF]/20 blur-[50px] rounded-full pointer-events-none" />
          </div>

          {/* Letter */}
          <div className="relative">
            <Quote size={64} className="text-text-muted absolute -top-8 -left-8" />
            
            <h2 className="text-xs font-bold tracking-widest uppercase text-text-muted mb-8">The Founder Perspective</h2>
            
            <div className="space-y-6 text-lg text-text-primary font-inter leading-relaxed relative z-10">
              <p>
                When we started CerebroHive, we saw a massive disconnect between the frontier of AI research and the reality of enterprise operations.
              </p>
              <p>
                Organizations were being sold <em>tools</em>—chatbots, copilots, and wrappers—that did not fundamentally change how work was done. They were layering intelligence on top of broken, siloed architectures.
              </p>
              <p>
                We believed that for AI to truly transform an enterprise, it could not be an add-on. It had to be the foundation. Knowledge had to become infrastructure.
              </p>
              <p>
                That is why we built CerebroHive. We don't just deploy models; we architect the operating system for the AI-native enterprise. Our mission is to build systems that learn, reason, and act—elevating humans from operators to strategists.
              </p>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F57A] to-[#00E5FF] flex items-center justify-center shrink-0">
                <span className="text-text-primary text-lg font-black">P</span>
              </div>
              <div>
                <span className="block font-space font-bold text-text-primary text-lg">Philemon V. Nath</span>
                <span className="block text-xs uppercase tracking-widest text-text-muted font-bold">Founder & CEO, CerebroHive</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

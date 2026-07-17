"use client";

import React from "react";
import Image from "next/image";
import { Quote } from "lucide-react";

export default function FounderPerspective() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          
          {/* Portrait */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl bg-surface border border-border overflow-hidden relative group">
              <Image 
                src="/images/my_profile_pic.png" 
                alt="Philemon V. Nath, Founder & CEO" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 text-text-primary z-10">
                <span className="font-space font-bold text-lg tracking-widest uppercase block mb-1">Philemon V. Nath</span>
                <span className="text-sm font-medium text-primary-accent">Founder & CEO</span>
              </div>
            </div>
            {/* Accent elements */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,245,122,0.15) 0%, transparent 60%)' }} />
            <div className="absolute -top-16 -left-16 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 60%)' }} />
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
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-border relative">
                <Image 
                  src="/images/my_profile_pic.png" 
                  alt="Philemon V. Nath" 
                  fill 
                  className="object-cover"
                />
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

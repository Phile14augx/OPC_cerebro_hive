"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Quote } from "lucide-react";
import Image from "next/image";

export const CEOMessage = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="section-pad bg-surface-elevated border-y border-border">
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex flex-col md:flex-row gap-12 items-start">
            
            {/* Left: CEO Profile (Sticky on desktop) */}
            <div className="md:w-1/3 md:sticky md:top-32 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="relative w-48 h-48 md:w-full md:aspect-[4/5] md:h-auto rounded-2xl overflow-hidden mb-6 bg-surface border border-border">
                {/* Fallback pattern */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                </div>
                {/* <Image src="/images/placeholders/ceo.jpg" alt="Philemon V Nath" fill className="object-cover grayscale" /> */}
              </div>
              <h3 className="text-2xl font-space font-bold text-text-primary mb-1">
                Philemon V Nath
              </h3>
              <p className="text-sm font-space font-bold uppercase tracking-widest text-primary-accent mb-4">
                Chief Executive Officer
              </p>
              <div className="w-12 h-1 bg-border rounded-full hidden md:block" />
            </div>

            {/* Right: Message Content */}
            <div className="md:w-2/3 relative">
              <Quote size={80} className="absolute -top-10 -left-10 text-border opacity-50 z-0" />
              
              <div className="relative z-10 prose prose-lg dark:prose-invert max-w-none text-text-secondary font-inter leading-relaxed">
                <p className="text-2xl md:text-3xl font-space font-bold text-text-primary leading-tight mb-8">
                  "The gap between an executive's AI vision and a working system in production is an execution problem, not a technology problem."
                </p>
                
                <p>
                  When we founded CerebroHive, we saw a market divided in two. On one side, massive strategy consultancies delivering visionary slide decks with no engineering capability to build them. On the other, boutique development shops building impressive models that failed to connect to any strategic business outcome.
                </p>
                
                <p>
                  We built CerebroHive to be the bridge. We believe that technology is merely a lever for business value. We measure our success not by the sophistication of our architectures, but by the measurable revenue gained, costs removed, and risks mitigated for our clients.
                </p>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-6">
                        <h4 className="text-xl font-space font-bold text-text-primary mt-8 mb-4">
                          Our Strategic Vision for 2030
                        </h4>
                        <p>
                          Enterprise AI adoption is moving from isolated pilots to production at scale. Yet, a vast majority of organizations lack the internal capability to securely operationalize these technologies. They don't just need software; they need new operating models.
                        </p>
                        <p>
                          By 2030, our goal is to ensure that every mid-market and enterprise organization we partner with has AI embedded into their core business processes—acting as a systematic, compounding competitive advantage. 
                        </p>
                        <p>
                          Through our proprietary frameworks like CerebroSphere™, our enterprise platforms like Quantiva ERP, and the relentless rigor of CerebroHive Labs, we are setting the standard for what intelligent enterprise transformation looks like.
                        </p>
                        
                        <div className="pt-8 pb-4">
                          <p className="font-space font-bold text-text-primary text-xl">
                            Philemon V Nath
                          </p>
                          <p className="text-sm font-space uppercase tracking-widest text-text-muted mt-1">
                            CEO & Founder, CerebroHive
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isExpanded && (
                  <button 
                    onClick={() => setIsExpanded(true)}
                    className="mt-8 flex items-center gap-2 text-sm font-space font-bold uppercase tracking-widest text-primary-accent hover:text-[#00E5FF] transition-colors"
                  >
                    Read Full Letter
                    <ChevronDown size={16} className="animate-bounce" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

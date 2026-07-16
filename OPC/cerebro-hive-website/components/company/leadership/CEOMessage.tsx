"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Quote, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { withBasePath, cn } from "@/lib/utils";
import { executiveProfile } from "@/lib/content/company/leadership";
import { SectionMetadata } from "@/components/ui/SectionMetadata";
import { motionPresets } from "@/lib/motion";

export const CEOMessage = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="section-pad relative bg-[#020508] border-t border-border overflow-hidden">
      
      {/* Ambient Boardroom Environment */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)`, 
               backgroundSize: '100px 100px',
               maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 80%)',
               WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 80%)'
             }} 
        />
        <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[200px] mix-blend-screen" />
      </div>

      <div className="container-wide relative z-10">
        
        <motion.div 
          variants={motionPresets.stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row gap-16 lg:gap-12"
        >
          
          {/* ==========================================
              LEFT PANEL: Executive Identity (40%)
             ========================================== */}
          <div className="lg:w-[40%] flex flex-col order-1">
            <SectionMetadata 
              sectionNumber={executiveProfile.metadata.section} 
              title={executiveProfile.metadata.title} 
              version={executiveProfile.metadata.version} 
            />

            {/* Premium Executive Portrait */}
            <motion.div variants={motionPresets.fadeUp} className="group relative w-full aspect-[4/5] max-w-sm mx-auto lg:mx-0 rounded-2xl overflow-hidden mb-8 bg-[#0a0f12] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {/* Soft Edge Lighting / Vignette */}
              <div className="absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
              {/* Glass Frame Reflection */}
              <div className="absolute inset-0 z-20 bg-gradient-to-tr from-border-subtle to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <Image 
                src={withBasePath(executiveProfile.identity.image)} 
                alt={`Portrait of ${executiveProfile.identity.name}`} 
                fill 
                className="object-cover grayscale brightness-90 contrast-125 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-out"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </motion.div>

            {/* Executive Identity & Signature */}
            <motion.div variants={motionPresets.fadeUp} className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Subtle SVG Signature Placeholder */}
              <div className="w-32 h-12 mb-2 opacity-60 flex items-center justify-center lg:justify-start">
                <svg viewBox="0 0 200 60" className="w-full h-full stroke-text-primary fill-none stroke-2" style={{ strokeLinecap: "round", strokeLinejoin: "round" }}>
                  <path d="M 20,40 C 30,20 40,10 50,35 C 60,60 70,20 80,40 C 90,60 100,10 110,35 C 120,60 130,20 140,40 C 150,60 160,20 170,35" className="opacity-50" />
                  <path d="M 40,45 L 180,45" className="stroke-primary-accent opacity-30" />
                </svg>
              </div>
              
              <h3 className="text-3xl font-space font-bold text-text-primary mb-2">
                {executiveProfile.identity.name}
              </h3>
              <p className="text-sm font-space font-bold uppercase tracking-[0.2em] text-primary-accent mb-4">
                {executiveProfile.identity.role}
              </p>
              
              {/* Executive Metadata */}
              <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted uppercase tracking-wider">
                <span>Since {executiveProfile.identity.since}</span>
                <div className="w-1 h-1 rounded-full bg-surface-elevated" />
                <span>{executiveProfile.identity.office}</span>
              </div>
            </motion.div>
          </div>

          {/* ==========================================
              RIGHT PANEL: Leadership Narrative (60%)
             ========================================== */}
          <div className="lg:w-[60%] flex flex-col pt-4 lg:pt-16 order-2">
            
            {/* The Quote */}
            <motion.blockquote variants={motionPresets.fadeUp} className="relative mb-16 pl-8 lg:pl-12">
              <Quote size={64} className="absolute -top-6 -left-4 lg:-left-2 text-text-muted z-0" />
              <p className="relative z-10 text-2xl md:text-3xl lg:text-4xl font-space font-bold text-text-primary leading-[1.2] tracking-tight">
                "{executiveProfile.quote.text}"
              </p>
            </motion.blockquote>

            {/* Leadership Philosophy (Framework Layout) */}
            <motion.div variants={motionPresets.fadeUp} className="mb-16">
              <h4 className="text-xs font-space font-bold uppercase tracking-[0.2em] text-text-muted mb-8 border-b border-border pb-4">
                Leadership Philosophy
              </h4>
              <div className="flex flex-col gap-6">
                {executiveProfile.philosophyFramework.map((phil, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="text-[10px] font-mono font-bold text-primary-accent bg-primary-accent/10 px-2 py-1 rounded border border-primary-accent/20 mt-1">
                      {phil.step}
                    </div>
                    <div>
                      <h5 className="text-sm font-space font-bold text-text-primary uppercase tracking-wider mb-2 group-hover:text-primary-accent transition-colors">
                        {phil.title}
                      </h5>
                      <p className="text-text-secondary font-inter leading-relaxed">
                        {phil.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Strategic Focus & Commitments (2 Columns) */}
            <motion.div variants={motionPresets.fadeUp} className="grid md:grid-cols-2 gap-12 mb-16 bg-[#070a0f] p-8 rounded-2xl border border-border">
              
              {/* Strategic Focus */}
              <div>
                <h4 className="text-xs font-space font-bold uppercase tracking-[0.2em] text-text-muted mb-6">
                  Strategic Focus
                </h4>
                <div className="flex flex-wrap gap-2">
                  {executiveProfile.strategicFocus.map((focus, i) => (
                    <span key={i} className="text-[11px] font-mono text-text-secondary bg-surface border border-border px-3 py-1.5 rounded-md hover:bg-surface-elevated transition-colors cursor-default">
                      {focus}
                    </span>
                  ))}
                </div>
              </div>

              {/* Client Commitments */}
              <div>
                <h4 className="text-xs font-space font-bold uppercase tracking-[0.2em] text-text-muted mb-6">
                  Clients Can Expect
                </h4>
                <ul className="flex flex-col gap-3">
                  {executiveProfile.clientCommitments.map((commitment, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={14} className="text-primary-accent opacity-80" />
                      <span className="text-xs font-mono text-text-secondary">{commitment}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </motion.div>

            {/* Executive Letter Accordion */}
            <motion.div variants={motionPresets.fadeUp} className="border-t border-border pt-8">
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="overflow-hidden mb-8"
                  >
                    <div className="prose prose-lg dark:prose-invert max-w-none text-text-secondary font-inter leading-relaxed">
                      {executiveProfile.letter.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isExpanded && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="group flex flex-col items-start focus:outline-none focus:ring-2 focus:ring-primary-accent/50 rounded-lg p-2 -ml-2"
                  aria-expanded="false"
                  aria-label="Expand executive letter"
                >
                  <div className="flex items-center gap-3 text-sm font-space font-bold uppercase tracking-widest text-primary-accent group-hover:text-[#00E5FF] transition-colors mb-2">
                    {executiveProfile.letter.title}
                    <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
                  </div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    {executiveProfile.letter.metadata}
                  </span>
                </button>
              )}
            </motion.div>

          </div>

        </motion.div>
      </div>
    </section>
  );
};

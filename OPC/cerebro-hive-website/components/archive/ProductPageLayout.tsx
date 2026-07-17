"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductData, SoftwarePlatform, ProprietaryFramework } from '@/lib/data/products/types';
import { SectionHeading } from '../ui/SectionHeading';
import { ArchitectureCanvas } from '../architecture/ArchitectureCanvas';
import { ProductComparisonCard } from './ProductComparisonCard';
import { ArrowRight, CheckCircle2, ChevronRight, Cloud, Lock, Server } from 'lucide-react';
import Link from 'next/link';

export const ProductPageLayout = ({ product }: { product: ProductData }) => {
  const isSoftware = product.type === "software";
  const software = isSoftware ? (product as SoftwarePlatform) : null;
  const framework = !isSoftware ? (product as ProprietaryFramework) : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={product.slug}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background min-h-screen relative"
      >
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b opacity-50 from-primary-accent/5 via-transparent to-transparent" />

        {/* Unified Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center z-10 border-b border-border">
          <div className="container-wide flex flex-col items-center">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: product.color }} />
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">{product.type === "software" ? "Enterprise Platform" : "Proprietary IP"}</span>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
               {product.name}
             </h1>
             
             <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
               {product.tagline}
             </p>

             <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                <button className="w-full sm:w-auto px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-1 shadow-elevated">
                  {isSoftware ? "Request Demo" : "Explore Framework"}
                </button>
             </div>
          </div>
        </section>

        <div className="relative z-10">
          
          {/* Overview */}
          <section className="section-pad border-b border-border bg-surface-elevated">
            <div className="container-wide max-w-4xl text-center">
              <h2 className="text-3xl font-space font-bold text-text-primary mb-6">Overview</h2>
              <p className="text-lg text-text-secondary leading-relaxed">{product.description}</p>
            </div>
          </section>

          {/* Conditional Sections based on Type */}
          {isSoftware && software && (
            <>
              {/* Modules Grid */}
              <section className="section-pad border-b border-border">
                <div className="container-wide">
                  <SectionHeading label="Capabilities" title="Platform Modules" description="Integrated components powering the intelligent enterprise." />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
                    {software.modules.map((mod, i) => (
                      <div key={i} className="p-6 rounded-xl bg-surface border border-border flex items-center justify-center text-center group hover:border-primary-accent/50 transition-colors shadow-sm">
                        <span className="text-sm font-bold text-text-primary group-hover:text-primary-accent transition-colors">{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Feature Comparison */}
              {software.comparisons && software.comparisons.competitors.length > 0 && (
                <section className="section-pad border-b border-border bg-surface-elevated">
                  <div className="container-wide">
                    <ProductComparisonCard platform={software} />
                  </div>
                </section>
              )}

              {/* Deployment */}
              <section className="section-pad border-b border-border">
                <div className="container-wide">
                  <SectionHeading label="Infrastructure" title="Deployment Models" description="Flexible deployment to meet enterprise security requirements." />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                    {software.deploymentOptions.map((opt, i) => (
                      <div key={i} className="p-8 rounded-2xl bg-surface border border-border shadow-sm flex flex-col gap-4 group hover:border-primary-accent/50 transition-colors">
                         <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center text-primary-accent">
                           {opt.name === "Cloud" ? <Cloud size={20} /> : <Server size={20} />}
                         </div>
                         <h4 className="text-lg font-bold text-text-primary">{opt.name}</h4>
                         <p className="text-sm text-text-secondary">{opt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Proprietary IP Specific Sections */}
          {!isSoftware && framework && (
            <>
              {/* Methodology Flow */}
              <section className="section-pad border-b border-border">
                <div className="container-wide">
                  <SectionHeading label="Methodology" title="Execution Lifecycle" description="Standardized approach for scaling AI across the enterprise." />
                  <div className="flex flex-col md:flex-row items-stretch justify-center gap-2 md:gap-4 mt-16">
                     {framework.phases.map((phase, i) => (
                       <React.Fragment key={i}>
                         <div className="flex-1 min-h-[100px] bg-surface border border-border rounded-xl flex items-center justify-center p-4 text-center group hover:border-primary-accent/50 transition-colors shadow-sm">
                           <span className="text-sm font-bold text-text-primary group-hover:text-primary-accent">{phase}</span>
                         </div>
                         {i < framework.phases.length - 1 && (
                           <div className="hidden md:flex items-center justify-center">
                             <ChevronRight className="text-border" size={24} />
                           </div>
                         )}
                       </React.Fragment>
                     ))}
                  </div>
                </div>
              </section>

              {/* Components & Deliverables */}
              <section className="section-pad border-b border-border bg-surface-elevated">
                <div className="container-wide grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div>
                    <h3 className="text-2xl font-space font-bold text-text-primary mb-8 border-b border-border pb-4">Core Components</h3>
                    <ul className="flex flex-col gap-4">
                      {framework.components.map((comp, i) => (
                        <li key={i} className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg shadow-sm">
                          <CheckCircle2 size={16} className="text-primary-accent" />
                          <span className="text-sm font-bold text-text-primary">{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-space font-bold text-text-primary mb-8 border-b border-border pb-4">Executive Deliverables</h3>
                    <ul className="flex flex-col gap-4">
                      {framework.deliverables.map((del, i) => (
                        <li key={i} className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg shadow-sm">
                          <ArrowRight size={16} className="text-text-muted" />
                          <span className="text-sm font-bold text-text-secondary">{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Level 2 Interactive Architecture (React Flow) */}
          <section className="section-pad border-b border-border">
            <div className="container-wide flex flex-col gap-8">
              <SectionHeading label="Deep Dive" title={isSoftware ? "Platform Architecture" : "Framework Blueprint"} description="Explore the technical topology." />
              
              {product.architecture && product.architecture.nodes.length > 0 ? (
                 <ArchitectureCanvas 
                   initialNodes={product.architecture.nodes} 
                   initialEdges={product.architecture.edges} 
                   direction="LR"
                 />
              ) : (
                <div className="w-full h-[500px] bg-surface-elevated border border-border rounded-xl flex flex-col items-center justify-center text-text-muted text-sm font-mono shadow-sm">
                  <Lock size={32} className="mb-4 opacity-50" />
                  [ React Flow Architecture Blueprint Pending ]
                </div>
              )}
            </div>
          </section>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

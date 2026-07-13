"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { allResearchData } from '@/lib/content/research';
import { BenchmarkData } from '@/lib/content/research/types';
import { ArrowRight, BarChart2, Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const BenchmarkDashboard = () => {
  // Find all benchmarks from the data layer
  const benchmarks = allResearchData.filter(r => r.category === "benchmarks");
  
  const [activeBenchmarkId, setActiveBenchmarkId] = useState<string>(benchmarks[0]?.id);
  
  const activeBenchmark = benchmarks.find(b => b.id === activeBenchmarkId) || benchmarks[0];
  const data: BenchmarkData | undefined = activeBenchmark?.benchmarkData;

  if (benchmarks.length === 0) return null;

  return (
    <section className="section-pad border-b border-border bg-background">
      <div className="container-wide">
        <SectionHeading 
          label="Laboratory" 
          title="Enterprise AI Benchmarks" 
          description="Vendor-neutral evaluation methodology for enterprise AI systems." 
        />
        
        {/* Banner indicating illustrative data */}
        <div className="mt-8 mb-12 p-4 bg-primary-accent/5 border border-primary-accent/20 rounded-lg flex items-start gap-3">
          <Info size={18} className="text-primary-accent shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">
            <strong className="text-primary-accent">Benchmark Laboratory Preview</strong> — Values shown are illustrative placeholders demonstrating the evaluation methodology. They will be replaced by the official CerebroHive Benchmark Suite™ upon completion of internal testing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Benchmark Selector */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-2">
             {benchmarks.map((b) => (
               <button
                 key={b.id}
                 onClick={() => setActiveBenchmarkId(b.id)}
                 className={cn(
                   "text-left p-5 rounded-xl border transition-all duration-300 flex flex-col gap-1",
                   activeBenchmarkId === b.id 
                     ? "bg-surface border-primary-accent shadow-sm"
                     : "bg-background border-border hover:border-primary-accent/30"
                 )}
               >
                 <span className={cn(
                   "text-sm font-space font-bold",
                   activeBenchmarkId === b.id ? "text-text-primary" : "text-text-secondary"
                 )}>
                   {b.title.replace("Benchmark: ", "")}
                 </span>
                 <span className="text-[10px] uppercase tracking-widest text-text-muted">
                   {b.domain}
                 </span>
               </button>
             ))}
          </div>

          {/* Right Panel: Benchmark Visualization */}
          <div className="col-span-1 lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeBenchmark && data && (
                <motion.div
                  key={activeBenchmark.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col"
                >
                  <div className="flex justify-between items-start mb-8 border-b border-border pb-6">
                    <div>
                      <h3 className="text-2xl font-space font-bold text-text-primary mb-2">Evaluation Metrics</h3>
                      <div className="flex gap-4 text-xs text-text-secondary mt-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold">Methodology</span>
                          <span className="max-w-md leading-relaxed">{data.methodology}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/research/benchmarks/${activeBenchmark.slug}`} className="shrink-0 p-3 bg-background border border-border rounded-full hover:bg-primary-accent hover:text-black transition-colors">
                      <ArrowRight size={18} />
                    </Link>
                  </div>

                  {/* Charts */}
                  <div className="flex flex-col gap-6">
                    {data.metrics.map((metric, i) => (
                      <div key={metric.name} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{metric.name}</span>
                          <span className="text-xs font-mono text-primary-accent">{metric.score}/100</span>
                        </div>
                        <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.score}%` }}
                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                            className="h-full bg-primary-accent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={16} className="text-text-muted" />
                      <span className="text-xs font-mono text-text-secondary">Dataset: {data.dataset}</span>
                    </div>
                    <Link href={`/research/benchmarks/${activeBenchmark.slug}`} className="text-xs font-bold text-primary-accent hover:underline">
                      Read Full Methodology →
                    </Link>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

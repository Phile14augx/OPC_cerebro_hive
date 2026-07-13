"use client";

import React from 'react';
import { ResearchPublication } from '@/lib/content/research/types';
import { motion } from 'framer-motion';
import { Calendar, Clock, Copy, Download, FileText, Quote, Share2, ShieldCheck } from 'lucide-react';
import { ResearchArchitectureCanvas } from './ResearchArchitectureCanvas';
import Link from 'next/link';

export const ResearchReader = ({ publication }: { publication: ResearchPublication }) => {
  
  const formattedDate = new Date(publication.publishDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-background min-h-screen pt-24 pb-32 selection:bg-primary-accent/30 selection:text-black">
      <div className="container-wide">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-8">
          <Link href="/research" className="hover:text-primary-accent transition-colors">Research</Link>
          <span>/</span>
          <Link href={`/research?category=${publication.category}`} className="hover:text-primary-accent transition-colors capitalize">
            {publication.category.replace('-', ' ')}
          </Link>
          <span>/</span>
          <span className="text-text-secondary truncate max-w-xs">{publication.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-12">
            
            {/* Header */}
            <header className="flex flex-col gap-6 border-b border-border pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-primary-accent/10 border border-primary-accent/20 text-[10px] uppercase tracking-widest font-bold text-primary-accent">
                  {publication.domain}
                </span>
                <span className="px-2.5 py-1 rounded bg-surface border border-border text-[10px] uppercase tracking-widest font-bold text-text-secondary flex items-center gap-1">
                  <ShieldCheck size={12} className="text-green-500" /> {publication.status}
                </span>
                <span className="px-2.5 py-1 rounded bg-surface border border-border text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                  Difficulty: {publication.difficulty}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-space font-bold text-text-primary leading-[1.2] tracking-tight">
                {publication.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-3">
                  {publication.authors.map((author, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold text-text-primary">
                        {author.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary text-xs">{author.name}</span>
                        <span className="text-[10px] font-mono text-text-muted">{author.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="hidden sm:block h-6 w-px bg-border" />
                
                <div className="flex items-center gap-4 font-mono text-xs">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {formattedDate}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {publication.readingTimeMinutes} min read</span>
                  {publication.version && (
                    <span className="flex items-center gap-1.5"><FileText size={14} /> v{publication.version}</span>
                  )}
                </div>
              </div>
            </header>

            {/* Abstract */}
            <section id="abstract" className="prose prose-invert prose-emerald max-w-none">
              <h2 className="text-2xl font-space font-bold text-text-primary mb-4">Abstract</h2>
              <p className="text-lg text-text-secondary leading-relaxed border-l-2 border-primary-accent pl-4 italic">
                {publication.abstract}
              </p>
            </section>

            {/* Architecture Rendering */}
            {publication.architecture && (
              <section id="architecture" className="flex flex-col gap-4">
                <h2 className="text-2xl font-space font-bold text-text-primary mb-2">Reference Architecture</h2>
                <ResearchArchitectureCanvas data={publication.architecture} />
              </section>
            )}

            {/* Benchmark Rendering */}
            {publication.benchmarkData && (
              <section id="benchmark" className="flex flex-col gap-4">
                 <h2 className="text-2xl font-space font-bold text-text-primary mb-2">Evaluation Metrics</h2>
                 <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                   <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                     <strong>Methodology:</strong> {publication.benchmarkData.methodology}
                   </p>
                   <div className="flex flex-col gap-5">
                     {publication.benchmarkData.metrics.map(metric => (
                       <div key={metric.name} className="flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{metric.name}</span>
                            <span className="text-xs font-mono text-primary-accent">{metric.score}/100</span>
                          </div>
                          <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.score}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-primary-accent"
                            />
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
              </section>
            )}

            {/* Placeholder for actual markdown body content */}
            <section className="py-24 border border-dashed border-border rounded-xl flex items-center justify-center text-text-muted mt-8">
               [ Markdown Content Engine Hooks Here ]
            </section>

          </div>

          {/* Right Sidebar */}
          <aside className="col-span-1 lg:col-span-4 flex flex-col gap-8">
            
            {/* Actions */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3">
              <button className="w-full py-3 bg-primary-accent text-black font-space font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-[#00F57A]/90 transition-colors">
                <Download size={16} /> Download PDF
              </button>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-background border border-border text-text-primary text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-surface transition-colors">
                  <Share2 size={14} /> Share
                </button>
                <button className="flex-1 py-2 bg-background border border-border text-text-primary text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-surface transition-colors">
                  <Quote size={14} /> Cite
                </button>
              </div>
            </div>

            {/* Citation Panel */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <h4 className="text-xs font-space font-bold uppercase tracking-widest text-text-primary mb-4 border-b border-border pb-2">
                Cite this Research
              </h4>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] font-bold text-text-muted mb-1 block">APA</span>
                  <div className="relative group">
                    <p className="text-[11px] text-text-secondary leading-relaxed p-3 bg-background border border-border rounded">
                      {publication.authors.map(a => a.name.split(' ').pop()).join(', ')} ({new Date(publication.publishDate).getFullYear()}). {publication.title}. CerebroHive Labs.
                    </p>
                    <button className="absolute top-2 right-2 text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table of Contents (Static mock for now) */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm sticky top-24">
              <h4 className="text-xs font-space font-bold uppercase tracking-widest text-text-primary mb-4 border-b border-border pb-2">
                Contents
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-text-secondary">
                <li className="hover:text-primary-accent transition-colors cursor-pointer font-bold">Abstract</li>
                <li className="hover:text-primary-accent transition-colors cursor-pointer pl-2">Executive Summary</li>
                {publication.architecture && <li className="hover:text-primary-accent transition-colors cursor-pointer font-bold">Reference Architecture</li>}
                {publication.benchmarkData && <li className="hover:text-primary-accent transition-colors cursor-pointer font-bold">Evaluation Metrics</li>}
                <li className="hover:text-primary-accent transition-colors cursor-pointer font-bold">Methodology</li>
                <li className="hover:text-primary-accent transition-colors cursor-pointer pl-2">Data Collection</li>
                <li className="hover:text-primary-accent transition-colors cursor-pointer font-bold">Results</li>
                <li className="hover:text-primary-accent transition-colors cursor-pointer font-bold">References</li>
              </ul>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

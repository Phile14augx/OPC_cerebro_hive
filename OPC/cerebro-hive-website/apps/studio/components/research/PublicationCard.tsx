"use client";

import React from 'react';
import { ResearchPublication } from '@/lib/content/research/types';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Clock, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PublicationCard = ({ pub }: { pub: ResearchPublication }) => {
  
  const getIcon = () => {
    switch (pub.category) {
      case 'papers': return <BookOpen size={16} />;
      case 'whitepapers': return <FileText size={16} />;
      case 'reference-architectures': return <NetworkIcon size={16} />;
      case 'benchmarks': return <BarChartIcon size={16} />;
      default: return <FileText size={16} />;
    }
  };

  // Date formatter
  const formattedDate = new Date(pub.publishDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <Link 
      href={`/research/${pub.category}/${pub.slug}`}
      className="@container group flex flex-col bg-surface border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary-accent/40 hover:shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background border border-border text-[10px] uppercase tracking-widest font-bold text-text-muted group-hover:text-primary-accent transition-colors">
          {pub.domain}
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted">
          <span className="flex items-center gap-1"><Calendar size={12} /> {formattedDate}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {pub.readingTimeMinutes}m read</span>
        </div>
      </div>
      
      <div className="flex-1 mb-6">
        <h3 className="text-xl @sm:text-2xl font-space font-bold text-text-primary mb-3 leading-snug group-hover:text-primary-accent transition-colors">
          {pub.title}
        </h3>
        <p className="text-sm @sm:text-base text-text-secondary line-clamp-3 leading-relaxed">
          {pub.abstract}
        </p>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <div className="flex items-center gap-2">
          {pub.authors[0]?.avatar ? (
            <Image src={pub.authors[0].avatar} alt={pub.authors[0].name} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-bold text-text-muted">
              {pub.authors[0]?.name.charAt(0)}
            </div>
          )}
          <span className="text-xs font-bold text-text-secondary">{pub.authors[0]?.name}</span>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center group-hover:bg-primary-accent group-hover:text-text-primary transition-all">
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
};

// Helper icons
function NetworkIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>;
}
function BarChartIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
}

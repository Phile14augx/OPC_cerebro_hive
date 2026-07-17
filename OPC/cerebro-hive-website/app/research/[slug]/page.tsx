import { researchPrograms } from "@/lib/data/research";
import { Metadata } from 'next';
import { notFound } from "next/navigation";
import React from 'react';
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckCircle2 } from "lucide-react";

export async function generateStaticParams() {
  return researchPrograms.map((r) => ({
    slug: r.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = researchPrograms.find(r => r.slug === slug);
  if (!program) return { title: 'Research Not Found' };
  
  return {
    title: `${program.title} | CerebroHive Labs`,
    description: program.summary,
  };
}

export default async function ResearchProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = researchPrograms.find(r => r.slug === slug);

  if (!program) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen pt-24 font-inter">
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center z-10 border-b border-border text-center">
        <div className="absolute inset-0 bg-gradient-to-b opacity-50 from-primary-accent/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container-wide flex flex-col items-center relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">CerebroHive Labs</span>
           </div>
           
           <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
             {program.title}
           </h1>
           
           <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
             {program.hero.description}
           </p>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated">
        <div className="container-wide grid md:grid-cols-2 gap-16">
          <div>
            <SectionHeading label="Overview" title={program.hero.subtitle} description={program.summary} />
            
            <div className="mt-8 flex flex-wrap gap-2">
              {program.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-background border border-border rounded-full text-xs font-bold text-text-primary">{tag}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-space font-bold text-text-primary mb-8 border-b border-border pb-4">Publications & Experiments</h3>
            <ul className="flex flex-col gap-4">
              {program.publications.map((pub, i) => (
                <li key={i} className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg shadow-sm">
                  <CheckCircle2 size={16} className="text-primary-accent" />
                  <span className="text-sm font-bold text-text-primary">{pub}</span>
                </li>
              ))}
              {program.experiments.map((exp, i) => (
                <li key={`exp-${i}`} className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg shadow-sm">
                  <CheckCircle2 size={16} className="text-accent-primary" />
                  <span className="text-sm font-bold text-text-primary">{exp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

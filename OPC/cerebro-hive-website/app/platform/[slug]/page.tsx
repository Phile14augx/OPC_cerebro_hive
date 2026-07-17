import { platformCapabilities } from "@/lib/data/platform";
import { Metadata } from 'next';
import { notFound } from "next/navigation";
import Link from "next/link";
import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckCircle2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  return platformCapabilities.map((cap) => ({
    slug: cap.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const capability = platformCapabilities.find(c => c.slug === slug);
  if (!capability) return { title: 'Capability Not Found' };
  
  return {
    title: `${capability.title} | CerebroHive Platform`,
    description: capability.summary,
  };
}

export default async function PlatformCapabilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const capability = platformCapabilities.find(c => c.slug === slug);

  if (!capability) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen pt-24 font-inter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": capability.title,
            "description": capability.summary,
            "articleSection": "Platform Architecture",
          })
        }}
      />
      {/* Unified Hero Section */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center z-10 border-b border-border text-center">
        <div className="absolute inset-0 bg-gradient-to-b opacity-50 from-primary-accent/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container-wide flex flex-col items-center relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Platform Capability</span>
           </div>
           
           <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
             {capability.title}
           </h1>
           
           <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
             {capability.hero.description}
           </p>

           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
              {capability.liveDemoUrl && (
                <Link
                  href={capability.liveDemoUrl}
                  className="w-full sm:w-auto px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-1 shadow-elevated flex items-center justify-center gap-2"
                >
                  <Cpu size={16} /> {capability.liveDemoLabel || "Try It Live"}
                </Link>
              )}
              <button className={cn(
                "w-full sm:w-auto px-8 py-4 font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-all",
                capability.liveDemoUrl
                  ? "bg-transparent border border-border text-text-primary hover:border-border-default hover:bg-surface"
                  : "bg-primary-accent text-text-primary hover:-translate-y-1 shadow-elevated"
              )}>
                Request Architecture Brief
              </button>
           </div>
           {capability.liveDemoUrl && (
             <p className="mt-4 text-xs text-text-muted max-w-md">
               Not a mockup — this links to a page in this site that runs the real, executing code for this capability.
             </p>
           )}
        </div>
      </section>

      {/* Overview & Features */}
      <section className="section-pad bg-surface-elevated">
        <div className="container-wide grid md:grid-cols-2 gap-16">
          <div>
            <SectionHeading label="Overview" title={capability.hero.subtitle} description={capability.summary} />
            
            <div className="mt-8 flex flex-wrap gap-2">
              {capability.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-background border border-border rounded-full text-xs font-bold text-text-primary">{tag}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-space font-bold text-text-primary mb-8 border-b border-border pb-4">Key Features</h3>
            <ul className="flex flex-col gap-4">
              {capability.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg shadow-sm">
                  <CheckCircle2 size={16} className="text-primary-accent" />
                  <span className="text-sm font-bold text-text-primary">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import React from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Sign In — CerebroHive",
  description: "Sign in to your CerebroHive account to access your enterprise AI workspace, dashboards, and learning progress.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-page text-primary">
      {/* LEFT: Auth Form Container */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-page z-10">
        <div className="w-full max-w-md relative">
          
          {/* Logo */}
          <div className="mb-12">
            <Link href="/" className="flex items-center gap-3 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                CerebroHive
              </span>
            </Link>
          </div>

          {/* Form Content */}
          <main className="w-full">
            {children}
          </main>
          
        </div>
      </div>

      {/* RIGHT: Knowledge Graph Visualization (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 relative bg-surface overflow-hidden border-l border-border/50 items-center justify-center">
        {/* Subtle Gradient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 max-w-lg p-12 text-center">
          {/* Semantic Network SVG Abstraction */}
          <div className="w-full aspect-square relative mb-12 opacity-80">
            <svg viewBox="0 0 400 400" className="w-full h-full animate-pulse-slow">
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
                  <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
                </linearGradient>
              </defs>
              
              {/* Edges */}
              <path d="M200,200 L100,100 M200,200 L300,80 M200,200 L320,250 M200,200 L120,300 M100,100 L300,80" 
                    stroke="url(#edgeGrad)" strokeWidth="1.5" fill="none" />
              
              {/* Nodes */}
              <circle cx="200" cy="200" r="16" fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2" />
              <circle cx="100" cy="100" r="8" fill="#a855f7" />
              <circle cx="300" cy="80" r="10" fill="#6366f1" />
              <circle cx="320" cy="250" r="12" fill="#ec4899" />
              <circle cx="120" cy="300" r="8" fill="#8b5cf6" />
              
              {/* Orbiting particles (CSS animation could be applied here) */}
              <circle cx="250" cy="140" r="3" fill="#fff" className="animate-ping" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-semibold mb-4 text-white">Unlock Enterprise AI</h2>
          <p className="text-muted text-lg leading-relaxed">
            Ingest thousands of research papers, extract semantic knowledge graphs, and query your institution's data with pinpoint accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}

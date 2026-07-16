"use client";

import React from "react";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export default function CompanyCTA() {
  return (
    <section className="py-32 border-b border-border bg-accent-primary relative overflow-hidden">
      
      {/* Abstract Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="container-wide relative z-10">
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary mb-8 tracking-tighter leading-none">
            Build the Future of Enterprise AI Together.
          </h2>
          <p className="text-xl md:text-2xl text-black/70 max-w-2xl mx-auto font-inter font-medium mb-12">
            Whether you are an enterprise looking to transform your architecture, or an engineer looking to solve the hardest problems in AI—we should talk.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-surface text-text-primary rounded-full font-space font-bold text-lg hover:bg-overlay transition-colors flex items-center gap-3 w-full sm:w-auto justify-center group"
            >
              Partner with CerebroHive
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/careers" 
              className="px-8 py-4 bg-transparent border-2 border-border-default text-text-primary rounded-full font-space font-bold text-lg hover:bg-black/5 transition-colors flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              View Open Roles
            </Link>
          </div>
          
        </div>

      </div>
    </section>
  );
}

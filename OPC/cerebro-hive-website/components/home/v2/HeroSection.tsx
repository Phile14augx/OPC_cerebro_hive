"use client";

import React, { useRef } from "react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import dynamic from "next/dynamic";

// Dynamically import the 3D scene to avoid SSR issues and improve initial load performance
const Scene = dynamic(() => import("./Scene").then(mod => mod.Scene), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-primary animate-pulse" />
});

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden"
    >
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container-wide flex flex-col items-center text-center mt-20 pointer-events-none">
        
        <h1 className="font-space text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-text-primary max-w-5xl leading-[1.1] mb-8">
          Engineering the Next Generation <br className="hidden md:block" />
          of Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-secondary-accent">Enterprises</span>
        </h1>

        <p className="font-inter text-lg md:text-xl lg:text-2xl text-text-muted max-w-3xl mb-12 font-light">
          We architect enterprise AI systems, build production software, deploy intelligent agents, and transform businesses through AI-native engineering.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 pointer-events-auto">
          <AnimatedButton variant="primary" size="lg">
            Book Strategy Session
          </AnimatedButton>
          <AnimatedButton variant="outline" size="lg">
            Explore Our Work
          </AnimatedButton>
        </div>
      </div>
      
      {/* Subtle bottom gradient for smooth transition */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
}

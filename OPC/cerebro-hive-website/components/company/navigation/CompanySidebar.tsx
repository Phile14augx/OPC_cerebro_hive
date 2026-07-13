"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const sections = [
  { id: "hero", label: "Overview" },
  { id: "ceo-letter", label: "CEO Letter" },
  { id: "vision", label: "Vision & Mission" },
  { id: "story", label: "Our Story" },
  { id: "culture", label: "Culture Code" },
  { id: "leadership", label: "Leadership" },
  { id: "org-chart", label: "Structure" },
  { id: "metrics", label: "Metrics" },
  { id: "ecosystem", label: "Ecosystem" },
  { id: "presence", label: "Global Presence" }
];

export const CompanySidebar = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Scroll progress calculator
    const calculateProgress = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", calculateProgress);
    calculateProgress(); // init

    // Intersection observer for active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" } // trigger when element is roughly in middle of viewport
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      window.removeEventListener("scroll", calculateProgress);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80; // height of the main navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: "smooth"
      });
    }
  };

  return (
    <nav className="hidden lg:block w-72 shrink-0 sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto pl-4 border-r border-border/40 pr-6">
      
      <div className="mb-10 pl-4">
        <div className="text-[9px] font-space font-bold uppercase tracking-[0.2em] text-primary-accent mb-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse" />
          Live Document
        </div>
        <h3 className="text-xs font-space font-bold uppercase tracking-widest text-text-secondary">
          Corporate Handbook
        </h3>
        <span className="text-[10px] text-text-muted font-mono mt-1 block">v2026.1.4</span>
      </div>

      <div className="relative">
        {/* Static Background Track */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-border" />
        
        {/* Dynamic Reading Progress Fill */}
        <div 
          className="absolute left-[7px] top-2 w-[2px] bg-primary-accent shadow-[0_0_8px_rgba(0,245,122,0.6)] transition-all duration-150 ease-out"
          style={{ height: `calc(${scrollProgress}% - 16px)`, maxHeight: "calc(100% - 16px)" }}
        />

        <ul className="flex flex-col gap-1 relative z-10">
          {sections.map(({ id, label }, index) => {
            const isActive = activeSection === id;
            const number = (index + 1).toString().padStart(2, '0');
            
            return (
              <li key={id} className="relative group">
                <button
                  onClick={() => scrollToSection(id)}
                  className={cn(
                    "w-full text-left py-2.5 pl-6 flex items-center gap-3 transition-all duration-300 group-hover:translate-x-1",
                    isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-mono transition-colors duration-300",
                    isActive ? "text-primary-accent font-bold" : "text-text-muted"
                  )}>
                    {number}
                  </span>
                  <span className={cn(
                    "text-sm font-space transition-colors duration-300",
                    isActive ? "text-text-primary font-bold shadow-primary-accent" : "text-text-secondary"
                  )} style={{ textShadow: isActive ? "0 0 12px rgba(0,245,122,0.3)" : "none" }}>
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

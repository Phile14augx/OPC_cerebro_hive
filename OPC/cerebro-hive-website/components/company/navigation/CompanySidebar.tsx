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

  useEffect(() => {
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

    return () => observer.disconnect();
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
    <nav className="hidden lg:block w-64 shrink-0 sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto pl-4">
      <h3 className="text-xs font-space font-bold uppercase tracking-widest text-text-muted mb-6 pl-4 border-l border-border">
        Corporate Index
      </h3>
      <ul className="flex flex-col relative">
        {sections.map(({ id, label }) => {
          const isActive = activeSection === id;
          
          return (
            <li key={id} className="relative">
              {/* Animated active indicator line */}
              {isActive && (
                <motion.div 
                  layoutId="activeCompanySection"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-accent"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Inactive line (base) */}
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border" />
              
              <button
                onClick={() => scrollToSection(id)}
                className={cn(
                  "w-full text-left py-2.5 pl-5 text-sm font-space transition-colors duration-200",
                  isActive 
                    ? "text-primary-accent font-bold" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

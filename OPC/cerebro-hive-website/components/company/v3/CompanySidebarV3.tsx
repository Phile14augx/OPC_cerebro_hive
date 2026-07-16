"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const chapters = [
  { id: "chapter-1", label: "Why We Exist" },
  { id: "chapter-2", label: "How We Think" },
  { id: "chapter-3", label: "How We Build" },
  { id: "chapter-4", label: "Who We Are" },
  { id: "chapter-5", label: "Where We're Going" },
  { id: "chapter-6", label: "Join the Journey" },
];

export function CompanySidebarV3() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    chapters.forEach((chapter) => {
      const el = document.getElementById(chapter.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <aside className="hidden lg:block w-72 shrink-0 border-r border-border bg-background">
      <div className="sticky top-24 px-8 py-12">
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-8">Table of Contents</h4>
        <nav className="flex flex-col gap-4 relative">
          
          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-surface z-0" />

          {chapters.map((chapter, i) => {
            const isActive = activeId === chapter.id || (!activeId && i === 0);
            return (
              <button
                key={chapter.id}
                onClick={() => scrollTo(chapter.id)}
                className="group flex items-center gap-4 text-left relative z-10"
              >
                <div className={cn(
                  "w-3 h-3 rounded-full border-2 bg-background transition-colors",
                  isActive ? "border-primary-accent" : "border-border group-hover:border-border-default"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-colors",
                  isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                )}>
                  {chapter.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  BookOpen, AlignLeft, Hexagon, Target, Book, 
  Users, Briefcase, Activity, Globe2, ChevronRight, CheckCircle2, Circle
} from "lucide-react";

const chapters = [
  { id: "hero", label: "Introduction", icon: <BookOpen size={16} /> },
  { id: "vision", label: "Corporate Purpose", icon: <Target size={16} /> },
  { id: "story", label: "Our Story", icon: <Book size={16} /> },
  { id: "culture", label: "Culture Code", icon: <Users size={16} /> },
  { id: "leadership", label: "Leadership", icon: <Briefcase size={16} /> },
  { id: "org-chart", label: "Structure", icon: <Hexagon size={16} /> },
  { id: "metrics", label: "Metrics", icon: <Activity size={16} /> },
  { id: "presence", label: "Global Presence", icon: <Globe2 size={16} /> }
];

export const CompanySidebar = () => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [explorerMode, setExplorerMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroElement = document.getElementById("hero");
      if (heroElement) {
        setIsScrolledPastHero(window.scrollY > heroElement.offsetHeight * 0.8);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // init

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = chapters.findIndex(c => c.id === entry.target.id);
            if (index !== -1) setActiveChapterIndex(index);
          }
        });
      },
      { rootMargin: "-30% 0px -70% 0px" }
    );

    chapters.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToChapter = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: "smooth"
      });
    }
  };

  const isCollapsed = isScrolledPastHero && !isHovered && !explorerMode;

  return (
    <motion.nav 
      animate={{ width: isCollapsed ? 80 : 320 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden lg:flex flex-col shrink-0 sticky top-[80px] h-[calc(100vh-80px)] bg-[#030608]/95 backdrop-blur-xl border-r border-white/5 z-40 overflow-hidden"
    >
      
      {/* Header */}
      <div className={cn("p-6 pb-4 whitespace-nowrap transition-opacity duration-300", isCollapsed ? "opacity-0" : "opacity-100")}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-space font-bold uppercase tracking-widest text-text-muted">
            <AlignLeft size={14} /> Corporate Handbook
          </div>
        </div>

        {/* Story Mode / Explorer Mode Toggle */}
        <div className="flex bg-[#0a0d14] border border-white/5 rounded-lg p-1 mb-8">
          <button 
            onClick={() => setExplorerMode(false)} 
            className={cn("flex-1 text-[10px] font-space font-bold uppercase tracking-widest py-1.5 rounded-md transition-colors", !explorerMode ? "bg-white/10 text-white" : "text-text-muted hover:text-white")}
          >
            Story
          </button>
          <button 
            onClick={() => setExplorerMode(true)} 
            className={cn("flex-1 text-[10px] font-space font-bold uppercase tracking-widest py-1.5 rounded-md transition-colors", explorerMode ? "bg-white/10 text-white" : "text-text-muted hover:text-white")}
          >
            Explorer
          </button>
        </div>
      </div>

      {/* Collapsed Header Icon (visible when collapsed) */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 left-0 right-0 flex justify-center text-text-muted"
          >
            <AlignLeft size={20} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapters */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar mt-12 lg:mt-0">
        <ul className="flex flex-col gap-1 relative z-10">
          {chapters.map((chapter, index) => {
            const isCurrent = activeChapterIndex === index;
            const isCompleted = index < activeChapterIndex;
            const isUpcoming = index > activeChapterIndex;
            
            return (
              <li key={chapter.id} className="relative group">
                {/* Active Highlight Background */}
                <AnimatePresence>
                  {isCurrent && !isCollapsed && (
                    <motion.div 
                      layoutId="activeChapterBg"
                      className="absolute inset-0 bg-white/5 rounded-lg z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                <button
                  onClick={() => scrollToChapter(chapter.id)}
                  className={cn(
                    "relative z-10 w-full text-left py-2.5 px-3 rounded-lg flex items-center transition-all duration-200",
                    isCurrent ? "translate-x-1" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 flex items-center justify-center w-6 h-6 transition-colors duration-300",
                    isCurrent ? "text-primary-accent" : (isCompleted ? "text-text-muted" : "text-text-muted/50")
                  )}>
                    {!isCollapsed ? (
                      isCurrent ? <Circle fill="currentColor" size={10} className="animate-pulse" /> :
                      isCompleted ? <CheckCircle2 size={12} /> : 
                      <Circle size={10} />
                    ) : (
                      <div className={cn("transition-colors", isCurrent ? "text-primary-accent" : "text-text-muted hover:text-white")}>
                        {chapter.icon}
                      </div>
                    )}
                  </div>

                  <span className={cn(
                    "ml-3 text-sm font-space whitespace-nowrap transition-all duration-300",
                    isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                    isCurrent ? "text-white font-bold" : "text-text-secondary group-hover:text-white"
                  )}>
                    {chapter.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Metrics */}
      <div className={cn("p-6 pt-4 border-t border-border/40 whitespace-nowrap transition-opacity duration-300", isCollapsed ? "opacity-0" : "opacity-100")}>
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="block text-[10px] font-mono text-text-muted uppercase mb-1">Progress</span>
            <span className="block text-sm font-space font-bold text-white">Chapter {activeChapterIndex + 1} / {chapters.length}</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-mono text-text-muted uppercase mb-1">Est. Time</span>
            <span className="block text-sm font-space font-bold text-white">12 min remaining</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-[#0a0d14] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((activeChapterIndex + 1) / chapters.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.nav>
  );
};

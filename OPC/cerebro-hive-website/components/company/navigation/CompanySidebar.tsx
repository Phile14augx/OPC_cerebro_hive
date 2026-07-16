"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  BookOpen, AlignLeft, Hexagon, Target, Book, 
  Users, Briefcase, Activity, Globe2, ChevronRight, ChevronDown, CheckCircle2, Circle, Search,
  Workflow, History, LayoutGrid, FileText
} from "lucide-react";
import { NeuralOrb } from "@/components/ui/NeuralOrb";

// ============================================================================
// STORY MODE DATA
// ============================================================================
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

// ============================================================================
// EXPLORER MODE DATA (Nested Workspace)
// ============================================================================
type ExplorerNode = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  metadata?: string;
  children?: ExplorerNode[];
};

const explorerTree: ExplorerNode[] = [
  {
    id: "folder-core",
    label: "Core Identity",
    icon: <Target size={14} />,
    children: [
      { id: "company-purpose", label: "Corporate Purpose", metadata: "3 min" },
      { id: "vision", label: "Vision" },
      { id: "mission", label: "Mission" },
      { id: "culture-code", label: "Culture Code", metadata: "Values" },
    ]
  },
  {
    id: "folder-org",
    label: "Organization",
    icon: <Users size={14} />,
    children: [
      { id: "org-chart", label: "Neural Org Chart", metadata: "Interactive" },
      { 
        id: "leadership", 
        label: "Executive Leadership", 
        children: [
          { id: "leadership-ceo", label: "Philemon V Nath", metadata: "CEO" },
          { id: "leadership-cto", label: "Marcus Thorne", metadata: "CTO" },
          { id: "leadership-vp", label: "Elena Rodriguez", metadata: "VP" },
        ]
      },
      { id: "presence", label: "Global Presence" }
    ]
  },
  {
    id: "folder-ops",
    label: "Operations & Engineering",
    icon: <Workflow size={14} />,
    children: [
      { 
        id: "engineering", 
        label: "Engineering Framework", 
        children: [
          { id: "engineering-foundation", label: "Phase 1: Foundation" },
          { id: "engineering-intelligence", label: "Phase 2: Intelligence" },
          { id: "engineering-operations", label: "Phase 3: Operations" },
          { id: "engineering-scale", label: "Phase 4: Scale" },
        ]
      },
      { id: "ecosystem", label: "Tech Ecosystem" },
      { id: "trust-center", label: "Enterprise Trust", metadata: "Security" }
    ]
  },
  {
    id: "folder-metrics",
    label: "Metrics & History",
    icon: <Activity size={14} />,
    children: [
      { id: "timeline", label: "The Journey", metadata: "History" },
      { id: "metrics", label: "Key Impact Metrics" },
      { id: "careers", label: "Open Roles", metadata: "Hiring" }
    ]
  }
];

// Helper to flatten tree for intersection observer and search
const flattenTree = (nodes: ExplorerNode[], result: string[] = []) => {
  nodes.forEach(node => {
    if (!node.children) result.push(node.id);
    if (node.children) flattenTree(node.children, result);
  });
  return result;
};

const allExplorerIds = flattenTree(explorerTree);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const CompanySidebar = () => {
  // Shared State
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [explorerMode, setExplorerMode] = useState(false);
  
  // Story Mode State
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Explorer Mode State
  const [activeExplorerId, setActiveExplorerId] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["folder-core", "folder-org"]));
  const [searchQuery, setSearchQuery] = useState("");
  
  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setExplorerMode(true);
        setTimeout(() => document.getElementById("explorer-search")?.focus(), 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ScrollSpy (Intersection Observer)
  useEffect(() => {
    const handleScroll = () => {
      const heroElement = document.getElementById("hero");
      if (heroElement) setIsScrolledPastHero(window.scrollY > heroElement.offsetHeight * 0.8);
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        // Find all intersecting entries
        const intersecting = entries.filter(e => e.isIntersecting);
        if (intersecting.length === 0) return;

        // Sort by how close they are to the top of the viewport
        intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        
        const targetId = intersecting[0].target.id;

        // 1. Update Story Mode
        const chapterIndex = chapters.findIndex(c => c.id === targetId);
        if (chapterIndex !== -1) setActiveChapterIndex(chapterIndex);

        // 2. Update Explorer Mode
        if (allExplorerIds.includes(targetId)) {
          setActiveExplorerId(targetId);
          
          // Auto-expand parent folders of the active node
          const newExpanded = new Set(expandedFolders);
          let modified = false;

          const findAndExpandParents = (nodes: ExplorerNode[], currentPath: string[]) => {
            for (const node of nodes) {
              if (node.id === targetId) {
                currentPath.forEach(p => { if (!newExpanded.has(p)) { newExpanded.add(p); modified = true; } });
                return true;
              }
              if (node.children) {
                if (findAndExpandParents(node.children, [...currentPath, node.id])) return true;
              }
            }
            return false;
          };
          findAndExpandParents(explorerTree, []);
          
          if (modified) setExpandedFolders(newExpanded);
          
          // Update URL Hash silently
          if (explorerMode) {
             window.history.replaceState(null, '', `#${targetId}`);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" } // Detect elements in the upper-middle third of the screen
    );

    // Observe all possible elements
    const elementsToObserve = new Set([...chapters.map(c => c.id), ...allExplorerIds]);
    elementsToObserve.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [expandedFolders, explorerMode]); // Dependency on expandedFolders needed for accurate Set updates inside observer

  // Smooth Scroll
  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - navOffset, behavior: "smooth" });
    }
  };

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedFolders(newExpanded);
  };

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return explorerTree;
    const query = searchQuery.toLowerCase();

    const filterNodes = (nodes: ExplorerNode[]): ExplorerNode[] => {
      return nodes.map(node => {
        const matchesQuery = node.label.toLowerCase().includes(query) || (node.metadata?.toLowerCase().includes(query));
        if (node.children) {
          const filteredChildren = filterNodes(node.children);
          if (matchesQuery || filteredChildren.length > 0) {
            // Force expand matching folders
            if (!expandedFolders.has(node.id)) {
              setExpandedFolders(prev => new Set(prev).add(node.id));
            }
            return { ...node, children: filteredChildren };
          }
        }
        return matchesQuery ? node : null;
      }).filter(Boolean) as ExplorerNode[];
    };

    return filterNodes(explorerTree);
  }, [searchQuery, explorerTree]);


  const isCollapsed = isScrolledPastHero && !isHovered && !explorerMode;

  // ============================================================================
  // RENDER: EXPLORER NODE (Recursive)
  // ============================================================================
  const renderExplorerNode = (node: ExplorerNode, depth = 0) => {
    const isFolder = !!node.children;
    const isExpanded = expandedFolders.has(node.id);
    const isActive = activeExplorerId === node.id;
    
    return (
      <div key={node.id} className="w-full">
        <button
          onClick={() => isFolder ? toggleFolder(node.id) : scrollToId(node.id)}
          className={cn(
            "w-full flex items-center justify-between text-left py-1.5 px-2 rounded-md transition-all duration-200 group relative",
            isActive ? "bg-primary-accent/10" : "hover:bg-white/[0.04]",
            depth === 0 ? "mt-3 first:mt-0" : ""
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {/* Active left border indicator */}
          {isActive && (
            <motion.div layoutId="activeExplorerIndicator" className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-accent rounded-full" />
          )}

          <div className="flex items-center gap-2 overflow-hidden">
            {/* Icon / Chevron */}
            <div className={cn("shrink-0 transition-colors", isActive ? "text-primary-accent" : "text-text-muted group-hover:text-white")}>
              {isFolder ? (
                <ChevronRight size={14} className={cn("transition-transform duration-200", isExpanded && "rotate-90")} />
              ) : (
                node.icon ? node.icon : <FileText size={12} className="opacity-50" />
              )}
            </div>
            
            {/* Label */}
            <span className={cn(
              "text-[11px] font-space truncate transition-colors",
              isActive ? "text-text-primary font-bold" : (depth === 0 ? "text-text-secondary font-bold tracking-widest uppercase text-[10px]" : "text-text-secondary group-hover:text-white")
            )}>
              {node.label}
            </span>
          </div>

          {/* Metadata Badge */}
          {node.metadata && !isFolder && (
            <span className={cn(
              "shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors",
              isActive ? "bg-primary-accent/20 text-primary-accent" : "bg-white/5 text-text-muted"
            )}>
              {node.metadata}
            </span>
          )}
        </button>

        {/* Children (Animated) */}
        <AnimatePresence>
          {isFolder && isExpanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-l border-border ml-[14px] mt-0.5"
            >
              {node.children.map(child => renderExplorerNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.nav 
      animate={{ width: isCollapsed ? 80 : 340 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden lg:flex flex-col shrink-0 sticky top-[80px] h-[calc(100vh-80px)] bg-background/95 backdrop-blur-xl border-r border-border z-40 overflow-hidden"
    >
      
      {/* ====================================================================
          HEADER & TOGGLE
          ==================================================================== */}
      <div className={cn("p-6 pb-2 whitespace-nowrap transition-opacity duration-300", isCollapsed ? "opacity-0" : "opacity-100")}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-space font-bold uppercase tracking-widest text-text-muted">
            <LayoutGrid size={14} /> Corporate Handbook
          </div>
        </div>

        {/* Story Mode / Explorer Mode Toggle */}
        <div className="flex bg-surface-elevated border border-border rounded-lg p-1 mb-4 relative z-10">
          <button 
            onClick={() => setExplorerMode(false)} 
            className={cn("flex-1 text-[10px] font-space font-bold uppercase tracking-widest py-1.5 rounded-md transition-colors relative", !explorerMode ? "text-text-primary" : "text-text-muted hover:text-white")}
          >
            {!explorerMode && <motion.div layoutId="modeToggle" className="absolute inset-0 bg-white/10 rounded-md" />}
            <span className="relative z-10">Story</span>
          </button>
          <button 
            onClick={() => setExplorerMode(true)} 
            className={cn("flex-1 text-[10px] font-space font-bold uppercase tracking-widest py-1.5 rounded-md transition-colors relative", explorerMode ? "text-text-primary" : "text-text-muted hover:text-white")}
          >
            {explorerMode && <motion.div layoutId="modeToggle" className="absolute inset-0 bg-white/10 rounded-md" />}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              Explorer <span className="hidden xl:inline-block text-[8px] font-mono bg-white/10 px-1 rounded opacity-50">⌘K</span>
            </span>
          </button>
        </div>
        
        {/* Explorer Search Bar */}
        <AnimatePresence>
          {explorerMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="relative overflow-hidden"
            >
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                id="explorer-search"
                type="text" 
                placeholder="Search handbook..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#05080c] border border-border rounded-lg py-2 pl-8 pr-3 text-xs font-inter text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapsed Header Icon */}
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

      {/* ====================================================================
          BODY CONTENT
          ==================================================================== */}
      <div className="flex-1 overflow-y-auto px-4 pb-12 custom-scrollbar">
        <div className="relative z-10 w-full">
          
          {/* STORY MODE */}
          {!explorerMode && (
            <ul className="flex flex-col gap-1 w-full">
              {chapters.map((chapter, index) => {
                const isCurrent = activeChapterIndex === index;
                const isCompleted = index < activeChapterIndex;
                
                return (
                  <li key={chapter.id} className="relative group w-full">
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
                      onClick={() => scrollToId(chapter.id)}
                      className={cn(
                        "relative z-10 w-full text-left py-2.5 px-3 rounded-lg flex items-center transition-all duration-200 overflow-hidden",
                        isCurrent ? "translate-x-1" : "hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                        {!isCollapsed ? (
                          <NeuralOrb 
                            size="sm" 
                            color="cyan" 
                            state={isCurrent ? "active" : isCompleted ? "completed" : "upcoming"} 
                          />
                        ) : (
                          <div className={cn("transition-colors", isCurrent ? "text-primary-accent" : "text-text-muted hover:text-white")}>
                            {chapter.icon}
                          </div>
                        )}
                      </div>

                      <span className={cn(
                        "ml-3 text-sm font-space whitespace-nowrap transition-all duration-300",
                        isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                        isCurrent ? "text-text-primary font-bold" : "text-text-secondary group-hover:text-white"
                      )}>
                        {chapter.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* EXPLORER MODE */}
          {explorerMode && (
            <div className={cn("w-full transition-opacity duration-300 flex flex-col gap-1", isCollapsed && "opacity-0 pointer-events-none")}>
              {filteredTree.length > 0 ? (
                filteredTree.map(node => renderExplorerNode(node))
              ) : (
                <div className="text-center py-8 text-xs font-inter text-text-muted">
                  No matches found.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ====================================================================
          FOOTER METRICS (Story Mode Only)
          ==================================================================== */}
      <AnimatePresence>
        {!explorerMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn("p-6 pt-4 border-t border-border/40 whitespace-nowrap transition-opacity duration-300", isCollapsed ? "opacity-0" : "opacity-100")}
          >
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="block text-[10px] font-mono text-text-muted uppercase mb-1">Progress</span>
                <span className="block text-sm font-space font-bold text-text-primary">Chapter {activeChapterIndex + 1} / {chapters.length}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-mono text-text-muted uppercase mb-1">Est. Time</span>
                <span className="block text-sm font-space font-bold text-text-primary">12 min remaining</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1 bg-surface-elevated rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary-accent"
                initial={{ width: 0 }}
                animate={{ width: `${((activeChapterIndex + 1) / chapters.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
};

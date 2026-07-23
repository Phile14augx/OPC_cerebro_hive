"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { platformNavigation, forgeNavigation } from "../navigation";
import {
  Building2, ChevronDown, ChevronRight, Pin, PanelLeftClose, PanelLeft, Star, Hammer
} from "lucide-react";
import { cn } from "./ui/utils";
import { useSidebar } from "./SidebarContext";

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [forgeOpen, setForgeOpen] = useState(false);

  const isForgeActive = pathname.startsWith("/app/forge");

  // Group items by their section to match the new 10/10 hierarchy
  const sections = [
    { title: "Workspace", items: platformNavigation.find(g => g.title === "Workspace")?.items || [] },
    { title: "AI Platform", items: platformNavigation.find(g => g.title === "AI")?.items || [] },
    { title: "Infrastructure", items: platformNavigation.find(g => g.title === "Infrastructure")?.items || [] },
    { title: "Data & Security", items: [
      ...(platformNavigation.find(g => g.title === "Data")?.items || []),
      ...(platformNavigation.find(g => g.title === "Security")?.items || [])
    ]},
    { title: "Talent OS", items: platformNavigation.find(g => g.title === "Talent OS")?.items || [] },
    { title: "Explore", items: platformNavigation.find(g => g.title === "Solutions")?.items || [] }
  ];

  const pinnedFavorites = [
    { title: "AI Studio", href: "/app/ai/studio", icon: platformNavigation.find(g => g.title === "AI")?.items.find(i => i.title === "AI Studio")?.icon },
    { title: "Workflows", href: "/app/automation/workflows", icon: platformNavigation.find(g => g.title === "Automation")?.items[0]?.icon },
    { title: "Knowledge Hub", href: "/app/ai/knowledge", icon: platformNavigation.find(g => g.title === "AI")?.items.find(i => i.title === "Knowledge Hub")?.icon },
  ];

  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 h-screen bg-background border-r border-border flex flex-col transition-all duration-300 z-40 hidden lg:flex",
        isCollapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      {/* Header & Collapse Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <Link href="/app" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-accent text-background flex items-center justify-center font-bold text-lg">
            H
          </div>
          {!isCollapsed && <span className="font-space font-bold text-lg text-text-primary">HivePulse</span>}
        </Link>
        <button 
          onClick={toggleCollapse}
          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-md transition-colors"
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden flex flex-col">
        {/* Workspace Switcher */}
        <div className="p-3">
          <button 
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-xl border border-transparent hover:bg-surface hover:border-border transition-all text-left",
              isCollapsed && "justify-center p-2"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-text-primary" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary leading-tight">CerebroHive</span>
                  <span className="text-xs text-text-secondary leading-tight">Production</span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown size={14} className={cn("text-text-muted transition-transform", workspaceOpen && "rotate-180")} />
            )}
          </button>
          
          {!isCollapsed && workspaceOpen && (
            <div className="mt-2 ml-4 pl-4 border-l border-border space-y-1">
              <button className="w-full text-left text-sm px-2 py-1.5 text-text-secondary hover:text-primary-accent rounded-md transition-colors">Development</button>
              <button className="w-full text-left text-sm px-2 py-1.5 text-text-secondary hover:text-primary-accent rounded-md transition-colors">Research</button>
              <button className="w-full text-left text-sm px-2 py-1.5 text-text-secondary hover:text-primary-accent rounded-md transition-colors">Personal</button>
            </div>
          )}
        </div>

        {/* Pinned Favorites */}
        <div className="px-3 py-2">
          {!isCollapsed && (
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted px-2 mb-2 flex items-center gap-2">
              <Star size={12} /> Pinned
            </h4>
          )}
          <div className="space-y-1">
            {pinnedFavorites.map((fav, i) => (
              <Link 
                key={i} 
                href={fav.href}
                title={isCollapsed ? fav.title : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg text-sm transition-colors group relative",
                  pathname === fav.href ? "bg-primary-accent/10 text-primary-accent font-bold" : "text-text-secondary hover:bg-surface hover:text-text-primary",
                  isCollapsed ? "justify-center p-2" : "px-3 py-2"
                )}
              >
                {fav.icon && <fav.icon size={20} className={cn(
                  "shrink-0 transition-colors", 
                  pathname === fav.href ? "text-primary-accent" : "text-text-muted group-hover:text-text-primary"
                )} />}
                {!isCollapsed && <span>{fav.title}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* CerebroForge™ — AI Software Factory */}
        <div className="px-3 py-3 border-t border-border/50">
          <button
            onClick={() => setForgeOpen(prev => !prev)}
            title={isCollapsed ? "CerebroForge" : undefined}
            className={cn(
              "w-full flex items-center justify-between rounded-lg text-sm transition-colors group border",
              isForgeActive
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold"
                : "text-text-secondary hover:bg-surface hover:text-text-primary border-transparent",
              isCollapsed ? "justify-center p-2.5" : "px-3 py-2"
            )}
          >
            <div className="flex items-center gap-3">
              <Hammer size={20} className={cn("shrink-0", isForgeActive ? "text-amber-400" : "text-text-muted group-hover:text-text-primary")} />
              {!isCollapsed && <span className="font-bold">CerebroForge™</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown size={14} className={cn("text-text-muted transition-transform", (forgeOpen || isForgeActive) && "rotate-180")} />
            )}
          </button>

          {!isCollapsed && (forgeOpen || isForgeActive) && (
            <div className="mt-1 space-y-0.5">
              {forgeNavigation.items.map((item, i) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={i}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg text-sm transition-colors group px-3 py-1.5 border",
                      isActive
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold"
                        : "text-text-secondary hover:bg-surface hover:text-text-primary border-transparent"
                    )}
                  >
                    {item.icon && (
                      <item.icon size={16} className={cn("shrink-0", isActive ? "text-amber-400" : "text-text-muted group-hover:text-text-primary")} />
                    )}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        {sections.map((section, idx) => (
          section.items.length > 0 && (
            <div key={idx} className="px-3 py-3 border-t border-border/50">
              {!isCollapsed && (
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted px-2 mb-2">
                  {section.title}
                </h4>
              )}
              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      title={isCollapsed ? item.title : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg text-sm transition-colors group",
                        isActive ? "bg-surface-elevated text-text-primary font-bold shadow-sm border border-border" : "text-text-secondary hover:bg-surface hover:text-text-primary border border-transparent",
                        isCollapsed ? "justify-center p-2.5" : "px-3 py-2"
                      )}
                    >
                      {item.icon && (
                        <item.icon 
                          size={20} 
                          className={cn(
                            "shrink-0 transition-colors",
                            isActive ? "text-primary-accent" : "text-text-muted group-hover:text-text-primary"
                          )}
                        />
                      )}
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>
    </aside>
  );
}

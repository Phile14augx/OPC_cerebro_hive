"use client";

import React, { useState, useMemo } from "react";
import * as Icons from "@/components/ui/icons";
import { iconRegistry, IconSize, IconVariant, IconAnimation } from "@/components/ui/icons";

export function IconShowcase() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [size, setSize] = useState<IconSize>(32);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [variant, setVariant] = useState<IconVariant>("duotone");
  const [animation, setAnimation] = useState<IconAnimation>("idle");
  const [bg, setBg] = useState<"light" | "dark" | "glass">("light");

  const categories = ["All", ...new Set(Object.values(iconRegistry).map(i => i.category))];

  const filteredIcons = useMemo(() => {
    return Object.values(iconRegistry).filter(meta => {
      const matchesSearch = meta.name.toLowerCase().includes(search.toLowerCase()) || 
                            meta.keywords?.some(k => k.toLowerCase().includes(search.toLowerCase())) ||
                            meta.aliases?.some(a => a.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === "All" || meta.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const bgClasses = {
    light: "bg-white text-slate-900 border-slate-200",
    dark: "bg-slate-950 text-white border-slate-800",
    glass: "bg-slate-900/50 backdrop-blur-xl text-white border-white/10"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Controls */}
      <div className="flex flex-col gap-6 p-6 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-default)]">
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Search icons (e.g. database, ai)..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] focus:outline-none focus:border-[var(--primary-accent)]"
          />
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)]"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Size</label>
            <div className="flex gap-2">
              {[16, 20, 24, 32, 48, 64].map(s => (
                <button 
                  key={s} 
                  onClick={() => setSize(s as IconSize)}
                  className={`px-2 py-1 text-sm rounded ${size === s ? "bg-[var(--primary-accent)] text-white" : "bg-[var(--bg-surface)]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Stroke</label>
            <div className="flex gap-2">
              {[1.5, 2, 2.5].map(w => (
                <button 
                  key={w} 
                  onClick={() => setStrokeWidth(w)}
                  className={`px-3 py-1 text-sm rounded ${strokeWidth === w ? "bg-[var(--primary-accent)] text-white" : "bg-[var(--bg-surface)]"}`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as IconVariant)} className="w-full px-3 py-2 rounded bg-[var(--bg-surface)]">
              <option value="outline">Outline</option>
              <option value="duotone">Duotone</option>
              <option value="filled">Filled</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Animation</label>
            <select value={animation} onChange={(e) => setAnimation(e.target.value as IconAnimation)} className="w-full px-3 py-2 rounded bg-[var(--bg-surface)]">
              <option value="idle">Idle</option>
              <option value="hover">Hover</option>
              <option value="active">Active</option>
              <option value="loading">Loading / Spin</option>
              <option value="pulse">Pulse</option>
              <option value="glow">Glow</option>
              <option value="flow">Flow</option>
              <option value="rotate">Rotate</option>
              <option value="float">Float</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Preview Surface:</span>
          <div className="flex gap-2 p-1 bg-[var(--bg-surface)] rounded-lg">
            <button onClick={() => setBg("light")} className={`px-4 py-1 text-sm rounded-md \${bg === "light" ? "bg-white shadow" : "text-[var(--text-secondary)]"}`}>Light</button>
            <button onClick={() => setBg("dark")} className={`px-4 py-1 text-sm rounded-md \${bg === "dark" ? "bg-slate-900 text-white shadow" : "text-[var(--text-secondary)]"}`}>Dark</button>
            <button onClick={() => setBg("glass")} className={`px-4 py-1 text-sm rounded-md \${bg === "glass" ? "bg-gradient-to-r from-blue-500/20 to-emerald-500/20 shadow" : "text-[var(--text-secondary)]"}`}>Glass</button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className={`p-8 rounded-3xl min-h-[600px] border \${bgClasses[bg]}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
          {filteredIcons.map(meta => {
            const IconComponent = (Icons as any)[meta.name];
            if (!IconComponent) return null;

            return (
              <div 
                key={meta.name} 
                className="group relative flex flex-col items-center p-6 gap-4 rounded-2xl border border-transparent hover:border-current hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                onClick={() => copyToClipboard(`<Icons.${meta.name} size={${size}} variant="${variant}" />`)}
              >
                <IconComponent size={size} strokeWidth={strokeWidth} variant={variant} animation={animation} />
                <span className="text-xs font-medium text-center">{meta.name}</span>
                
                {/* Tooltip metadata */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-4 rounded-xl bg-slate-900 text-white text-xs w-48 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-2xl">
                  <p className="font-bold mb-1 text-emerald-400">{meta.name}</p>
                  <p className="mb-2">Category: {meta.category}</p>
                  {meta.keywords && meta.keywords.length > 0 && (
                    <p className="text-slate-400 line-clamp-2">Tags: {meta.keywords.join(", ")}</p>
                  )}
                  <p className="mt-3 text-[10px] text-slate-500 text-center">Click to copy JSX</p>
                </div>
              </div>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">
            No icons found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

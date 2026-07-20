'use client';

import React, { useState, useMemo } from 'react';
import { IconSearchEngine, SearchScore } from './searchEngine';
import { iconRegistry } from './IconRegistry';
import { IconMetadata } from './IconMetadata';
import { BaseIconProps } from './types';

// Assuming we dynamically import icons or render them via registry
export const IconSearch = ({ onSelect }: { onSelect?: (icon: IconMetadata) => void }) => {
  const [query, setQuery] = useState("");

  const engine = useMemo(() => new IconSearchEngine(iconRegistry), []);
  
  const results = useMemo(() => engine.search(query), [query, engine]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons by name, alias, keyword, industry, intent..."
          className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
        />
        {/* Placeholder for Search icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
          ⌘K
        </div>
      </div>
      
      <div className="bg-surface border border-border rounded-lg p-2 max-h-96 overflow-y-auto">
        {results.length === 0 ? (
          <div className="p-4 text-center text-text-muted">No icons found for "{query}"</div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {results.map((icon) => (
              <button
                key={icon.id}
                onClick={() => onSelect?.(icon)}
                className="flex flex-col items-center justify-center p-3 gap-2 rounded hover:bg-surface-elevated transition-colors border border-transparent hover:border-border"
                title={`${icon.displayName || icon.id} (Category: ${icon.category})`}
              >
                {/* Dynamically render icon here if Registry mapped Components, else just show ID */}
                <div className="w-6 h-6 bg-surface-elevated rounded animate-pulse" />
                <span className="text-[10px] text-text-secondary truncate w-full text-center">
                  {icon.displayName || icon.id}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

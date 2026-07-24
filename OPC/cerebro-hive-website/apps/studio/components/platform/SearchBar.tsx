"use client";

import React, { useRef, useEffect } from "react";

interface SearchBarProps {
  value:       string;
  onChange:    (value: string) => void;
  placeholder?: string;
  className?:   string;
  autoFocus?:   boolean;
}

export function SearchBar({ value, onChange, placeholder = "Search…", className = "", autoFocus }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <svg className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-500"
           viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="9" cy="9" r="6" />
        <path d="M15 15l-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 pl-9 pr-3 text-sm text-white
                   placeholder-neutral-600 outline-none transition-colors
                   focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 text-neutral-500 hover:text-neutral-300"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}
    </div>
  );
}

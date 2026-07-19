"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolved theme (or "dark" default when not yet mounted)
  const activeTheme = mounted ? (theme ?? "dark") : "dark";

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Laptop, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ];

  return (
    <div className="relative inline-flex items-center p-1 rounded-full bg-surface-elevated border border-border shadow-sm">
      {options.map((option) => {
        const isActive = activeTheme === option.value;
        const Icon = option.icon;
        
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              "relative z-10 flex items-center justify-center w-8 h-7 rounded-full text-text-secondary hover:text-text-primary transition-colors duration-300",
              isActive && "text-text-primary"
            )}
            title={option.label}
            aria-label={`Set theme to ${option.label}`}
          >
            <Icon size={14} />
            {isActive && (
              <motion.div
                layoutId="theme-active-indicator"
                className="absolute inset-0 bg-background border border-border rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            {isActive && (
              <motion.div
                layoutId="theme-glow-indicator"
                className="absolute inset-0 bg-primary-accent opacity-20 blur-sm rounded-full -z-20"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

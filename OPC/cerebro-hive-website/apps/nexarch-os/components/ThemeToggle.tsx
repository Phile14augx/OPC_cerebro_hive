"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, isTheme, type ThemeName } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const stored = window.localStorage.getItem("nexarch-theme");
    const next = isTheme(stored) ? stored : DEFAULT_THEME;
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  function toggle() {
    const next: ThemeName = theme === "mono" ? "terminal" : "mono";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("nexarch-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="border border-os-border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-os-muted"
    >
      {theme}
    </button>
  );
}

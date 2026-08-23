"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

/**
 * Forces dark theme while this component is mounted (i.e. on the company page).
 * Restores the previous theme when the user navigates away.
 */
export function ForceDarkTheme() {
  const { theme, setTheme } = useTheme();
  const previousTheme = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (theme === "dark") return;
    const oldTheme = theme;
    setTheme("dark");

    return () => {
      if (oldTheme && oldTheme !== "dark") {
        setTheme(oldTheme);
      }
    };
  }, [theme, setTheme]);

  return null;
}

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
    previousTheme.current = theme;
    setTheme("dark");

    return () => {
      // Restore when leaving the company page
      if (previousTheme.current && previousTheme.current !== "dark") {
        setTheme(previousTheme.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

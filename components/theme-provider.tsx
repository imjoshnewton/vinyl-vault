"use client";

import { useEffect } from "react";
import { themes } from "@/lib/themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply saved theme on mount
    const savedTheme = localStorage.getItem("vinyl-vault-theme") || "vintage";
    const theme = themes[savedTheme];
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });

    // Apply theme class
    root.classList.add(`theme-${savedTheme}`);
  }, []);

  return <>{children}</>;
}
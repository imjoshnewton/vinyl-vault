"use client";

import { useState, useEffect } from "react";
import { themes } from "@/lib/themes";

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>("vintage");

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("vinyl-vault-theme") || "vintage";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes[themeId];
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });

    // Apply theme class for font and pattern styles
    root.classList.remove(...Object.keys(themes).map(t => `theme-${t}`));
    root.classList.add(`theme-${themeId}`);
    
    // Store current theme
    setCurrentTheme(themeId);
    localStorage.setItem("vinyl-vault-theme", themeId);
  };

  return { currentTheme, applyTheme };
}
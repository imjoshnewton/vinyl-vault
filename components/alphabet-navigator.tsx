"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AlphabetNavigatorProps {
  onLetterClick: (letter: string) => void;
  availableLetters?: Set<string>;
  className?: string;
  currentSection?: string | null;
}

export default function AlphabetNavigator({ 
  onLetterClick, 
  availableLetters,
  className,
  currentSection 
}: AlphabetNavigatorProps) {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Generate A-Z array
  const alphabet = Array.from({ length: 26 }, (_, i) => 
    String.fromCharCode(65 + i)
  );
  
  // Add # for numbers/special characters
  const letters = ['#', ...alphabet];
  
  const handleTouch = (letter: string) => {
    if (!availableLetters || availableLetters.has(letter)) {
      setActiveLetter(letter);
      onLetterClick(letter);
      // Haptic feedback on mobile if available
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(10);
      }
    }
  };
  
  // Handle touch move to slide through letters
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element?.hasAttribute('data-letter')) {
      const letter = element.getAttribute('data-letter');
      if (letter && letter !== activeLetter) {
        handleTouch(letter);
      }
    }
  };
  
  // Update active letter when scrolling
  useEffect(() => {
    if (currentSection) {
      setActiveLetter(currentSection);
    }
  }, [currentSection]);

  return (
    <div 
      ref={navRef}
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 z-50 sm:hidden",
        "flex flex-col items-center py-1 pr-0.5",
        "select-none touch-none",
        className
      )}
      onTouchStart={() => setIsTouching(true)}
      onTouchEnd={() => {
        setIsTouching(false);
        setTimeout(() => setActiveLetter(null), 100);
      }}
      onTouchMove={handleTouchMove}
    >
      {/* Semi-transparent background for better visibility */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-l-lg -z-10" />
      
      {letters.map((letter) => {
        const isAvailable = !availableLetters || availableLetters.has(letter);
        const isActive = activeLetter === letter || currentSection === letter;
        
        return (
          <button
            key={letter}
            data-letter={letter}
            onClick={() => handleTouch(letter)}
            disabled={!isAvailable}
            className={cn(
              "w-6 h-4 flex items-center justify-center",
              "text-[11px] font-medium transition-all duration-100",
              "rounded-sm",
              isAvailable ? [
                "text-foreground/60 hover:text-foreground",
                "active:scale-125 active:bg-primary/20",
                isActive && "scale-110 text-primary font-bold bg-primary/10"
              ] : "text-muted-foreground/20 cursor-not-allowed",
              isTouching && isActive && "scale-125 bg-primary/30"
            )}
          >
            {letter}
          </button>
        );
      })}
      
      {/* Active letter indicator */}
      {activeLetter && isTouching && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-primary text-primary-foreground rounded-lg px-6 py-4 text-5xl font-bold shadow-2xl">
            {activeLetter}
          </div>
        </div>
      )}
    </div>
  );
}
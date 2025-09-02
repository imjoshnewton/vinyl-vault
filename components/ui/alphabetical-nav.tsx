"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AlphabeticalNavProps {
  letters?: string[]
  onLetterClick: (letter: string) => void
  activeLetter?: string
  className?: string
  disabled?: string[]
}

export function AlphabeticalNav({
  letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  onLetterClick,
  activeLetter,
  className,
  disabled = []
}: AlphabeticalNavProps) {
  const [touching, setTouching] = React.useState(false)
  const [currentLetter, setCurrentLetter] = React.useState<string | null>(null)
  const navRef = React.useRef<HTMLDivElement>(null)

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!navRef.current) return
    
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    
    if (element && element.hasAttribute("data-letter")) {
      const letter = element.getAttribute("data-letter")
      if (letter && letter !== currentLetter && !disabled.includes(letter)) {
        setCurrentLetter(letter)
        onLetterClick(letter)
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10)
        }
      }
    }
  }, [currentLetter, onLetterClick, disabled])

  const handleTouchStart = React.useCallback(() => {
    setTouching(true)
  }, [])

  const handleTouchEnd = React.useCallback(() => {
    setTouching(false)
    setCurrentLetter(null)
  }, [])

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 z-50",
        "flex flex-col items-center",
        "px-1 py-2",
        "select-none",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {letters.map((letter) => {
        const isDisabled = disabled.includes(letter)
        const isActive = activeLetter === letter
        const isTouching = touching && currentLetter === letter

        return (
          <button
            key={letter}
            data-letter={letter}
            onClick={() => !isDisabled && onLetterClick(letter)}
            disabled={isDisabled}
            className={cn(
              "w-5 h-5 text-[10px] font-medium",
              "flex items-center justify-center",
              "transition-all duration-100",
              "hover:scale-125 hover:bg-primary/10 rounded",
              isActive && "text-primary font-bold scale-110",
              isDisabled && "text-muted-foreground/30 cursor-not-allowed",
              isTouching && "scale-150 bg-primary/20",
              !isDisabled && !isActive && "text-muted-foreground"
            )}
            aria-label={`Jump to ${letter}`}
          >
            {letter}
          </button>
        )
      })}
    </nav>
  )
}
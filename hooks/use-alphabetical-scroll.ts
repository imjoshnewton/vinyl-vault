"use client"

import * as React from "react"

interface UseAlphabeticalScrollOptions {
  offset?: number
  behavior?: ScrollBehavior
}

export function useAlphabeticalScroll(options: UseAlphabeticalScrollOptions = {}) {
  const { offset = 80, behavior = "smooth" } = options
  const [activeLetter, setActiveLetter] = React.useState<string | null>(null)
  const [availableLetters, setAvailableLetters] = React.useState<string[]>([])

  const scrollToLetter = React.useCallback((letter: string) => {
    const element = document.querySelector(`[data-letter-section="${letter}"]`)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior })
      setActiveLetter(letter)
    }
  }, [offset, behavior])

  const scanForLetters = React.useCallback(() => {
    const sections = document.querySelectorAll("[data-letter-section]")
    const letters = new Set<string>()
    sections.forEach((section) => {
      const letter = section.getAttribute("data-letter-section")
      if (letter) letters.add(letter)
    })
    setAvailableLetters(Array.from(letters).sort())
  }, [])

  // Update active letter based on scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[data-letter-section]")
      let currentLetter = null

      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= offset + 10) {
          currentLetter = section.getAttribute("data-letter-section")
        } else {
          break
        }
      }

      if (currentLetter && currentLetter !== activeLetter) {
        setActiveLetter(currentLetter)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeLetter, offset])

  return {
    scrollToLetter,
    activeLetter,
    availableLetters,
    scanForLetters
  }
}
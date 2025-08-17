export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  extras?: {
    gradient?: string;
    pattern?: string;
    buttonStyle?: string;
  };
}

export const themes: Record<string, Theme> = {
  vintage: {
    id: "vintage",
    name: "Vintage",
    description: "Classic jazz lounge vibes",
    colors: {
      background: "25 40% 15%",
      foreground: "40 30% 95%",
      card: "30 35% 30%",
      cardForeground: "45 20% 85%",
      primary: "5 60% 25%",
      primaryForeground: "40 30% 90%",
      secondary: "50 40% 50%",
      secondaryForeground: "40 30% 90%",
      muted: "85 25% 45%",
      mutedForeground: "40 30% 85%",
      accent: "40 60% 30%",
      accentForeground: "40 30% 90%",
      border: "25 30% 20%",
    },
    fonts: {
      heading: "Righteous",
      body: "Inter",
    },
    extras: {
      buttonStyle: "retro-button",
      gradient: "from-amber-50 to-orange-50",
    },
  },
  
  fifties: {
    id: "fifties",
    name: "1950s Diner",
    description: "Chrome, pastels, and rock 'n' roll",
    colors: {
      background: "195 20% 95%",
      foreground: "210 5% 15%",
      card: "0 0% 100%",
      cardForeground: "210 5% 15%",
      primary: "345 80% 55%",
      primaryForeground: "0 0% 100%",
      secondary: "330 100% 75%",
      secondaryForeground: "210 5% 15%",
      muted: "160 40% 80%",
      mutedForeground: "210 5% 15%",
      accent: "200 10% 80%",
      accentForeground: "210 5% 15%",
      border: "0 0% 85%",
    },
    fonts: {
      heading: "Bebas Neue",
      body: "Roboto",
    },
    extras: {
      gradient: "from-pink-100 to-cyan-100",
      pattern: "checkerboard",
    },
  },
  
  sixties: {
    id: "sixties",
    name: "1960s Psychedelic",
    description: "Groovy colors and flower power",
    colors: {
      background: "280 85% 8%",
      foreground: "54 95% 95%",
      card: "292 70% 12%",
      cardForeground: "54 95% 95%",
      primary: "326 100% 60%",
      primaryForeground: "54 95% 95%",
      secondary: "145 85% 45%",
      secondaryForeground: "280 85% 8%",
      muted: "35 90% 65%",
      mutedForeground: "280 85% 8%",
      accent: "58 95% 65%",
      accentForeground: "280 85% 8%",
      border: "292 70% 20%",
    },
    fonts: {
      heading: "Bebas Neue",
      body: "Inter",
    },
    extras: {
      gradient: "from-purple-200 via-pink-200 to-orange-200",
      pattern: "flowers",
    },
  },
  
  seventies: {
    id: "seventies",
    name: "1970s Disco",
    description: "Earth tones meet disco glamour",
    colors: {
      background: "20 10% 15%",
      foreground: "200 0% 95%",
      card: "30 15% 25%",
      cardForeground: "200 0% 90%",
      primary: "35 80% 50%",
      primaryForeground: "200 0% 10%",
      secondary: "80 50% 40%",
      secondaryForeground: "200 0% 10%",
      muted: "45 20% 45%",
      mutedForeground: "200 0% 10%",
      accent: "195 10% 75%",
      accentForeground: "200 0% 10%",
      border: "30 10% 20%",
    },
    fonts: {
      heading: "Righteous",
      body: "Inter",
    },
    extras: {
      gradient: "from-orange-200 to-amber-200",
      pattern: "stripes",
    },
  },
  
  eighties: {
    id: "eighties",
    name: "1980s Neon",
    description: "Bold neons and synthwave vibes",
    colors: {
      background: "230 60% 10%",
      foreground: "0 0% 100%",
      card: "240 40% 20%",
      cardForeground: "0 0% 90%",
      primary: "330 100% 60%",
      primaryForeground: "0 0% 100%",
      secondary: "200 100% 50%",
      secondaryForeground: "0 0% 100%",
      muted: "260 40% 40%",
      mutedForeground: "0 0% 90%",
      accent: "120 100% 50%",
      accentForeground: "0 0% 100%",
      border: "0 0% 50%",
    },
    fonts: {
      heading: "Orbitron",
      body: "Inter",
    },
    extras: {
      gradient: "from-purple-600 via-pink-500 to-cyan-400",
      pattern: "grid",
      buttonStyle: "neon-button",
    },
  },
  
  nineties: {
    id: "nineties",
    name: "1990s Grunge",
    description: "Alternative vibes and muted tones",
    colors: {
      background: "12 10% 12%",
      foreground: "40 8% 88%",
      card: "12 12% 16%",
      cardForeground: "40 8% 88%",
      primary: "0 42% 42%",
      primaryForeground: "0 5% 95%",
      secondary: "200 30% 35%",
      secondaryForeground: "200 5% 95%",
      muted: "120 15% 25%",
      mutedForeground: "120 5% 90%",
      accent: "35 25% 30%",
      accentForeground: "35 5% 90%",
      border: "20 10% 20%",
    },
    fonts: {
      heading: "Bebas Neue",
      body: "Inter",
    },
    extras: {
      gradient: "from-gray-200 to-gray-300",
      pattern: "plaid",
    },
  },
  
  twothousands: {
    id: "twothousands",
    name: "2000s Y2K",
    description: "Metallic, holographic, and digital",
    colors: {
      background: "210 20% 98%",
      foreground: "210 5% 10%",
      card: "215 10% 95%",
      cardForeground: "210 5% 10%",
      primary: "170 70% 50%",
      primaryForeground: "210 2% 98%",
      secondary: "10 50% 40%",
      secondaryForeground: "210 2% 98%",
      muted: "160 10% 85%",
      mutedForeground: "210 5% 10%",
      accent: "70 60% 45%",
      accentForeground: "210 2% 98%",
      border: "200 10% 80%",
    },
    fonts: {
      heading: "Orbitron",
      body: "Inter",
    },
    extras: {
      gradient: "from-blue-200 via-purple-200 to-pink-200",
      pattern: "holographic",
      buttonStyle: "y2k-button",
    },
  },
};

export function getTheme(themeId: string): Theme {
  return themes[themeId] || themes.vintage;
}
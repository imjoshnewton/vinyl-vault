"use client";

import { useState, useEffect } from "react";
import { Volume2, Disc3, Sun, Moon } from "lucide-react";
import EnhancedAlbumImage from "@/components/enhanced-album-image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNowSpinningAction } from "@/actions/now-spinning.actions";
import { getPublicStatsAction } from "@/actions/public.actions";
import type { VinylRecord, User } from "@/server/db";

interface KioskDisplayProps {
  username: string;
}

interface NowSpinningData {
  id: string;
  record: VinylRecord;
  startedAt: Date;
}

export default function KioskDisplay({ username }: KioskDisplayProps) {
  const [nowSpinning, setNowSpinning] = useState<NowSpinningData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Detect system theme preference on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data if not already loaded
        if (!user) {
          const statsResult = await getPublicStatsAction(username);
          if (statsResult?.user) {
            setUser(statsResult.user);
          }
        }

        // Fetch now spinning data
        const result = await getNowSpinningAction(username);
        if (result.success && result.nowSpinning) {
          setNowSpinning(result.nowSpinning);
        } else {
          setNowSpinning(null);
        }
      } catch (error) {
        console.error("Failed to fetch kiosk data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh every 15 seconds for live updates
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [username, user]);

  const themeClasses = {
    background: isDarkMode 
      ? "bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" 
      : "bg-stone-100",
    text: isDarkMode ? "text-white" : "text-stone-900",
    textSecondary: isDarkMode ? "text-white/80" : "text-stone-600",
    textMuted: isDarkMode ? "text-white/60" : "text-stone-500",
    textSuccess: isDarkMode ? "text-green-400" : "text-green-600",
    badgeBg: isDarkMode ? "bg-white/10" : "bg-stone-200/80",
    badgeText: isDarkMode ? "text-white" : "text-stone-800",
    badgeBorder: isDarkMode ? "border-white/20" : "border-stone-300",
    cardBg: isDarkMode ? "bg-white/10" : "bg-white/80",
    cardBorder: isDarkMode ? "border-white/20" : "border-stone-200",
  };

  const ownerName = user?.name || user?.username || "Collection Owner";

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
        <div className={`${themeClasses.text} text-xl`}>Loading...</div>
      </div>
    );
  }

  if (!nowSpinning) {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center relative`}>
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`absolute top-4 right-4 ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-stone-600 hover:bg-stone-200'}`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <div className={`text-center ${themeClasses.text}`}>
          <Disc3 className={`w-32 h-32 mx-auto mb-6 ${themeClasses.textMuted}`} />
          <h1 className="text-4xl font-bold mb-4">{ownerName}&apos;s Collection</h1>
          <p className={`text-xl ${themeClasses.textMuted}`}>Nothing currently spinning</p>
          <div className="mt-8">
            <p className={`text-sm ${themeClasses.textMuted} mb-4`}>Browse the collection:</p>
            {/* QR Code will go here */}
            <div className="inline-block p-4 bg-white rounded-lg">
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                QR Code
              </div>
            </div>
            <p className={`text-xs ${themeClasses.textMuted} mt-2`}>
              Scan to browse on your phone
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { record } = nowSpinning;
  
  // Use the best available image
  const displayImage = record.coverImageUrl || record.imageUrl;

  return (
    <div className={`min-h-screen ${themeClasses.background} overflow-hidden relative`}>
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-4 right-4 z-10 ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-stone-600 hover:bg-stone-200'}`}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>

      {/* Main Content */}
      <div className="h-screen flex flex-col lg:flex-row items-center justify-center gap-12 p-8">
        {/* Album Art Section */}
        <div className="flex-shrink-0">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-3xl opacity-30 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-80 h-80 lg:w-[28rem] lg:h-[28rem] rounded-2xl overflow-hidden shadow-2xl">
              <EnhancedAlbumImage
                src={displayImage}
                alt={`${record.artist} - ${record.title}`}
                priority
                sizes="(max-width: 1024px) 320px, 448px"
              />
            </div>
          </div>
        </div>
        
        {/* Info Section */}
        <div className={`flex-1 max-w-2xl ${themeClasses.text} space-y-6`}>
          {/* Track Info */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-3 leading-tight">
              {record.title}
            </h1>
            <h2 className={`text-3xl lg:text-4xl ${themeClasses.textSecondary} mb-6`}>
              by {record.artist}
            </h2>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {record.releaseYear && (
              <Badge variant="outline" className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} text-lg px-3 py-1`}>
                {record.releaseYear}
              </Badge>
            )}
            {record.genre && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-lg px-3 py-1">
                {record.genre}
              </Badge>
            )}
            {record.label && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-lg px-3 py-1">
                {record.label}
              </Badge>
            )}
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-lg px-3 py-1">
              {record.type}
            </Badge>
          </div>
          
          {/* Now Spinning Status */}
          <div className={`flex items-center gap-3 ${themeClasses.textSuccess} text-2xl`}>
            <Volume2 className="w-8 h-8 animate-pulse" />
            <span className="font-semibold">NOW SPINNING</span>
          </div>
          
          {/* Track List */}
          {record.tracks && record.tracks.length > 0 && (
            <Card className={`${themeClasses.cardBg} ${themeClasses.cardBorder} p-6`}>
              <h3 className={`${themeClasses.text} text-xl font-semibold mb-4`}>Track Listing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {record.tracks.map((track, index) => (
                  <div key={index} className={`flex items-center gap-3 ${themeClasses.text} opacity-90`}>
                    <span className={`${themeClasses.textMuted} text-sm font-mono w-8 text-right`}>
                      {index + 1}.
                    </span>
                    <span className="text-lg">{track}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Notes Section */}
          {record.notes && (
            <Card className={`${themeClasses.cardBg} ${themeClasses.cardBorder} p-6`}>
              <p className={`${themeClasses.text} opacity-80 italic text-lg`}>&quot;{record.notes}&quot;</p>
            </Card>
          )}
          
          {/* QR Code Section */}
          <div className="mt-12">
            <p className={`${themeClasses.textMuted} mb-4`}>Browse {ownerName}&apos;s Collection:</p>
            <div className="inline-block p-4 bg-white rounded-lg">
              <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                QR Code
              </div>
            </div>
            <p className={`text-xs ${themeClasses.textMuted} mt-2`}>
              Scan to browse on your phone
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`absolute bottom-4 right-4 ${themeClasses.textMuted} text-sm`}>
        {ownerName}&apos;s Vinyl Collection
      </div>
    </div>
  );
}
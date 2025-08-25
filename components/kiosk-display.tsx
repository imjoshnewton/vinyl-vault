"use client";

import { useState, useEffect } from "react";
import { Volume2, Disc3, Sun, Moon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import EnhancedAlbumImage from "@/components/enhanced-album-image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNowSpinning } from "@/providers/now-spinning-provider";
import { getPublicStatsAction } from "@/actions/public.actions";
import type { VinylRecord, User } from "@/server/db";

interface KioskDisplayProps {
  username: string;
}

export default function KioskDisplay({ username }: KioskDisplayProps) {
  const { nowSpinning, isLoading: nowSpinningLoading } = useNowSpinning();
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
    const fetchUserData = async () => {
      try {
        // Only fetch user data (now spinning comes from context)
        const statsResult = await getPublicStatsAction(username);
        if (statsResult?.user) {
          setUser(statsResult.user);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      fetchUserData();
    }
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
            <Link 
              href={`/u/${username}`}
              className={`text-sm ${themeClasses.textMuted} hover:underline mb-4 block`}
            >
              Browse the collection
            </Link>
            {/* QR Code */}
            <div className="inline-block p-4 bg-white rounded-lg">
              <QRCodeSVG 
                value={typeof window !== 'undefined' ? `${window.location.origin}/u/${username}` : `https://vinyl-vault.vercel.app/u/${username}`}
                size={128}
                level="M"
                includeMargin={false}
              />
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
          
          {/* Badges - Single line with better truncation */}
          <div className="flex gap-2 items-center">
            {record.releaseYear && (
              <Badge variant="outline" className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} text-lg px-3 py-1 flex-shrink-0`}>
                {record.releaseYear}
              </Badge>
            )}
            {record.genre && (
              <Badge variant="outline" className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} text-lg px-3 py-1 max-w-md`}>
                <span className="block truncate">{record.genre}</span>
              </Badge>
            )}
            {record.label && (
              <Badge variant="outline" className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} text-lg px-3 py-1 max-w-xs`}>
                <span className="block truncate">{record.label}</span>
              </Badge>
            )}
            <Badge variant="outline" className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} text-lg px-3 py-1 flex-shrink-0`}>
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
            <Link 
              href={`/u/${username}`}
              className={`${themeClasses.textMuted} hover:underline mb-4 block`}
            >
              Browse {ownerName}&apos;s Collection
            </Link>
            <div className="inline-block p-4 bg-white rounded-lg">
              <QRCodeSVG 
                value={typeof window !== 'undefined' ? `${window.location.origin}/u/${username}` : `https://vinyl-vault.vercel.app/u/${username}`}
                size={96}
                level="M"
                includeMargin={false}
              />
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
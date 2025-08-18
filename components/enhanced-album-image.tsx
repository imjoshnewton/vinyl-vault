"use client";

import { useState } from "react";
import Image from "next/image";
import { Disc3 } from "lucide-react";

interface EnhancedAlbumImageProps {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Enhanced album image component with fallback resolution handling
 * Tries higher resolution versions and falls back gracefully
 */
export default function EnhancedAlbumImage({ 
  src, 
  alt, 
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 400px, 500px"
}: EnhancedAlbumImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src);
  const [hasErrored, setHasErrored] = useState(false);

  // Generate fallback URLs for Discogs images
  const generateFallbackUrls = (originalUrl: string): string[] => {
    if (!originalUrl.includes('discogs.com')) {
      return [originalUrl];
    }

    const fallbacks = [];
    
    // Try different sizes in descending order
    const sizes = ['1200', '800', '600', '400'];
    
    for (const size of sizes) {
      const fallbackUrl = originalUrl
        .replace(/(_\d+)\.jpg$/i, `_${size}.jpg`)
        .replace(/\/R-\d+-/i, `/R-${size}-`)
        .replace(/\/A-\d+-/i, `/A-${size}-`)
        .replace(/\/L-\d+-/i, `/L-${size}-`);
      
      fallbacks.push(fallbackUrl);
    }
    
    // Add the original as final fallback
    fallbacks.push(originalUrl);
    
    return [...new Set(fallbacks)]; // Remove duplicates
  };

  const handleImageError = () => {
    if (!currentSrc) {
      setHasErrored(true);
      return;
    }

    const fallbackUrls = generateFallbackUrls(currentSrc);
    const currentIndex = fallbackUrls.indexOf(currentSrc);
    
    if (currentIndex < fallbackUrls.length - 1) {
      // Try next fallback
      setCurrentSrc(fallbackUrls[currentIndex + 1]);
    } else {
      // No more fallbacks, show placeholder
      setHasErrored(true);
    }
  };

  if (!currentSrc || hasErrored) {
    return (
      <div className={`bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center ${className}`}>
        <Disc3 className="w-32 h-32 text-stone-600 animate-spin" 
               style={{ animationDuration: '3s' }} />
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className="object-cover"
      priority={priority}
      sizes={sizes}
      quality={95} // Higher quality for better clarity
      onError={handleImageError}
      // Disable Next.js default optimization that might blur images
      unoptimized={false}
    />
  );
}
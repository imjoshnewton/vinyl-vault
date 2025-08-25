"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disc3, Volume2 } from "lucide-react";
import ShareToStory from "@/components/share-to-story";
import { useOptionalNowSpinning } from "@/providers/now-spinning-provider";
import type { VinylRecord } from "@/server/db";

interface NowSpinningBannerProps {
  username: string;
  isOwner?: boolean;
  onViewKiosk?: (record: VinylRecord) => void;
  ownerName?: string;
}


export default function NowSpinningBanner({ 
  username, 
  onViewKiosk,
  ownerName = "Collection Owner",
  isOwner = false
}: NowSpinningBannerProps) {
  const nowSpinningContext = useOptionalNowSpinning();
  
  // If no context is available, don't render the banner
  if (!nowSpinningContext) {
    return null;
  }
  
  const { nowSpinning, isLoading: loading } = nowSpinningContext;

  if (loading || !nowSpinning) {
    return null;
  }

  const { record } = nowSpinning;

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
      <div className="p-4">
        {/* NOW SPINNING label - above content on mobile */}
        <div className="flex items-center gap-2 mb-3 sm:hidden">
          <Volume2 className="w-4 h-4 text-purple-600 animate-pulse" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            NOW SPINNING
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Spinning icon and label - desktop only */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <Volume2 className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              NOW SPINNING
            </span>
          </div>
          
          {/* Album art */}
          <div className="flex-shrink-0">
            {record.imageUrl ? (
              <div className="relative w-12 h-12 rounded overflow-hidden">
                <Image
                  src={record.imageUrl}
                  alt={`${record.artist} - ${record.title}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center">
                <Disc3 className="w-6 h-6 text-secondary-foreground animate-spin" 
                       style={{ animationDuration: '3s' }} />
              </div>
            )}
          </div>
          
          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {record.artist} - {record.title}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {record.releaseYear && `${record.releaseYear} • `}
              {record.genre || record.type}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex-shrink-0 flex gap-1 sm:gap-2">
            <ShareToStory 
              record={record}
              ownerName={ownerName}
              username={username}
            />
            {onViewKiosk && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewKiosk(record)}
                className="gap-2"
              >
                <Disc3 className="w-4 h-4" />
                <span className="hidden sm:inline">View</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
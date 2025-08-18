"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Disc3, Maximize2, Volume2, Square } from "lucide-react";
import EditRecordDialog from "@/components/edit-record-dialog";
import NowSpinningKiosk from "@/components/now-spinning-kiosk";
import { recordPlayAction } from "@/actions/records.actions";
import { setNowSpinningAction, clearNowSpinningAction } from "@/actions/now-spinning.actions";
import type { VinylRecord } from "@/server/db";

interface MobileRecordCardProps {
  record: VinylRecord;
  isOwner?: boolean;
  username?: string;
  nowSpinningId?: string | null;
}

export default function MobileRecordCard({ record, isOwner = true, username, nowSpinningId }: MobileRecordCardProps) {
  const [showKiosk, setShowKiosk] = useState(false);
  
  const handlePlay = async () => {
    if (!isOwner) return;
    await recordPlayAction(record.id);
  };

  const handleToggleNowSpinning = async () => {
    if (!isOwner) return;
    
    if (nowSpinningId === record.id) {
      // Stop spinning
      await clearNowSpinningAction();
    } else {
      // Start spinning
      await setNowSpinningAction(record.id);
    }
    
    // Force page refresh after action to update all components
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <>
      <Card className={`w-full ${
        nowSpinningId === record.id 
          ? 'bg-stone-100 dark:bg-stone-900/50 border-l-4 border-stone-400 dark:border-stone-600' 
          : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Album Art */}
            <div className="flex-shrink-0">
              {record.imageUrl ? (
                <div className="relative w-16 h-16 rounded overflow-hidden">
                  <Image
                    src={record.imageUrl}
                    alt={`${record.artist} - ${record.title}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded bg-secondary flex items-center justify-center">
                  <Disc3 className="w-8 h-8 text-secondary-foreground" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base leading-tight truncate">{record.artist}</h3>
                    {nowSpinningId === record.id && (
                      <Disc3 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" 
                             style={{ animationDuration: '3s' }} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{record.title}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                    {record.type}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                {record.genre && (
                  <div>
                    <span className="text-muted-foreground">Genre:</span>
                    <p className="font-medium truncate">{record.genre}</p>
                  </div>
                )}
                {record.releaseYear && (
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <p className="font-medium">{record.releaseYear}</p>
                  </div>
                )}
                {record.label && (
                  <div>
                    <span className="text-muted-foreground">Label:</span>
                    <p className="font-medium truncate">{record.label}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Plays:</span>
                  <p className="font-medium">{record.playCount}</p>
                </div>
              </div>
              
              <div className="flex gap-1 mt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowKiosk(true)}
                  className="gap-1 px-2"
                  title="Now Spinning"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
                {isOwner && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlay}
                      className="gap-1 px-2"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleToggleNowSpinning}
                      className="gap-1 px-2"
                    >
                      {nowSpinningId === record.id ? 
                        <Square className="w-3 h-3" /> : 
                        <Volume2 className="w-3 h-3" />
                      }
                    </Button>
                    <EditRecordDialog record={record} />
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Now Spinning Kiosk */}
      {showKiosk && (
        <NowSpinningKiosk
          record={record}
          onClose={() => setShowKiosk(false)}
          onShuffle={() => {
            // For mobile view, just close the kiosk since we don't have access to all records
            setShowKiosk(false);
          }}
          isOwner={isOwner}
          username={username}
        />
      )}
    </>
  );
}
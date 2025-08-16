"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import EditRecordDialog from "@/components/edit-record-dialog";
import { recordPlayAction } from "@/actions/records.actions";
import type { VinylRecord } from "@/server/db";

interface MobileRecordCardProps {
  record: VinylRecord;
  isOwner?: boolean;
}

export default function MobileRecordCard({ record, isOwner = true }: MobileRecordCardProps) {
  const handlePlay = async () => {
    if (!isOwner) return;
    await recordPlayAction(record.id);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight truncate">{record.artist}</h3>
            <p className="text-muted-foreground truncate">{record.title}</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
              {record.type}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          {record.label && (
            <div>
              <span className="text-muted-foreground">Label:</span>
              <p className="font-medium truncate">{record.label}</p>
            </div>
          )}
          {record.releaseYear && (
            <div>
              <span className="text-muted-foreground">Year:</span>
              <p className="font-medium">{record.releaseYear}</p>
            </div>
          )}
          {record.genre && (
            <div>
              <span className="text-muted-foreground">Genre:</span>
              <p className="font-medium truncate">{record.genre}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Plays:</span>
            <p className="font-medium">{record.playCount}</p>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlay}
              className="gap-1 flex-1"
            >
              <Play className="w-3 h-3" />
              Play
            </Button>
            <EditRecordDialog record={record} className="flex-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
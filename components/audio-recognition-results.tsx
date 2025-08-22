"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Music, Plus, ExternalLink, CheckCircle } from "lucide-react";
import Image from "next/image";
import { searchDiscogsAction, addDiscogsReleaseAction } from "@/actions/discogs.actions";
import { setNowSpinningAction } from "@/actions/now-spinning.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { AudioRecognitionResult } from "@/actions/audio-recognition.actions";
import type { VinylRecord } from "@/server/db";

interface DiscogsSearchResult {
  id: number;
  title: string;
  year?: string;
  format?: string[];
  label?: string[];
  genre?: string[];
  thumb?: string;
}

interface AudioRecognitionResultsProps {
  result: AudioRecognitionResult;
  userRecords: VinylRecord[];
  onClose: () => void;
}

export default function AudioRecognitionResults({ 
  result, 
  userRecords, 
  onClose 
}: AudioRecognitionResultsProps) {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [discogsResults, setDiscogsResults] = useState<DiscogsSearchResult[]>([]);
  const [showDiscogsResults, setShowDiscogsResults] = useState(false);
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());
  const [settingNowSpinning, setSettingNowSpinning] = useState<string | null>(null);
  
  if (!result.result) return null;
  
  const track = result.result;
  
  // Find matching records in user's collection
  const matchingRecords = userRecords.filter(record => {
    const artistMatch = record.artist.toLowerCase().includes(track.artist.toLowerCase()) ||
                       track.artist.toLowerCase().includes(record.artist.toLowerCase());
    return artistMatch;
  });
  
  const handleSearchDiscogs = async () => {
    setIsSearching(true);
    try {
      // Search for the artist and album/track
      const searchQuery = `${track.artist} ${track.album || track.title}`;
      const discogsResult = await searchDiscogsAction(searchQuery);
      
      if (discogsResult.success && discogsResult.results) {
        setDiscogsResults(discogsResult.results);
        setShowDiscogsResults(true);
      } else {
        toast.error("Failed to search Discogs");
      }
    } catch {
      toast.error("Failed to search Discogs");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSetNowSpinning = async (recordId: string) => {
    setSettingNowSpinning(recordId);
    try {
      const result = await setNowSpinningAction(recordId);
      
      if (result.success) {
        toast.success("Now spinning updated!");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update Now Spinning");
    } finally {
      setSettingNowSpinning(null);
    }
  };
  
  const handleAddFromDiscogs = async (releaseId: number) => {
    setAddingIds(prev => new Set([...prev, releaseId]));
    
    try {
      const result = await addDiscogsReleaseAction(releaseId);
      if (result.success) {
        toast.success("Record added to your collection!");
        
        // Set as now spinning if we have a record ID
        if (result.recordId) {
          await setNowSpinningAction(result.recordId);
          toast.success("Now spinning!");
        }
        
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Failed to add release");
      }
    } catch {
      toast.error("Failed to add release");
    } finally {
      setAddingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(releaseId);
        return newSet;
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Recognized Track Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Track Identified!</span>
        </div>
        
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="font-semibold text-lg">{track.title}</div>
          <div className="text-muted-foreground">{track.artist}</div>
          {track.album && (
            <div className="text-sm text-muted-foreground">Album: {track.album}</div>
          )}
          {track.release_date && (
            <div className="text-sm text-muted-foreground">
              Released: {new Date(track.release_date).getFullYear()}
            </div>
          )}
        </div>
      </div>
      
      {/* Matching Records in Collection */}
      {matchingRecords.length > 0 && !showDiscogsResults && (
        <div className="space-y-3">
          <h3 className="font-semibold">In Your Collection:</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {matchingRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                {record.imageUrl && (
                  <Image
                    src={record.imageUrl}
                    alt={record.title}
                    width={50}
                    height={50}
                    className="rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{record.title}</div>
                  <div className="text-sm text-muted-foreground">{record.artist}</div>
                  {record.releaseYear && (
                    <div className="text-xs text-muted-foreground">{record.releaseYear}</div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSetNowSpinning(record.id)}
                  disabled={settingNowSpinning === record.id}
                >
                  {settingNowSpinning === record.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Music className="w-4 h-4 mr-1" />
                      Now Spinning
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Discogs Search Results */}
      {showDiscogsResults && discogsResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Add from Discogs:</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {discogsResults.map((release) => (
              <div
                key={release.id}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                {release.thumb && (
                  <Image
                    src={release.thumb}
                    alt={release.title}
                    width={60}
                    height={60}
                    className="rounded"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-sm">{release.title}</div>
                  {release.year && (
                    <div className="text-xs text-muted-foreground">Year: {release.year}</div>
                  )}
                  {release.label && release.label.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Label: {release.label.join(", ")}
                    </div>
                  )}
                  {release.format && release.format.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {release.format.map((fmt, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {fmt}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleAddFromDiscogs(release.id)}
                    disabled={addingIds.has(release.id)}
                  >
                    {addingIds.has(release.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                  <a
                    href={`https://www.discogs.com/release/${release.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        {!showDiscogsResults && (
          <>
            <Button
              onClick={handleSearchDiscogs}
              disabled={isSearching}
              className="flex-1"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  Search Discogs
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </>
        )}
        {showDiscogsResults && (
          <Button
            onClick={() => setShowDiscogsResults(false)}
            variant="outline"
            className="w-full"
          >
            Back to Results
          </Button>
        )}
      </div>
    </div>
  );
}
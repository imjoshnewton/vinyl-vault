"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Shuffle, 
  RotateCcw,
  Volume2, 
  Heart, 
  MessageCircle,
  Disc3,
  X,
  Maximize2,
  Music,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ListeningLogDialog from "@/components/listening-log-dialog";
import { setNowSpinningAction, clearNowSpinningAction, requestNextRecordAction } from "@/actions/now-spinning.actions";
import type { VinylRecord } from "@/server/db";

interface NowSpinningKioskProps {
  record: VinylRecord;
  onClose?: () => void;
  onShuffle?: () => void;
  allRecords?: VinylRecord[];
  isOwner?: boolean;
  ownerName?: string;
}

export default function NowSpinningKiosk({ 
  record, 
  onClose, 
  onShuffle,
  allRecords = [],
  isOwner = false,
  ownerName = "Collection Owner"
}: NowSpinningKioskProps) {
  const [isSpinning, setIsSpinning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showListeningLog, setShowListeningLog] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestComment, setGuestComment] = useState("");
  
  // Toggle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };
  
  const handleAddGuestComment = async () => {
    if (!guestName || !guestComment) return;
    
    // TODO: Implement API call to add guest comment
    console.log("Adding guest comment:", { 
      recordId: record.id, 
      guestName, 
      comment: guestComment 
    });
    
    setGuestName("");
    setGuestComment("");
    setShowComments(false);
  };

  const handlePickRandomRecord = () => {
    if (allRecords.length === 0) return;
    
    // Filter out the current record and pick a random one
    const otherRecords = allRecords.filter(r => r.id !== record.id);
    if (otherRecords.length === 0) return;
    
    const randomRecord = otherRecords[Math.floor(Math.random() * otherRecords.length)];
    onShuffle?.();
  };

  const handleMarkAsNowSpinning = async () => {
    const result = await setNowSpinningAction(record.id);
    if (!result.success) {
      console.error("Failed to mark as now spinning:", result.error);
    }
  };

  const handleStopSpinning = async () => {
    const result = await clearNowSpinningAction();
    if (!result.success) {
      console.error("Failed to stop spinning:", result.error);
    }
  };

  const handleRequestNext = async () => {
    if (!guestName) return;
    
    const result = await requestNextRecordAction(ownerName, record.id, guestName);
    if (result.success) {
      setGuestName("");
      // Show success feedback
      alert("Request sent to " + ownerName + "!");
    } else {
      console.error("Failed to request next record:", result.error);
    }
  };

  // Use cover image if available, fallback to thumbnail
  const displayImage = record.coverImageUrl || record.imageUrl;

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 ${isFullscreen ? '' : 'p-4'}`}>
      {/* Close and Fullscreen buttons */}
      {!isFullscreen && onClose && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      
      {/* Main Content */}
      <div className="h-full flex flex-col lg:flex-row items-center justify-center gap-8 p-8">
        {/* Album Art Section */}
        <div className="flex-shrink-0">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-3xl opacity-30 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={`${record.artist} - ${record.title}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center">
                  <Disc3 className="w-32 h-32 text-stone-600 animate-spin-slow" />
                </div>
              )}
              
              {/* Vinyl spinning overlay */}
              {isSpinning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full border-8 border-stone-900/50 animate-spin" 
                       style={{ animationDuration: '3s' }} />
                  <div className="absolute w-4 h-4 bg-stone-900 rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Info Section */}
        <div className="flex-1 max-w-2xl text-white space-y-6">
          {/* Now Playing Label */}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>NOW SPINNING</span>
          </div>
          
          {/* Track Info */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-2">{record.title}</h1>
            <h2 className="text-2xl lg:text-3xl text-white/80">{record.artist}</h2>
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-3">
            {record.releaseYear && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                {record.releaseYear}
              </Badge>
            )}
            {record.genre && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                {record.genre}
              </Badge>
            )}
            {record.label && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                {record.label}
              </Badge>
            )}
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              {record.type}
            </Badge>
          </div>
          
          {/* Vinyl Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Button
              size="lg"
              variant="ghost"
              onClick={() => setIsSpinning(!isSpinning)}
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
              title={isSpinning ? "Stop spinning" : "Start spinning"}
            >
              <Disc3 className={`w-8 h-8 ${isSpinning ? 'animate-spin' : ''}`} 
                     style={{ animationDuration: '3s' }} />
            </Button>
            
            {isOwner ? (
              <>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={handlePickRandomRecord}
                  disabled={allRecords.length <= 1}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
                  title="Pick random record"
                >
                  <Shuffle className="w-6 h-6" />
                </Button>

                <Button
                  variant="outline"
                  onClick={handleMarkAsNowSpinning}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  title="Mark as Now Spinning"
                >
                  🎵 Now Spinning
                </Button>

                <Button
                  variant="outline"
                  onClick={handleStopSpinning}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  title="Stop Now Spinning"
                >
                  ⏹️ Stop
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 w-32"
                  size="sm"
                />
                <Button
                  variant="outline"
                  onClick={handleRequestNext}
                  disabled={!guestName}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 disabled:opacity-50"
                  title="Request next record"
                >
                  🙋 Request Next
                </Button>
              </div>
            )}
          </div>
          
          {/* Notes Section */}
          {record.notes && (
            <Card className="bg-white/10 border-white/20 p-4">
              <p className="text-white/80 italic">&quot;{record.notes}&quot;</p>
            </Card>
          )}
          
          {/* Interactive Section */}
          <div className="flex gap-4">
            {isOwner ? (
              <>
                <Button
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={() => setShowListeningLog(true)}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Add Listening Note
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={() => setShowComments(!showComments)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Comments
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Leave a Comment
              </Button>
            )}
          </div>
          
          {/* Comments Section */}
          {showComments && (
            <Card className="bg-white/10 border-white/20 p-4 space-y-4">
              {isOwner ? (
                <>
                  <h3 className="text-white font-semibold">Guest Comments</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {/* Mock comments for now */}
                    <div className="bg-white/5 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-medium text-sm">Sarah</span>
                        <span className="text-white/60 text-xs">2 days ago</span>
                      </div>
                      <p className="text-white/80 text-sm">This album brings back so many memories! Love the production on track 3.</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-medium text-sm">Mike</span>
                        <span className="text-white/60 text-xs">1 week ago</span>
                      </div>
                      <p className="text-white/80 text-sm">Never heard this one before - adding it to my wishlist!</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs">Comments will appear here when guests leave them</p>
                </>
              ) : (
                <>
                  <h3 className="text-white font-semibold">Leave a note for {ownerName}</h3>
                  <Input
                    placeholder="Your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Textarea
                    placeholder="Share your thoughts about this record..."
                    value={guestComment}
                    onChange={(e) => setGuestComment(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleAddGuestComment}
                    disabled={!guestName || !guestComment}
                    className="w-full bg-white/20 hover:bg-white/30 text-white"
                  >
                    Submit Comment
                  </Button>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
      
      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-900/80 to-transparent">
        <div className="flex items-center justify-between text-white/60 text-sm">
          <div className="flex items-center gap-4">
            <span>Played {record.playCount || 0} times</span>
            {record.condition && <span>Condition: {record.condition}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>{ownerName}&apos;s Collection</span>
          </div>
        </div>
      </div>
      
      {/* Listening Log Dialog */}
      <ListeningLogDialog
        record={record}
        open={showListeningLog}
        onClose={() => setShowListeningLog(false)}
      />
    </div>
  );
}
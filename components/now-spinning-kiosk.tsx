"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Play, 
  Pause, 
  SkipForward, 
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
import type { VinylRecord } from "@/server/db";

interface NowSpinningKioskProps {
  record: VinylRecord;
  onClose?: () => void;
  onNext?: () => void;
  isOwner?: boolean;
  ownerName?: string;
}

export default function NowSpinningKiosk({ 
  record, 
  onClose, 
  onNext,
  isOwner = false,
  ownerName = "Collection Owner"
}: NowSpinningKioskProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
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
              
              {/* Spinning overlay for vinyl effect */}
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full border-8 border-stone-900/50 animate-spin-slow" />
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
          
          {/* Play Controls */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              size="lg"
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
            
            {onNext && (
              <Button
                size="lg"
                variant="ghost"
                onClick={onNext}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <SkipForward className="w-6 h-6" />
              </Button>
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
                  onClick={() => {
                    // TODO: Open listening log dialog
                  }}
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
          
          {/* Comment Form (for guests) */}
          {showComments && !isOwner && (
            <Card className="bg-white/10 border-white/20 p-4 space-y-3">
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
    </div>
  );
}
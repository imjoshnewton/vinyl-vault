"use client";

import { useState, useEffect } from "react";
import { 
  Shuffle, 
  Volume2, 
  Heart, 
  MessageCircle,
  X,
  Maximize2,
  Music,
  Users
} from "lucide-react";
import EnhancedAlbumImage from "@/components/enhanced-album-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ListeningLogDialog from "@/components/listening-log-dialog";
import ShareToStory from "@/components/share-to-story";
import { setNowSpinningAction, clearNowSpinningAction, requestNextRecordAction, getNowSpinningAction } from "@/actions/now-spinning.actions";
import { addGuestCommentAction, getGuestCommentsAction } from "@/actions/comments.actions";
import type { VinylRecord } from "@/server/db";

interface NowSpinningKioskProps {
  record: VinylRecord;
  onClose?: () => void;
  onShuffle?: () => void;
  allRecords?: VinylRecord[];
  isOwner?: boolean;
  ownerName?: string;
  username?: string;
}

export default function NowSpinningKiosk({ 
  record, 
  onClose, 
  onShuffle,
  allRecords = [],
  isOwner = false,
  ownerName = "Collection Owner",
  username
}: NowSpinningKioskProps) {
  const [isCurrentlySpinning, setIsCurrentlySpinning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showListeningLog, setShowListeningLog] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestComment, setGuestComment] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [comments, setComments] = useState<{
    id: string;
    guestName: string;
    comment: string;
    createdAt: Date;
  }[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Detect system theme preference on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Check if this record is currently spinning
  useEffect(() => {
    const checkSpinningStatus = async () => {
      if (!username) return;
      
      const result = await getNowSpinningAction(username);
      if (result.success && result.nowSpinning) {
        setIsCurrentlySpinning(result.nowSpinning.record.id === record.id);
      } else {
        setIsCurrentlySpinning(false);
      }
    };
    
    checkSpinningStatus();
  }, [username, record.id]);

  // Fetch comments when comments section is opened
  useEffect(() => {
    const shouldFetch = showComments && !loadingComments && comments.length === 0;
    if (shouldFetch) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const result = await getGuestCommentsAction(record.id);
      if (result.success) {
        setComments(result.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Handle ESC key to close kiosk
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  
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
    if (!guestName || !guestComment || submittingComment) return;
    
    setSubmittingComment(true);
    try {
      const result = await addGuestCommentAction({
        recordId: record.id,
        guestName,
        comment: guestComment,
      });
      
      if (result.success) {
        setGuestName("");
        setGuestComment("");
        // Refresh comments to show the new one
        await fetchComments();
      } else {
        console.error("Failed to add comment:", result.error);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePickRandomRecord = () => {
    if (allRecords.length === 0) return;
    
    // Filter out the current record and pick a random one
    const otherRecords = allRecords.filter(r => r.id !== record.id);
    if (otherRecords.length === 0) return;
    
    // Trigger shuffle to pick a random record
    onShuffle?.();
  };

  const handleMarkAsNowSpinning = async () => {
    const result = await setNowSpinningAction(record.id);
    if (result.success) {
      setIsCurrentlySpinning(true);
    } else {
      console.error("Failed to mark as now spinning:", result.error);
    }
  };

  const handleStopSpinning = async () => {
    const result = await clearNowSpinningAction();
    if (result.success) {
      setIsCurrentlySpinning(false);
    } else {
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

  return (
    <div className={`fixed inset-0 z-50 ${themeClasses.background} ${isFullscreen ? '' : 'p-4'}`}>
      {/* Close and Fullscreen buttons */}
      {!isFullscreen && onClose && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className={`${themeClasses.text} ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-stone-200'}`}
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`${themeClasses.text} ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-stone-200'}`}
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
            <h1 className="text-4xl lg:text-5xl font-bold mb-2">{record.title}</h1>
            <h2 className={`text-2xl lg:text-3xl ${themeClasses.textSecondary}`}>{record.artist}</h2>
          </div>
          
          {/* Metadata - Single line with better truncation */}
          <div className="flex gap-3 items-center">
            {record.releaseYear && (
              <Badge variant="outline" className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} flex-shrink-0`}>
                {record.releaseYear}
              </Badge>
            )}
            {record.genre && (
              <Badge variant="outline" className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} max-w-sm`}>
                <span className="block truncate">{record.genre}</span>
              </Badge>
            )}
            {record.label && (
              <Badge variant="outline" className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} max-w-xs`}>
                <span className="block truncate">{record.label}</span>
              </Badge>
            )}
            <Badge variant="outline" className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} flex-shrink-0`}>
              {record.type}
            </Badge>
          </div>
          
          {/* Now Spinning Status */}
          {isCurrentlySpinning && (
            <div className={`flex items-center justify-between`}>
              <div className={`flex items-center gap-2 ${themeClasses.textSuccess}`}>
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="text-lg font-semibold">NOW SPINNING</span>
              </div>
              <ShareToStory 
                record={record}
                ownerName={ownerName}
                username={username}
              />
            </div>
          )}
          
          {/* Vinyl Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {isOwner ? (
              <>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={handlePickRandomRecord}
                  disabled={allRecords.length <= 1}
                  className={`w-12 h-12 rounded-full ${themeClasses.badgeBg} ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-stone-300'} ${themeClasses.text} disabled:opacity-50`}
                  title="Pick random record"
                >
                  <Shuffle className="w-6 h-6" />
                </Button>

                {isCurrentlySpinning ? (
                  <Button
                    variant="outline"
                    onClick={handleStopSpinning}
                    className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-stone-300'}`}
                    title="Stop Now Spinning"
                  >
                    ⏹️ Stop
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleMarkAsNowSpinning}
                    className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-stone-300'}`}
                    title="Mark as Now Spinning"
                  >
                    🎵 Now Spinning
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={`${themeClasses.badgeBg} ${themeClasses.badgeBorder} ${themeClasses.text} ${isDarkMode ? 'placeholder:text-white/40' : 'placeholder:text-stone-500/40'} w-32`}
                />
                <Button
                  variant="outline"
                  onClick={handleRequestNext}
                  disabled={!guestName}
                  className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-stone-300'} disabled:opacity-50`}
                  title="Request next record"
                >
                  🙋 Request Next
                </Button>
              </div>
            )}
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
            <Card className={`${themeClasses.cardBg} ${themeClasses.cardBorder} p-4`}>
              <p className={`${themeClasses.textSecondary} italic`}>&quot;{record.notes}&quot;</p>
            </Card>
          )}
          
          {/* Interactive Section */}
          <div className="flex gap-4">
            {isOwner ? (
              <>
                <Button
                  variant="outline"
                  className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-stone-300'}`}
                  onClick={() => setShowListeningLog(true)}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Add Listening Note
                </Button>
                <Button
                  variant="outline"
                  className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-stone-300'}`}
                  onClick={() => setShowComments(!showComments)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {showComments ? 'Hide Comments' : 'View Comments'}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className={`${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.badgeBorder} ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-stone-300'}`}
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {showComments ? 'Hide Comments' : 'Leave a Comment'}
              </Button>
            )}
          </div>
          
          {/* Comments Section */}
          {showComments && (
            <Card className={`${themeClasses.cardBg} ${themeClasses.cardBorder} p-4 space-y-4`}>
              {isOwner ? (
                <>
                  <h3 className={`${themeClasses.text} font-semibold`}>Guest Comments</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {loadingComments ? (
                      <p className={`${themeClasses.textMuted} text-sm`}>Loading comments...</p>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className={`${isDarkMode ? 'bg-white/5' : 'bg-stone-200/30'} p-3 rounded`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`${themeClasses.text} font-medium text-sm`}>{comment.guestName}</span>
                            <span className={`${themeClasses.textMuted} text-xs`}>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`${themeClasses.textSecondary} text-sm`}>{comment.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className={`${themeClasses.textMuted} text-sm`}>No comments yet. Be the first to leave one!</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className={`${themeClasses.text} font-semibold`}>Comments</h3>
                  
                  {/* Show existing comments to guests */}
                  {comments.length > 0 && (
                    <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className={`${isDarkMode ? 'bg-white/5' : 'bg-stone-200/30'} p-3 rounded`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`${themeClasses.text} font-medium text-sm`}>{comment.guestName}</span>
                            <span className={`${themeClasses.textMuted} text-xs`}>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`${themeClasses.textSecondary} text-sm`}>{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add new comment form */}
                  <div className={`space-y-3 ${comments.length > 0 ? 'border-t pt-3 ' + themeClasses.badgeBorder : ''}`}>
                    <h4 className={`${themeClasses.text} font-medium text-sm`}>Leave a note for {ownerName}</h4>
                    <Input
                      placeholder="Your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className={`${themeClasses.badgeBg} ${themeClasses.badgeBorder} ${themeClasses.text} ${isDarkMode ? 'placeholder:text-white/40' : 'placeholder:text-stone-500/40'}`}
                    />
                    <Textarea
                      placeholder="Share your thoughts about this record..."
                      value={guestComment}
                      onChange={(e) => setGuestComment(e.target.value)}
                      className={`${themeClasses.badgeBg} ${themeClasses.badgeBorder} ${themeClasses.text} ${isDarkMode ? 'placeholder:text-white/40' : 'placeholder:text-stone-500/40'} resize-none`}
                      rows={3}
                    />
                    <Button
                      onClick={handleAddGuestComment}
                      disabled={!guestName || !guestComment || submittingComment}
                      className={`w-full ${isDarkMode ? 'bg-white/20 hover:bg-white/30' : 'bg-stone-200 hover:bg-stone-300'} ${themeClasses.text}`}
                    >
                      {submittingComment ? 'Submitting...' : 'Submit Comment'}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
      
      {/* Bottom Info Bar */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 ${isDarkMode ? 'bg-gradient-to-t from-stone-900/80 to-transparent' : 'bg-gradient-to-t from-stone-100/80 to-transparent'}`}>
        <div className={`flex items-center justify-between ${themeClasses.textMuted} text-sm`}>
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
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Download, Instagram, Facebook, Loader2, X, Camera } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateStoryImage } from "@/lib/story-image-generator";
import type { VinylRecord } from "@/server/db";

interface ShareToStoryProps {
  record: VinylRecord;
  ownerName?: string;
  username?: string;
}

export default function ShareToStory({ 
  record, 
  ownerName = "Vinyl Collection",
  username
}: ShareToStoryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [supportsShare, setSupportsShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setSupportsShare(typeof navigator !== 'undefined' && 'share' in navigator);
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    try {
      const imageUrl = await generateStoryImage(record, ownerName, username);
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareToInstagram = async () => {
    if (!generatedImageUrl) return;
    
    // For mobile, try to open Instagram app
    if (isMobile) {
      // Try Instagram app deep link
      window.location.href = "instagram://story-camera";
      
      // Fallback to web share API after a short delay
      setTimeout(async () => {
        if (navigator.share) {
          try {
            const response = await fetch(generatedImageUrl);
            const blob = await response.blob();
            const file = new File([blob], `now-spinning-${record.artist}-${record.title}.jpg`, { type: 'image/jpeg' });
            
            await navigator.share({
              files: [file],
              title: 'Now Spinning',
              text: `Now spinning: ${record.artist} - ${record.title}`
            });
          } catch (error) {
            console.error('Error sharing to Instagram:', error);
          }
        }
      }, 500);
    } else {
      // On desktop, just download the image
      handleDownload();
    }
  };

  const handleShareToFacebook = async () => {
    if (!generatedImageUrl) return;
    
    // For mobile, try to open Facebook app
    if (isMobile) {
      // Try Facebook app deep link
      window.location.href = "fb://story";
      
      // Fallback to web share API after a short delay
      setTimeout(async () => {
        if (navigator.share) {
          try {
            const response = await fetch(generatedImageUrl);
            const blob = await response.blob();
            const file = new File([blob], `now-spinning-${record.artist}-${record.title}.jpg`, { type: 'image/jpeg' });
            
            await navigator.share({
              files: [file],
              title: 'Now Spinning',
              text: `Now spinning: ${record.artist} - ${record.title}`
            });
          } catch (error) {
            console.error('Error sharing to Facebook:', error);
          }
        }
      }, 500);
    } else {
      // On desktop, just download the image
      handleDownload();
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    
    // Since we're using blob URLs, we can download directly
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `now-spinning-${record.artist.replace(/\s+/g, '-')}-${record.title.replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!generatedImageUrl) return;
    
    if (navigator.share) {
      try {
        // Fetch the blob from the URL
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], `now-spinning-${record.artist}-${record.title}.jpg`, { type: 'image/jpeg' });
        
        await navigator.share({
          files: [file],
          title: 'Now Spinning',
          text: `Now spinning: ${record.artist} - ${record.title}`
        });
      } catch (error) {
        console.error("Error sharing:", error);
        // Fallback to download
        handleDownload();
      }
    } else {
      // Fallback to download if Web Share API is not available
      handleDownload();
    }
  };

  const triggerButton = (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      title="Share to Story"
    >
      <Camera className="w-4 h-4" />
      <span className="hidden sm:inline">Story</span>
    </Button>
  );

  const content = (
    <div className="w-full">
      {!generatedImageUrl ? (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="text-center px-4">
            <h3 className="text-lg font-semibold mb-2">Share Your Now Spinning</h3>
            <p className="text-sm text-muted-foreground">
              Create a story-ready image of this record
            </p>
          </div>
          
          <Button
            onClick={handleGenerateStory}
            disabled={isGenerating}
            size="lg"
            className="gap-2 h-14 px-8 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Create Story Image
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative mx-auto w-full max-w-[200px] aspect-[9/16] rounded-lg overflow-hidden shadow-xl bg-stone-900">
            <img
              src={generatedImageUrl}
              alt="Story preview"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Share Options - Mobile Optimized */}
          <div className="space-y-3 px-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={handleShareToInstagram}
                size="lg"
                className="gap-3 h-14 text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full"
              >
                <Instagram className="w-5 h-5" />
                Share to Instagram Story
              </Button>
              
              <Button
                onClick={handleShareToFacebook}
                size="lg"
                className="gap-3 h-14 text-base bg-blue-600 hover:bg-blue-700 w-full"
              >
                <Facebook className="w-5 h-5" />
                Share to Facebook Story
              </Button>
              
              {supportsShare && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="gap-3 h-14 text-base w-full"
                >
                  <Share2 className="w-5 h-5" />
                  Share to Other Apps
                </Button>
              )}
              
              <Button
                onClick={handleDownload}
                variant="outline"
                size="lg"
                className="gap-3 h-14 text-base w-full"
              >
                <Download className="w-5 h-5" />
                Save Image
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground pt-2">
              {isMobile ? "Tap to share to your story" : "Download and share to your story"}
            </p>
          </div>
          
          {/* Generate New Button */}
          <div className="pt-2 px-4">
            <Button
              onClick={() => {
                setGeneratedImageUrl(null);
                handleGenerateStory();
              }}
              variant="ghost"
              className="w-full"
            >
              Generate New Story
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Use Drawer for mobile, Dialog for desktop
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          {triggerButton}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-center">
            <DrawerTitle>Share to Story</DrawerTitle>
            <DrawerClose className="absolute right-4 top-4">
              <X className="w-5 h-5" />
            </DrawerClose>
          </DrawerHeader>
          <div className="overflow-y-auto pb-6">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share to Story</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
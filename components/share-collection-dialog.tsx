"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, CheckCircle } from "lucide-react";
import type { User } from "@/server/db";

interface ShareCollectionDialogProps {
  user: User;
  iconOnly?: boolean;
}

export default function ShareCollectionDialog({ user, iconOnly = false }: ShareCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate the public URL
  const publicUrl = user.username 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${user.username}`
    : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Don't show if user doesn't have username or isn't public
  if (!user.username || !user.isPublic) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={iconOnly ? "p-2" : "gap-2"} size={iconOnly ? "sm" : "default"}>
          <Share2 className="w-4 h-4" />
          {!iconOnly && "Share Collection"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share this link with friends so they can browse your vinyl collection.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="share-url">Public Collection URL</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={publicUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> Your collection is currently public. 
              Visitors can view your records but cannot add, edit, or delete them.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
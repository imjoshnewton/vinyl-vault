"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, Loader2 } from "lucide-react";
import { refreshArtworkAction } from "@/actions/artwork.actions";

interface RefreshArtworkButtonProps {
  recordId: string;
  onSuccess?: (newUrl: string, source: string) => void;
}

export default function RefreshArtworkButton({ recordId, onSuccess }: RefreshArtworkButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const result = await refreshArtworkAction(recordId);
      
      if (result.success && result.newUrl) {
        onSuccess?.(result.newUrl, result.source || 'Unknown');
        // Could show a toast notification here
      } else {
        console.error("Failed to refresh artwork:", result.error);
        // Could show error toast
      }
    } catch (error) {
      console.error("Error refreshing artwork:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="gap-2"
      title="Refresh artwork from external sources"
    >
      {isRefreshing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Image className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {isRefreshing ? "Refreshing..." : "Refresh Art"}
      </span>
    </Button>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { bulkRefreshArtworkAction } from "@/actions/artwork.actions";

interface RefreshResult {
  record: string;
  newUrl: string;
  source: string;
}

export default function BulkArtworkRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    updated?: number;
    total?: number;
    results?: RefreshResult[];
    error?: string;
  } | null>(null);

  const handleBulkRefresh = async () => {
    setIsRefreshing(true);
    setResults(null);
    
    try {
      const result = await bulkRefreshArtworkAction(20); // Process 20 records at a time
      setResults(result);
    } catch (error) {
      console.error("Error in bulk refresh:", error);
      setResults({
        success: false,
        error: "Failed to refresh artwork"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Upgrade Album Artwork
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Enhance your collection with higher resolution album artwork from multiple sources including 
          MusicBrainz and enhanced Discogs images.
        </div>
        
        <Button
          onClick={handleBulkRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Upgrading Artwork...
            </>
          ) : (
            <>
              <Image className="w-4 h-4" />
              Upgrade Collection Artwork
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-3">
            {results.success ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Successfully updated {results.updated || 0} of {results.total || 0} records
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-4 h-4" />
                <span>{results.error}</span>
              </div>
            )}

            {results.results && results.results.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Updated Records:</div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {results.results.map((result, index) => (
                    <div key={index} className="text-xs bg-muted p-2 rounded">
                      <div className="font-medium">{result.record}</div>
                      <div className="text-muted-foreground">Source: {result.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          This will process up to 20 records at a time. Run multiple times for larger collections.
        </div>
      </CardContent>
    </Card>
  );
}
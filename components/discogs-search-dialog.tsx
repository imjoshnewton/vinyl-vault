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
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { searchDiscogsAction, addDiscogsReleaseAction } from "@/actions/discogs.actions";

interface SearchResult {
  id: number;
  title: string;
  year?: string;
  format?: string[];
  label?: string[];
  genre?: string[];
  thumb?: string;
}

export default function DiscogsSearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string>();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(undefined);
    
    try {
      const result = await searchDiscogsAction(query);
      if (result.success && result.results) {
        setResults(result.results);
      } else {
        setError(result.error || "Search failed");
        setResults([]);
      }
    } catch {
      setError("Failed to search Discogs");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddRelease = async (releaseId: number) => {
    setAddingIds(prev => new Set([...prev, releaseId]));
    setError(undefined);
    
    try {
      const result = await addDiscogsReleaseAction(releaseId);
      if (result.success) {
        // Remove from results on success
        setResults(prev => prev.filter(r => r.id !== releaseId));
      } else {
        setError(result.error || "Failed to add release");
      }
    } catch {
      setError("Failed to add release");
    } finally {
      setAddingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(releaseId);
        return newSet;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="w-4 h-4" />
          Search Discogs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Discogs Database
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search for artist, album, or song..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !query.trim()}
              className="gap-2"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {result.thumb ? (
                    <Image
                      src={result.thumb}
                      alt={result.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', result.thumb);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-xs text-center">
                      No Image
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2">{result.title}</h3>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.year && (
                      <Badge variant="outline" className="text-xs">
                        {result.year}
                      </Badge>
                    )}
                    {result.format?.[0] && (
                      <Badge variant="outline" className="text-xs">
                        {result.format[0]}
                      </Badge>
                    )}
                    {result.label?.[0] && (
                      <Badge variant="secondary" className="text-xs">
                        {result.label[0]}
                      </Badge>
                    )}
                  </div>
                  
                  {result.genre && result.genre.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.genre.slice(0, 3).join(", ")}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://www.discogs.com/release/${result.id}`, "_blank")}
                    className="gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddRelease(result.id)}
                    disabled={addingIds.has(result.id)}
                    className="gap-1"
                  >
                    {addingIds.has(result.id) ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    Add
                  </Button>
                </div>
              </div>
            ))}
            
            {results.length === 0 && !isSearching && query && (
              <div className="text-center py-8 text-muted-foreground">
                No results found. Try a different search term.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
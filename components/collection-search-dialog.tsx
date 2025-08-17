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
import { Search } from "lucide-react";
import type { VinylRecord } from "@/server/db";

interface CollectionSearchDialogProps {
  records: VinylRecord[];
  onSelectRecord?: (record: VinylRecord) => void;
}

export default function CollectionSearchDialog({ records, onSelectRecord }: CollectionSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredRecords = records.filter(record => {
    const query = searchQuery.toLowerCase();
    return (
      record.artist?.toLowerCase().includes(query) ||
      record.title?.toLowerCase().includes(query) ||
      record.genre?.toLowerCase().includes(query) ||
      record.label?.toLowerCase().includes(query)
    );
  });

  const handleSelect = (record: VinylRecord) => {
    if (onSelectRecord) {
      onSelectRecord(record);
    }
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="w-4 h-4" />
          <span>Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Collection
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search by artist, album, genre, or label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            autoFocus
          />
          
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {searchQuery && filteredRecords.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No records found matching &quot;{searchQuery}&quot;
              </p>
            )}
            
            {filteredRecords.slice(0, 20).map((record) => (
              <div
                key={record.id}
                onClick={() => handleSelect(record)}
                className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{record.artist}</div>
                    <div className="text-sm text-muted-foreground">{record.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {record.genre && (
                        <span className="text-xs text-muted-foreground">{record.genre}</span>
                      )}
                      {record.releaseYear && (
                        <span className="text-xs text-muted-foreground">• {record.releaseYear}</span>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                    {record.type}
                  </span>
                </div>
              </div>
            ))}
            
            {!searchQuery && (
              <p className="text-center text-muted-foreground py-4">
                Start typing to search your collection...
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
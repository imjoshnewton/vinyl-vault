"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { VinylRecord } from "@/server/db";

interface ExportCollectionDialogProps {
  records: VinylRecord[];
  username: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ExportCollectionDialog({ 
  records, 
  username, 
  open,
  onOpenChange 
}: ExportCollectionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const [format, setFormat] = useState<"simple" | "detailed" | "json">("simple");
  const [copied, setCopied] = useState(false);

  const generateExport = () => {
    const actualRecords = records.filter(r => !r.isWishlist);
    const wishlistRecords = records.filter(r => r.isWishlist);

    switch (format) {
      case "simple":
        return generateSimpleList(actualRecords, wishlistRecords);
      case "detailed":
        return generateDetailedList(actualRecords, wishlistRecords);
      case "json":
        return generateJSONExport(actualRecords, wishlistRecords);
      default:
        return "";
    }
  };

  const generateSimpleList = (collection: VinylRecord[], wishlist: VinylRecord[]) => {
    let output = `# ${username}'s Vinyl Collection\n\n`;
    
    if (collection.length > 0) {
      output += `## Collection (${collection.length} records)\n\n`;
      collection.forEach((record, index) => {
        output += `${index + 1}. ${record.artist} - ${record.title}`;
        if (record.releaseYear) output += ` (${record.releaseYear})`;
        output += '\n';
      });
      output += '\n';
    }

    if (wishlist.length > 0) {
      output += `## Wishlist (${wishlist.length} records)\n\n`;
      wishlist.forEach((record, index) => {
        output += `${index + 1}. ${record.artist} - ${record.title}`;
        if (record.releaseYear) output += ` (${record.releaseYear})`;
        output += '\n';
      });
    }

    return output;
  };

  const generateDetailedList = (collection: VinylRecord[], wishlist: VinylRecord[]) => {
    let output = `# ${username}'s Vinyl Collection - Detailed\n\n`;
    
    if (collection.length > 0) {
      output += `## Collection (${collection.length} records)\n\n`;
      collection.forEach((record, index) => {
        output += `### ${index + 1}. ${record.artist} - ${record.title}\n`;
        if (record.releaseYear) output += `- Year: ${record.releaseYear}\n`;
        if (record.genre) output += `- Genre: ${record.genre}\n`;
        if (record.label) output += `- Label: ${record.label}\n`;
        if (record.type) output += `- Format: ${record.type}\n`;
        if (record.condition) output += `- Condition: ${record.condition}\n`;
        if (record.rating) output += `- My Rating: ${record.rating}/5 stars\n`;
        if (record.playCount && record.playCount > 0) output += `- Play Count: ${record.playCount}\n`;
        if (record.notes) output += `- Notes: ${record.notes}\n`;
        output += '\n';
      });
    }

    if (wishlist.length > 0) {
      output += `## Wishlist (${wishlist.length} records)\n\n`;
      wishlist.forEach((record, index) => {
        output += `### ${index + 1}. ${record.artist} - ${record.title}\n`;
        if (record.releaseYear) output += `- Year: ${record.releaseYear}\n`;
        if (record.genre) output += `- Genre: ${record.genre}\n`;
        if (record.label) output += `- Label: ${record.label}\n`;
        if (record.notes) output += `- Notes: ${record.notes}\n`;
        output += '\n';
      });
    }

    return output;
  };

  const generateJSONExport = (collection: VinylRecord[], wishlist: VinylRecord[]) => {
    const exportData = {
      owner: username,
      exported_at: new Date().toISOString(),
      collection: collection.map(record => ({
        artist: record.artist,
        title: record.title,
        year: record.releaseYear,
        genre: record.genre,
        label: record.label,
        format: record.type,
        condition: record.condition,
        rating: record.rating,
        play_count: record.playCount,
        notes: record.notes,
        catalog_number: record.catalogNumber,
      })),
      wishlist: wishlist.map(record => ({
        artist: record.artist,
        title: record.title,
        year: record.releaseYear,
        genre: record.genre,
        label: record.label,
        notes: record.notes,
      })),
      stats: {
        total_collection: collection.length,
        total_wishlist: wishlist.length,
        genres: [...new Set(collection.map(r => r.genre).filter(Boolean))],
        labels: [...new Set(collection.map(r => r.label).filter(Boolean))],
        years: [...new Set(collection.map(r => r.releaseYear).filter(Boolean))].sort(),
      }
    };

    return JSON.stringify(exportData, null, 2);
  };

  const handleCopy = async () => {
    try {
      const exportText = generateExport();
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      toast.success("Collection copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const exportText = generateExport();
    const fileExtension = format === "json" ? "json" : "md";
    const fileName = `${username}-vinyl-collection.${fileExtension}`;
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Collection downloaded as ${fileName}`);
  };

  const exportText = generateExport();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export Collection
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={format} onValueChange={(value: "simple" | "detailed" | "json") => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple List (LLM Friendly)</SelectItem>
                <SelectItem value="detailed">Detailed List (Full Info)</SelectItem>
                <SelectItem value="json">JSON (Structured Data)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {format === "simple" && "A clean, numbered list perfect for AI recommendations and analysis"}
            {format === "detailed" && "Complete information including ratings, notes, and metadata"}
            {format === "json" && "Structured data format for developers and advanced analysis"}
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <Textarea
              value={exportText}
              readOnly
              className="font-mono text-xs resize-none flex-1 min-h-[300px]"
              placeholder="Export preview will appear here..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCopy}
              className="gap-2 flex-1"
              variant={copied ? "default" : "outline"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Great for getting AI recommendations, sharing with friends, or analyzing your collection!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
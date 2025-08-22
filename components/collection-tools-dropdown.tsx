"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, FileText, Check, MoreVertical, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import ExportCollectionDialog from "./export-collection-dialog";
import type { VinylRecord } from "@/server/db";

interface CollectionToolsDropdownProps {
  records: VinylRecord[];
  username: string;
}

export default function CollectionToolsDropdown({ records, username }: CollectionToolsDropdownProps) {
  const [copied, setCopied] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const generateSimpleList = () => {
    const actualRecords = records.filter(r => !r.isWishlist);
    const wishlistRecords = records.filter(r => r.isWishlist);
    
    let output = `# ${username}'s Vinyl Collection\n\n`;
    
    if (actualRecords.length > 0) {
      output += `## Collection (${actualRecords.length} records)\n\n`;
      actualRecords
        .sort((a, b) => a.artist.localeCompare(b.artist))
        .forEach((record, index) => {
          output += `${index + 1}. ${record.artist} - ${record.title}`;
          if (record.releaseYear) output += ` (${record.releaseYear})`;
          if (record.genre) output += ` [${record.genre}]`;
          output += '\n';
        });
      output += '\n';
    }

    if (wishlistRecords.length > 0) {
      output += `## Wishlist (${wishlistRecords.length} records)\n\n`;
      wishlistRecords
        .sort((a, b) => a.artist.localeCompare(b.artist))
        .forEach((record, index) => {
          output += `${index + 1}. ${record.artist} - ${record.title}`;
          if (record.releaseYear) output += ` (${record.releaseYear})`;
          if (record.genre) output += ` [${record.genre}]`;
          output += '\n';
        });
    }

    // Add summary stats
    const genres = [...new Set(actualRecords.map(r => r.genre).filter(Boolean))];
    const years = [...new Set(actualRecords.map(r => r.releaseYear).filter(Boolean))].sort();
    
    output += `\n## Summary\n`;
    output += `- Total Records: ${actualRecords.length}\n`;
    output += `- Wishlist Items: ${wishlistRecords.length}\n`;
    if (genres.length > 0) {
      output += `- Genres: ${genres.join(', ')}\n`;
    }
    if (years.length > 0) {
      output += `- Years: ${years[0]} - ${years[years.length - 1]}\n`;
    }

    return output;
  };

  const handleQuickCopy = async () => {
    try {
      const listText = generateSimpleList();
      await navigator.clipboard.writeText(listText);
      setCopied(true);
      toast.success("Collection copied to clipboard!", {
        description: "Perfect for sharing with AI assistants!"
      });
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Failed to copy to clipboard", {
        description: "Please try again"
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <MoreVertical className="w-4 h-4" />
            <span className="hidden sm:inline">Tools</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Collection Tools</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleQuickCopy}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy List
              </>
            )}
            <span className="ml-auto text-xs text-muted-foreground">Quick</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Export Options
            <span className="ml-auto text-xs text-muted-foreground">Advanced</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Dialog - controlled programmatically */}
      <ExportCollectionDialog 
        records={records} 
        username={username}
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
    </>
  );
}
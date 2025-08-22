"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { VinylRecord } from "@/server/db";

interface CopyCollectionButtonProps {
  records: VinylRecord[];
  username: string;
}

export default function CopyCollectionButton({ records, username }: CopyCollectionButtonProps) {
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    try {
      const listText = generateSimpleList();
      await navigator.clipboard.writeText(listText);
      setCopied(true);
      toast.success("Collection copied to clipboard!", {
        description: "Perfect for sharing with AI assistants or friends!"
      });
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Failed to copy to clipboard", {
        description: "Please try again"
      });
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant={copied ? "default" : "outline"}
      className="gap-2"
      title="Copy collection list to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span className="hidden sm:inline">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">Copy List</span>
        </>
      )}
    </Button>
  );
}
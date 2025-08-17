"use client";

import { useState } from "react";
import type { VinylRecord } from "@/server/db";
import { ChevronUp, ChevronDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditRecordDialog from "@/components/edit-record-dialog";
import MobileRecordCard from "@/components/mobile-record-card";
import { recordPlayAction } from "@/actions/records.actions";

interface PublicRecordsTableProps {
  records: VinylRecord[];
  isOwner: boolean;
}

type SortField = "artist" | "title" | "genre" | "releaseYear";
type SortOrder = "asc" | "desc";

export default function PublicRecordsTable({ records, isOwner }: PublicRecordsTableProps) {
  const [sortField, setSortField] = useState<SortField>("artist");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  
  const sortedRecords = [...records].sort((a, b) => {
    const aVal = a[sortField] ?? "";
    const bVal = b[sortField] ?? "";
    
    if (sortOrder === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
  
  const handlePlay = async (record: VinylRecord) => {
    if (!isOwner) return;
    await recordPlayAction(record.id);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div>
      {/* Mobile view - Cards */}
      <div className="sm:hidden">
        {/* Mobile sorting controls */}
        <div className="sticky top-16 z-10 flex justify-center gap-2 overflow-x-auto px-4 py-3 border-b bg-background">
          <Button 
            variant={sortField === "artist" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("artist")}
            className="gap-1 whitespace-nowrap"
          >
            Artist
            {sortField === "artist" && <SortIcon field="artist" />}
          </Button>
          <Button 
            variant={sortField === "title" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("title")}
            className="gap-1 whitespace-nowrap"
          >
            Album
            {sortField === "title" && <SortIcon field="title" />}
          </Button>
          <Button 
            variant={sortField === "genre" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("genre")}
            className="gap-1 whitespace-nowrap"
          >
            Genre
            {sortField === "genre" && <SortIcon field="genre" />}
          </Button>
          <Button 
            variant={sortField === "releaseYear" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("releaseYear")}
            className="gap-1 whitespace-nowrap"
          >
            Year
            {sortField === "releaseYear" && <SortIcon field="releaseYear" />}
          </Button>
        </div>
        
        {/* Mobile cards */}
        <div className="space-y-3 p-4">
          {sortedRecords.map((record) => (
            <MobileRecordCard key={record.id} record={record} isOwner={isOwner} />
          ))}
        </div>
      </div>
      
      {/* Desktop view - Table */}
      <div className="hidden sm:block relative overflow-auto max-h-[70vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="bg-background">
                <button 
                  onClick={() => handleSort("artist")}
                  className="flex items-center gap-1 font-semibold hover:text-primary"
                >
                  Artist
                  <SortIcon field="artist" />
                </button>
              </TableHead>
              <TableHead className="bg-background">
                <button 
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-1 font-semibold hover:text-primary"
                >
                  Album
                  <SortIcon field="title" />
                </button>
              </TableHead>
              <TableHead className="bg-background">
                <button 
                  onClick={() => handleSort("genre")}
                  className="flex items-center gap-1 font-semibold hover:text-primary"
                >
                  Genre
                  <SortIcon field="genre" />
                </button>
              </TableHead>
              <TableHead className="bg-background">
                <button 
                  onClick={() => handleSort("releaseYear")}
                  className="flex items-center gap-1 font-semibold hover:text-primary"
                >
                  Year
                  <SortIcon field="releaseYear" />
                </button>
              </TableHead>
              <TableHead className="bg-background">Label</TableHead>
              <TableHead className="bg-background">Type</TableHead>
              <TableHead className="bg-background">Plays</TableHead>
              {isOwner && <TableHead className="bg-background">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.artist}</TableCell>
                <TableCell>{record.title}</TableCell>
                <TableCell className="text-muted-foreground">{record.genre || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{record.releaseYear || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{record.label || "-"}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                    {record.type}
                  </span>
                </TableCell>
                <TableCell>{record.playCount}</TableCell>
                {isOwner && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePlay(record)}
                        className="gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Play
                      </Button>
                      <EditRecordDialog record={record} />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {sortedRecords.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {isOwner 
            ? "No records found. Add your first vinyl to get started!"
            : "This collection is empty."
          }
        </div>
      )}
    </div>
  );
}
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
import { recordPlayAction } from "@/actions/records.actions";

interface RecordsTableProps {
  records: VinylRecord[];
}

type SortField = "artist" | "title" | "releaseYear" | "playCount";
type SortOrder = "asc" | "desc";

export default function RecordsTable({ records }: RecordsTableProps) {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button 
                onClick={() => handleSort("artist")}
                className="flex items-center gap-1 font-semibold hover:text-purple-600"
              >
                Artist
                <SortIcon field="artist" />
              </button>
            </TableHead>
            <TableHead>
              <button 
                onClick={() => handleSort("title")}
                className="flex items-center gap-1 font-semibold hover:text-purple-600"
              >
                Title
                <SortIcon field="title" />
              </button>
            </TableHead>
            <TableHead>Label</TableHead>
            <TableHead>
              <button 
                onClick={() => handleSort("releaseYear")}
                className="flex items-center gap-1 font-semibold hover:text-purple-600"
              >
                Year
                <SortIcon field="releaseYear" />
              </button>
            </TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>
              <button 
                onClick={() => handleSort("playCount")}
                className="flex items-center gap-1 font-semibold hover:text-purple-600"
              >
                Plays
                <SortIcon field="playCount" />
              </button>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecords.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.artist}</TableCell>
              <TableCell>{record.title}</TableCell>
              <TableCell className="text-muted-foreground">{record.label || "-"}</TableCell>
              <TableCell className="text-muted-foreground">{record.releaseYear || "-"}</TableCell>
              <TableCell className="text-muted-foreground">{record.genre || "-"}</TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  {record.type}
                </span>
              </TableCell>
              <TableCell>{record.playCount}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {sortedRecords.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No records found. Add your first vinyl to get started!
        </div>
      )}
    </div>
  );
}
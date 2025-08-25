import type { VinylRecord } from "@/server/db";

/**
 * Stable sorting utility for vinyl records
 * Ensures consistent order even after updates
 */
export function sortRecords(
  records: VinylRecord[],
  sortBy: "artist" | "title" | "releaseYear" | "createdAt" = "artist",
  sortOrder: "asc" | "desc" = "asc"
): VinylRecord[] {
  return [...records].sort((a, b) => {
    let comparison = 0;
    
    // Primary sort
    switch (sortBy) {
      case "artist":
        comparison = (a.artist || "").localeCompare(b.artist || "", undefined, { sensitivity: 'base' });
        break;
      case "title":
        comparison = (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: 'base' });
        break;
      case "releaseYear":
        comparison = (a.releaseYear || 0) - (b.releaseYear || 0);
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    // If primary sort is equal and not sorting by title, use title as secondary
    if (comparison === 0 && sortBy !== "title") {
      comparison = (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: 'base' });
    }
    
    // If still equal, use ID as tertiary sort for ultimate stability
    if (comparison === 0) {
      comparison = a.id.localeCompare(b.id);
    }
    
    // Apply sort order
    return sortOrder === "desc" ? -comparison : comparison;
  });
}

/**
 * Group records by a specific field
 */
export function groupRecords<K extends keyof VinylRecord>(
  records: VinylRecord[],
  groupBy: K
): Map<VinylRecord[K], VinylRecord[]> {
  const grouped = new Map<VinylRecord[K], VinylRecord[]>();
  
  for (const record of records) {
    const key = record[groupBy];
    const group = grouped.get(key) || [];
    group.push(record);
    grouped.set(key, group);
  }
  
  return grouped;
}

/**
 * Group records by artist with stable sorting within groups
 */
export function groupRecordsByArtist(records: VinylRecord[]): Map<string, VinylRecord[]> {
  const grouped = new Map<string, VinylRecord[]>();
  
  // First sort all records for consistency
  const sorted = sortRecords(records, "artist", "asc");
  
  for (const record of sorted) {
    const artist = record.artist || "Unknown Artist";
    const group = grouped.get(artist) || [];
    group.push(record);
    grouped.set(artist, group);
  }
  
  // Sort records within each artist group by title
  for (const [artist, artistRecords] of grouped) {
    grouped.set(artist, sortRecords(artistRecords, "title", "asc"));
  }
  
  return grouped;
}

/**
 * Get a stable sort key for a record
 * Useful for maintaining position in lists after updates
 */
export function getRecordSortKey(
  record: VinylRecord,
  sortBy: "artist" | "title" | "releaseYear" | "createdAt" = "artist"
): string {
  const primary = {
    artist: record.artist?.toLowerCase() || "",
    title: record.title?.toLowerCase() || "",
    releaseYear: String(record.releaseYear || 0).padStart(4, "0"),
    createdAt: record.createdAt.toISOString(),
  }[sortBy];
  
  // Secondary sort by title (if not primary)
  const secondary = sortBy !== "title" ? record.title?.toLowerCase() || "" : "";
  
  // Tertiary sort by ID for ultimate stability
  const tertiary = record.id;
  
  return `${primary}|${secondary}|${tertiary}`;
}

/**
 * Preserve scroll position when updating sorted lists
 */
export function preserveScrollPosition<T>(
  oldList: T[],
  newList: T[],
  getKey: (item: T) => string,
  currentScrollTop: number
): number {
  if (oldList.length === 0 || newList.length === 0) {
    return currentScrollTop;
  }
  
  // Find the item that was at the top of the viewport
  const viewportItem = oldList[Math.floor(currentScrollTop / 100)]; // Assuming ~100px per item
  if (!viewportItem) return currentScrollTop;
  
  const itemKey = getKey(viewportItem);
  const newIndex = newList.findIndex(item => getKey(item) === itemKey);
  
  if (newIndex === -1) return currentScrollTop;
  
  // Calculate new scroll position
  return newIndex * 100; // Adjust based on actual item height
}
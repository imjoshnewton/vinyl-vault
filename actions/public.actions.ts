"use server";

import { publicService } from "@/services/public.service";
import type { VinylRecord, User } from "@/server/db";

export async function getPublicCollectionAction(
  username: string,
  options?: {
    type?: "LP" | "Single" | "EP";
    sortBy?: "artist" | "title" | "releaseYear" | "createdAt";
    sortOrder?: "asc" | "desc";
    search?: string;
  }
): Promise<{ user: User; records: VinylRecord[] } | null> {
  return publicService.getPublicUserRecords(username, options);
}

export async function getPublicStatsAction(username: string) {
  return publicService.getPublicUserStats(username);
}
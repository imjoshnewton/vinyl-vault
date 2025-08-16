"use server";

import { revalidatePath } from "next/cache";
import { recordsService } from "@/services/records.service";
import type { NewVinylRecord, VinylRecord } from "@/server/db";

export async function getRecordsAction(options?: {
  type?: "LP" | "Single" | "EP";
  isWishlist?: boolean;
  sortBy?: "artist" | "title" | "releaseYear" | "createdAt";
  sortOrder?: "asc" | "desc";
  search?: string;
}): Promise<VinylRecord[]> {
  return recordsService.getUserRecords(options);
}

export async function getRecordAction(id: string): Promise<VinylRecord | null> {
  return recordsService.getRecord(id);
}

export async function createRecordAction(
  data: Omit<NewVinylRecord, "userId">
): Promise<VinylRecord> {
  const record = await recordsService.createRecord(data);
  revalidatePath("/collection");
  revalidatePath("/u", "layout"); // Revalidate all public collection pages
  return record;
}

export async function updateRecordAction(
  id: string,
  data: Partial<Omit<NewVinylRecord, "userId">>
): Promise<VinylRecord> {
  const record = await recordsService.updateRecord(id, data);
  revalidatePath("/collection");
  revalidatePath("/u", "layout"); // Revalidate all public collection pages
  return record;
}

export async function deleteRecordAction(id: string): Promise<void> {
  await recordsService.deleteRecord(id);
  revalidatePath("/collection");
  revalidatePath("/u", "layout"); // Revalidate all public collection pages
}

export async function getRandomRecordAction(
  type?: "LP" | "Single" | "EP"
): Promise<VinylRecord | null> {
  return recordsService.getRandomRecord(type);
}

export async function recordPlayAction(recordId: string): Promise<void> {
  await recordsService.recordPlay(recordId);
  revalidatePath("/collection");
}

export async function getStatsAction() {
  return recordsService.getStats();
}

export async function toggleWishlistAction(
  id: string,
  isWishlist: boolean
): Promise<VinylRecord> {
  const record = await recordsService.updateRecord(id, { isWishlist });
  revalidatePath("/collection");
  return record;
}
import { recordsRepository } from "@/data/records.repository";
import { authService } from "./auth.service";
import type { NewVinylRecord, VinylRecord } from "@/server/db";

export const recordsService = {
  async getUserRecords(options?: {
    type?: "LP" | "Single" | "EP";
    isWishlist?: boolean;
    sortBy?: "artist" | "title" | "releaseYear" | "createdAt";
    sortOrder?: "asc" | "desc";
    search?: string;
  }): Promise<VinylRecord[]> {
    const user = await authService.requireUser();
    return recordsRepository.findByUserId(user.id, options);
  },

  async getRecord(id: string): Promise<VinylRecord | null> {
    const user = await authService.requireUser();
    const record = await recordsRepository.findById(id);
    
    if (record && record.userId !== user.id) {
      throw new Error("Unauthorized");
    }
    
    return record;
  },

  async createRecord(data: Omit<NewVinylRecord, "userId">): Promise<VinylRecord> {
    const user = await authService.requireUser();
    return recordsRepository.create({
      ...data,
      userId: user.id,
    });
  },

  async updateRecord(id: string, data: Partial<Omit<NewVinylRecord, "userId">>): Promise<VinylRecord> {
    const user = await authService.requireUser();
    const record = await recordsRepository.findById(id);
    
    if (!record || record.userId !== user.id) {
      throw new Error("Unauthorized");
    }
    
    return recordsRepository.update(id, data);
  },

  async deleteRecord(id: string): Promise<void> {
    const user = await authService.requireUser();
    const record = await recordsRepository.findById(id);
    
    if (!record || record.userId !== user.id) {
      throw new Error("Unauthorized");
    }
    
    return recordsRepository.delete(id);
  },

  async getRandomRecord(type?: "LP" | "Single" | "EP"): Promise<VinylRecord | null> {
    const user = await authService.requireUser();
    return recordsRepository.getRandomRecord(user.id, type);
  },

  async recordPlay(recordId: string): Promise<void> {
    const user = await authService.requireUser();
    const record = await recordsRepository.findById(recordId);
    
    if (!record || record.userId !== user.id) {
      throw new Error("Unauthorized");
    }
    
    return recordsRepository.recordPlay(recordId, user.id);
  },

  async getStats() {
    const user = await authService.requireUser();
    return recordsRepository.getStats(user.id);
  },
};
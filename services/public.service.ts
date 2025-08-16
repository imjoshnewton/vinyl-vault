import { usersRepository } from "@/data/users.repository";
import { recordsRepository } from "@/data/records.repository";
import type { User, VinylRecord } from "@/server/db";

export const publicService = {
  async getPublicUserByUsername(username: string): Promise<User | null> {
    const user = await usersRepository.findByUsername(username);
    
    if (!user || !user.isPublic) {
      return null;
    }
    
    return user;
  },

  async getPublicUserRecords(
    username: string,
    options?: {
      type?: "LP" | "Single" | "EP";
      sortBy?: "artist" | "title" | "releaseYear" | "createdAt";
      sortOrder?: "asc" | "desc";
      search?: string;
    }
  ): Promise<{ user: User; records: VinylRecord[] } | null> {
    const user = await this.getPublicUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const records = await recordsRepository.findByUserId(user.id, {
      ...options,
      isWishlist: false, // Only show owned records publicly
    });
    
    return { user, records };
  },

  async getPublicUserStats(username: string) {
    const user = await this.getPublicUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const stats = await recordsRepository.getStats(user.id);
    
    return {
      user,
      stats: {
        ...stats,
        wishlistCount: 0, // Don't show wishlist in public stats
      },
    };
  },
};
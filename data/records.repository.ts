import { db, vinylRecords, playHistory, type NewVinylRecord, type VinylRecord, type NewPlayHistory } from "@/server/db";
import { eq, and, desc, asc, sql, ilike, or } from "drizzle-orm";

export const recordsRepository = {
  async findById(id: string): Promise<VinylRecord | null> {
    const result = await db
      .select()
      .from(vinylRecords)
      .where(eq(vinylRecords.id, id))
      .limit(1);
    
    return result[0] ?? null;
  },

  async findByUserId(
    userId: string,
    options?: {
      type?: "LP" | "Single" | "EP";
      isWishlist?: boolean;
      sortBy?: "artist" | "title" | "releaseYear" | "createdAt";
      sortOrder?: "asc" | "desc";
      search?: string;
    }
  ): Promise<VinylRecord[]> {
    // Build conditions
    const conditions = [eq(vinylRecords.userId, userId)];
    
    if (options?.type !== undefined) {
      conditions.push(eq(vinylRecords.type, options.type));
    }
    
    if (options?.isWishlist !== undefined) {
      conditions.push(eq(vinylRecords.isWishlist, options.isWishlist));
    }
    
    if (options?.search) {
      conditions.push(
        or(
          ilike(vinylRecords.artist, `%${options.search}%`),
          ilike(vinylRecords.title, `%${options.search}%`),
          ilike(vinylRecords.label, `%${options.search}%`)
        )!
      );
    }

    // Apply sorting
    const sortColumn = {
      artist: vinylRecords.artist,
      title: vinylRecords.title,
      releaseYear: vinylRecords.releaseYear,
      createdAt: vinylRecords.createdAt,
    }[options?.sortBy ?? "artist"];

    const query = db
      .select()
      .from(vinylRecords)
      .where(and(...conditions))
      .orderBy(options?.sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn));

    return await query;
  },

  async create(data: NewVinylRecord): Promise<VinylRecord> {
    const result = await db
      .insert(vinylRecords)
      .values(data)
      .returning();
    
    return result[0]!;
  },

  async update(id: string, data: Partial<NewVinylRecord>): Promise<VinylRecord> {
    const result = await db
      .update(vinylRecords)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(vinylRecords.id, id))
      .returning();
    
    return result[0]!;
  },

  async delete(id: string): Promise<void> {
    await db
      .delete(vinylRecords)
      .where(eq(vinylRecords.id, id));
  },

  async getRandomRecord(userId: string, type?: "LP" | "Single" | "EP"): Promise<VinylRecord | null> {
    const conditions = [
      eq(vinylRecords.userId, userId),
      eq(vinylRecords.isWishlist, false),
    ];
    
    if (type) {
      conditions.push(eq(vinylRecords.type, type));
    }

    const result = await db
      .select()
      .from(vinylRecords)
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    
    return result[0] ?? null;
  },

  async recordPlay(recordId: string, userId: string): Promise<void> {
    // Update play count and last played
    await db
      .update(vinylRecords)
      .set({
        playCount: sql`${vinylRecords.playCount} + 1`,
        lastPlayedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vinylRecords.id, recordId));

    // Add to play history
    await db
      .insert(playHistory)
      .values({
        recordId,
        userId,
      });
  },

  async getStats(userId: string) {
    const [stats] = await db
      .select({
        totalRecords: sql<number>`count(*)`,
        totalLPs: sql<number>`count(*) filter (where ${vinylRecords.type} = 'LP')`,
        totalSingles: sql<number>`count(*) filter (where ${vinylRecords.type} = 'Single')`,
        totalEPs: sql<number>`count(*) filter (where ${vinylRecords.type} = 'EP')`,
        wishlistCount: sql<number>`count(*) filter (where ${vinylRecords.isWishlist} = true)`,
        totalPlays: sql<number>`coalesce(sum(${vinylRecords.playCount}), 0)`,
      })
      .from(vinylRecords)
      .where(eq(vinylRecords.userId, userId));

    return stats;
  },
};
"use server";

import { db } from "@/server/db";
import { vinylRecords } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { artworkService } from "@/services/artwork.service";
import { auth } from "@clerk/nextjs/server";

/**
 * Refresh artwork for a specific record
 */
export async function refreshArtworkAction(recordId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the record
    const record = await db.query.vinylRecords.findFirst({
      where: eq(vinylRecords.id, recordId)
    });

    if (!record) {
      return { success: false, error: "Record not found" };
    }

    if (record.userId !== userId) {
      return { success: false, error: "Not authorized" };
    }

    // Search for better artwork
    const artworkResults = await artworkService.getBestArtwork(
      record.artist,
      record.title,
      record.coverImageUrl || record.imageUrl || undefined
    );

    if (artworkResults.length === 0) {
      return { success: false, error: "No artwork found" };
    }

    // Use the first result (highest priority)
    const bestArtwork = artworkResults[0];

    // Validate the URL works
    const validation = await artworkService.validateImageUrl(bestArtwork.url);
    if (!validation.valid) {
      return { success: false, error: "New artwork URL is not accessible" };
    }

    // Update the record
    await db.update(vinylRecords)
      .set({
        coverImageUrl: bestArtwork.url,
        updatedAt: new Date()
      })
      .where(eq(vinylRecords.id, recordId));

    return { 
      success: true, 
      newUrl: bestArtwork.url,
      source: bestArtwork.source
    };
  } catch (error) {
    console.error("Error refreshing artwork:", error);
    return { success: false, error: "Failed to refresh artwork" };
  }
}

/**
 * Bulk refresh artwork for all user records that don't have high-res images
 */
export async function bulkRefreshArtworkAction(limit: number = 10) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get records that might need better artwork
    const records = await db.query.vinylRecords.findMany({
      where: eq(vinylRecords.userId, userId),
      limit
    });

    const results = [];
    let updated = 0;

    for (const record of records) {
      // Skip if we already have a high-res cover image
      if (record.coverImageUrl && record.coverImageUrl.includes('600')) {
        continue;
      }

      try {
        const artworkResults = await artworkService.getBestArtwork(
          record.artist,
          record.title,
          record.coverImageUrl || record.imageUrl || undefined
        );

        if (artworkResults.length > 0) {
          const bestArtwork = artworkResults[0];
          
          // Only update if we found a different/better image
          if (bestArtwork.url !== record.coverImageUrl) {
            const validation = await artworkService.validateImageUrl(bestArtwork.url);
            
            if (validation.valid) {
              await db.update(vinylRecords)
                .set({
                  coverImageUrl: bestArtwork.url,
                  updatedAt: new Date()
                })
                .where(eq(vinylRecords.id, record.id));
              
              updated++;
              results.push({
                record: `${record.artist} - ${record.title}`,
                newUrl: bestArtwork.url,
                source: bestArtwork.source
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to update artwork for ${record.artist} - ${record.title}:`, error);
      }

      // Small delay to be respectful to external APIs
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { 
      success: true, 
      updated,
      total: records.length,
      results
    };
  } catch (error) {
    console.error("Error in bulk artwork refresh:", error);
    return { success: false, error: "Failed to refresh artwork" };
  }
}
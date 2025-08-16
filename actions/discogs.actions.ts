"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { users, vinylRecords } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { discogsService } from "@/services/discogs.service";
import { recordsService } from "@/services/records.service";
import { oauthStorage } from "@/lib/oauth-storage";
import type { DiscogsCollectionItem } from "@/services/discogs.service";

/**
 * Start Discogs OAuth flow - get request token
 */
export async function startDiscogsAuthAction(): Promise<{
  success: boolean;
  authUrl?: string;
  token?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    // Get request token without callback for PIN-based flow
    const { token, tokenSecret, authUrl } = await discogsService.getRequestToken();
    
    // Store the token secret for later use
    oauthStorage.store(token, tokenSecret);
    
    return { success: true, authUrl, token };
  } catch (error) {
    console.error("Failed to start Discogs auth:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to start authentication" 
    };
  }
}

/**
 * Complete Discogs OAuth flow with PIN verification
 */
export async function completeDiscogsAuthWithPinAction(
  requestToken: string,
  verifierPin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    // Get the stored token secret
    const tokenSecret = oauthStorage.get(requestToken);
    if (!tokenSecret) {
      return { success: false, error: "Request token expired. Please try connecting again." };
    }

    // Exchange for access token using the PIN
    const { accessToken, accessTokenSecret } = await discogsService.getAccessToken(
      requestToken,
      tokenSecret,
      verifierPin
    );

    // Get user info from Discogs
    const discogsUser = await discogsService.getUser(accessToken, accessTokenSecret);

    // Update user record with Discogs credentials
    await db
      .update(users)
      .set({
        discogsUsername: discogsUser.username,
        discogsAccessToken: accessToken,
        discogsTokenSecret: accessTokenSecret,
        discogsSyncEnabled: true,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, userId));

    // Clean up temporary storage
    oauthStorage.remove(requestToken);

    revalidatePath("/collection");
    return { success: true };
  } catch (error) {
    console.error("Failed to complete Discogs auth:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to complete authentication" 
    };
  }
}

/**
 * Disconnect Discogs account
 */
export async function disconnectDiscogsAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    await db
      .update(users)
      .set({
        discogsUsername: null,
        discogsAccessToken: null,
        discogsTokenSecret: null,
        discogsSyncEnabled: false,
        lastDiscogsSync: null,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, userId));

    revalidatePath("/collection");
    return { success: true };
  } catch (error) {
    console.error("Failed to disconnect Discogs:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to disconnect account" 
    };
  }
}

/**
 * Get user's Discogs connection status
 */
export async function getDiscogsStatusAction(): Promise<{
  connected: boolean;
  username?: string;
  lastSync?: Date;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { connected: false, error: "User not authenticated" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: {
        discogsUsername: true,
        discogsSyncEnabled: true,
        lastDiscogsSync: true,
      },
    });

    if (!user) {
      return { connected: false, error: "User not found" };
    }

    return {
      connected: user.discogsSyncEnabled || false,
      username: user.discogsUsername || undefined,
      lastSync: user.lastDiscogsSync || undefined,
    };
  } catch (error) {
    console.error("Failed to get Discogs status:", error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : "Failed to get status" 
    };
  }
}

/**
 * Import records from Discogs collection
 */
export async function importFromDiscogsAction(): Promise<{
  success: boolean;
  imported: number;
  skipped: number;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, imported: 0, skipped: 0, error: "User not authenticated" };
    }

    // Get user's Discogs credentials
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: {
        id: true,
        discogsUsername: true,
        discogsAccessToken: true,
        discogsTokenSecret: true,
        discogsSyncEnabled: true,
      },
    });

    if (!user || !user.discogsSyncEnabled || !user.discogsAccessToken || !user.discogsTokenSecret) {
      return { 
        success: false, 
        imported: 0, 
        skipped: 0, 
        error: "Discogs account not connected" 
      };
    }

    let imported = 0;
    let skipped = 0;
    let page = 1;
    let hasMore = true;

    // Get existing Discogs release IDs to avoid duplicates
    const existingRecords = await db.query.vinylRecords.findMany({
      where: eq(vinylRecords.userId, user.id),
      columns: { discogsReleaseId: true, discogsInstanceId: true },
    });
    
    const existingReleaseIds = new Set(
      existingRecords
        .filter(r => r.discogsReleaseId)
        .map(r => r.discogsReleaseId)
    );
    
    const existingInstanceIds = new Set(
      existingRecords
        .filter(r => r.discogsInstanceId)
        .map(r => r.discogsInstanceId)
    );

    while (hasMore) {
      try {
        const collection = await discogsService.getUserCollection(
          user.discogsUsername!,
          user.discogsAccessToken,
          user.discogsTokenSecret,
          page,
          100 // Max per page
        );

        for (const item of collection.releases) {
          try {
            // Skip if we already have this record (by release ID or instance ID)
            if (
              (item.basic_information?.id && existingReleaseIds.has(item.basic_information.id.toString())) ||
              existingInstanceIds.has(item.instance_id.toString())
            ) {
              skipped++;
              continue;
            }

            // Map Discogs item to our record format
            const recordData = discogsService.mapDiscogsToVinylRecord(item, user.id);
            
            // Create the record
            await recordsService.createRecord(recordData);
            imported++;

            // Add small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (recordError) {
            console.error(`Failed to import record ${item.basic_information?.title || 'Unknown'}:`, recordError);
            skipped++;
          }
        }

        // Check if there are more pages
        hasMore = page < collection.pagination.pages;
        page++;

        // Add delay between pages to respect rate limits
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (pageError) {
        console.error(`Failed to fetch page ${page}:`, pageError);
        break;
      }
    }

    // Update last sync time
    await db
      .update(users)
      .set({
        lastDiscogsSync: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    revalidatePath("/collection");
    revalidatePath("/u", "layout");
    
    return { success: true, imported, skipped };
  } catch (error) {
    console.error("Failed to import from Discogs:", error);
    return { 
      success: false, 
      imported: 0, 
      skipped: 0, 
      error: error instanceof Error ? error.message : "Failed to import collection" 
    };
  }
}

/**
 * Search Discogs for releases
 */
export async function searchDiscogsAction(query: string): Promise<{
  success: boolean;
  results?: Array<{
    id: number;
    title: string;
    year?: string;
    format?: string[];
    label?: string[];
    genre?: string[];
    thumb?: string;
  }>;
  error?: string;
}> {
  try {
    if (!query || query.trim().length < 2) {
      return { success: false, error: "Search query must be at least 2 characters long" };
    }

    const searchResults = await discogsService.searchReleases(query);
    
    return { 
      success: true, 
      results: searchResults.results.slice(0, 20) // Limit to first 20 results
    };
  } catch (error) {
    console.error("Failed to search Discogs:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Search failed" 
    };
  }
}

/**
 * Add a specific Discogs release to collection
 */
export async function addDiscogsReleaseAction(releaseId: number): Promise<{
  success: boolean;
  recordId?: string;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user's Discogs credentials
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: {
        id: true,
        discogsUsername: true,
        discogsAccessToken: true,
        discogsTokenSecret: true,
        discogsSyncEnabled: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get detailed release information
    let release;
    if (user.discogsAccessToken && user.discogsTokenSecret) {
      release = await discogsService.getRelease(releaseId, user.discogsAccessToken, user.discogsTokenSecret);
    } else {
      // For unauthenticated requests, we'll need to construct the release object differently
      // This is a fallback, but we'll need the full release data
      return { success: false, error: "Discogs authentication required to add specific releases" };
    }

    // Check if record already exists
    const existingRecord = await db.query.vinylRecords.findFirst({
      where: eq(vinylRecords.discogsReleaseId, releaseId.toString()),
    });

    if (existingRecord) {
      return { success: false, error: "This record is already in your collection" };
    }

    // Map and create record
    const recordData = discogsService.mapDiscogsToVinylRecord(release, user.id);
    const newRecord = await recordsService.createRecord(recordData);

    // Optionally add to Discogs collection as well
    if (user.discogsSyncEnabled && user.discogsUsername && user.discogsAccessToken && user.discogsTokenSecret) {
      try {
        await discogsService.addToCollection(
          user.discogsUsername,
          releaseId,
          user.discogsAccessToken,
          user.discogsTokenSecret
        );
      } catch (discogsError) {
        // Don't fail the whole operation if adding to Discogs fails
        console.warn("Failed to add to Discogs collection:", discogsError);
      }
    }

    revalidatePath("/collection");
    revalidatePath("/u", "layout");
    
    return { success: true, recordId: newRecord.id };
  } catch (error) {
    console.error("Failed to add Discogs release:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add release" 
    };
  }
}
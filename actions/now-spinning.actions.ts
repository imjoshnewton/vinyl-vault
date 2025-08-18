"use server";

import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { nowSpinning, vinylRecords, users } from "@/server/db/schema";
import { revalidatePath } from "next/cache";

/**
 * Set a record as "Now Spinning" for the current user
 */
export async function setNowSpinningAction(recordId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify the record belongs to the user
    const record = await db.query.vinylRecords.findFirst({
      where: and(
        eq(vinylRecords.id, recordId),
        eq(vinylRecords.userId, user.id)
      ),
    });

    if (!record) {
      return { success: false, error: "Record not found or doesn't belong to user" };
    }

    // Clear any existing "now spinning" for this user
    await db.delete(nowSpinning).where(eq(nowSpinning.userId, user.id));

    // Set the new "now spinning" record
    await db.insert(nowSpinning).values({
      userId: user.id,
      recordId: recordId,
      isActive: true,
      startedAt: new Date(),
    });

    revalidatePath("/collection");
    revalidatePath(`/u/${user.username}`);

    return { success: true };
  } catch (error) {
    console.error("Error setting now spinning:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to set now spinning" 
    };
  }
}

/**
 * Clear the "Now Spinning" status for the current user
 */
export async function clearNowSpinningAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Clear any existing "now spinning" for this user
    await db.delete(nowSpinning).where(eq(nowSpinning.userId, user.id));

    revalidatePath("/collection");
    revalidatePath(`/u/${user.username}`);

    return { success: true };
  } catch (error) {
    console.error("Error clearing now spinning:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to clear now spinning" 
    };
  }
}

/**
 * Get the current "Now Spinning" record for a user
 */
export async function getNowSpinningAction(username: string): Promise<{
  success: boolean;
  nowSpinning?: any;
  error?: string;
}> {
  try {
    // Get user by username
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get the current now spinning record
    const currentlySpinning = await db.query.nowSpinning.findFirst({
      where: and(
        eq(nowSpinning.userId, user.id),
        eq(nowSpinning.isActive, true)
      ),
      with: {
        record: true,
      },
    });

    return { 
      success: true, 
      nowSpinning: currentlySpinning 
    };
  } catch (error) {
    console.error("Error getting now spinning:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get now spinning" 
    };
  }
}

/**
 * Request next record (for guests)
 * This could be implemented as notifications, queue system, etc.
 */
export async function requestNextRecordAction(
  username: string, 
  requestedRecordId?: string,
  guestName?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // For now, just log the request
    // In a full implementation, this could:
    // - Add to a request queue
    // - Send a notification to the owner
    // - Log the request in the database
    
    console.log("Next record requested:", { 
      username, 
      requestedRecordId, 
      guestName,
      timestamp: new Date()
    });

    // TODO: Implement proper request system
    // Could add to a requests table, send push notifications, etc.

    return { success: true };
  } catch (error) {
    console.error("Error requesting next record:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to request next record" 
    };
  }
}
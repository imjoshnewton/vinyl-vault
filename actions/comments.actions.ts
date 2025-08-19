"use server";

import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/server/db";
import { guestComments, vinylRecords, users } from "@/server/db/schema";
import { revalidatePath } from "next/cache";

/**
 * Add a guest comment to a record
 */
export async function addGuestCommentAction(data: {
  recordId: string;
  guestName: string;
  guestEmail?: string;
  comment: string;
  rating?: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get the record to find the owner
    const record = await db.query.vinylRecords.findFirst({
      where: eq(vinylRecords.id, data.recordId),
    });

    if (!record) {
      return { success: false, error: "Record not found" };
    }

    // Add the comment
    await db.insert(guestComments).values({
      recordId: data.recordId,
      collectionOwnerId: record.userId,
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      comment: data.comment,
      rating: data.rating || null,
      approved: true, // Auto-approve for now
    });

    // Revalidate paths
    const owner = await db.query.users.findFirst({
      where: eq(users.id, record.userId),
    });
    
    if (owner?.username) {
      revalidatePath(`/u/${owner.username}`);
      revalidatePath(`/u/${owner.username}/kiosk`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding guest comment:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add comment" 
    };
  }
}

/**
 * Get guest comments for a record
 */
export async function getGuestCommentsAction(recordId: string): Promise<{
  success: boolean;
  comments?: {
    id: string;
    guestName: string;
    comment: string;
    createdAt: Date;
  }[];
  error?: string;
}> {
  try {
    const comments = await db.query.guestComments.findMany({
      where: and(
        eq(guestComments.recordId, recordId),
        eq(guestComments.approved, true),
        eq(guestComments.hidden, false)
      ),
      orderBy: [desc(guestComments.createdAt)],
    });

    return { 
      success: true, 
      comments: comments || [] 
    };
  } catch (error) {
    console.error("Error fetching guest comments:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch comments" 
    };
  }
}

/**
 * Toggle comment visibility (for owners)
 */
export async function toggleCommentVisibilityAction(commentId: string): Promise<{
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

    // Get the comment
    const comment = await db.query.guestComments.findFirst({
      where: eq(guestComments.id, commentId),
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    // Verify ownership
    if (comment.collectionOwnerId !== user.id) {
      return { success: false, error: "Not authorized to modify this comment" };
    }

    // Toggle visibility
    await db.update(guestComments)
      .set({ hidden: !comment.hidden })
      .where(eq(guestComments.id, commentId));

    revalidatePath(`/u/${user.username}`);
    revalidatePath(`/u/${user.username}/kiosk`);

    return { success: true };
  } catch (error) {
    console.error("Error toggling comment visibility:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to toggle comment" 
    };
  }
}
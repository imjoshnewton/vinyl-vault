import { currentUser } from "@clerk/nextjs/server";
import { usersRepository } from "@/data/users.repository";
import type { User } from "@/server/db";

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    // Upsert user in database
    const user = await usersRepository.upsertByClerkId(clerkUser.id, {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
      imageUrl: clerkUser.imageUrl,
    });

    return user;
  },

  async requireUser(): Promise<User> {
    const user = await this.getCurrentUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    return user;
  },
};
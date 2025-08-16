import { db, users, type NewUser, type User } from "@/server/db";
import { eq } from "drizzle-orm";

export const usersRepository = {
  async findByClerkId(clerkId: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    
    return result[0] ?? null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    return result[0] ?? null;
  },

  async create(data: NewUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(data)
      .returning();
    
    return result[0]!;
  },

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const result = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return result[0]!;
  },

  async upsertByClerkId(clerkId: string, data: Omit<NewUser, "clerkId">): Promise<User> {
    const existing = await this.findByClerkId(clerkId);
    
    if (existing) {
      return this.update(existing.id, data);
    }
    
    return this.create({ ...data, clerkId });
  },
};
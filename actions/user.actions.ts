"use server";

import { revalidatePath } from "next/cache";
import { authService } from "@/services/auth.service";
import { usersRepository } from "@/data/users.repository";

export async function updateUserProfileAction(data: {
  username: string;
  isPublic: boolean;
}) {
  const user = await authService.requireUser();
  
  // Check if username is already taken
  const existingUser = await usersRepository.findByUsername(data.username);
  if (existingUser && existingUser.id !== user.id) {
    throw new Error("Username is already taken");
  }
  
  // Update user profile
  await usersRepository.update(user.id, {
    username: data.username,
    isPublic: data.isPublic,
  });
  
  revalidatePath("/");
  revalidatePath(`/u/${data.username}`);
}
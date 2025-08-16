import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";

export default async function CollectionPage() {
  // Get current user
  const user = await authService.getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  
  // If user has a username and public collection, redirect to public URL
  if (user.username) {
    redirect(`/u/${user.username}`);
  }
  
  // Otherwise redirect to setup username flow (we'll create this next)
  redirect("/setup-profile");
}
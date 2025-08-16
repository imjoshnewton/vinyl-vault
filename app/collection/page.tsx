import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { authService } from "@/services/auth.service";
import { getPublicCollectionAction, getPublicStatsAction } from "@/actions/public.actions";
import PublicCollectionView from "@/components/public-collection-view";
import PublicCollectionHeader from "@/components/public-collection-header";
import StatsCards from "@/components/stats-cards";

export default async function CollectionPage() {
  // Get current user from Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/sign-in");
  }
  
  // Get user from database
  const user = await authService.getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  
  // If user doesn't have a username yet, redirect to setup
  if (!user.username) {
    redirect("/setup-profile");
  }
  
  // Get collection data for the current user
  const collectionData = await getPublicCollectionAction(user.username);
  const statsData = await getPublicStatsAction(user.username);
  
  if (!collectionData || !statsData) {
    // This shouldn't happen for the user's own collection
    redirect("/setup-profile");
  }
  
  const { records } = collectionData;
  const { stats } = statsData;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicCollectionHeader 
        collectionOwner={user}
        isOwner={true}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            My Vinyl Collection
          </h1>
          <p className="text-muted-foreground">
            Manage and share your vinyl records
          </p>
        </div>
        
        <StatsCards stats={stats} />
        <PublicCollectionView records={records} isOwner={true} />
      </main>
    </div>
  );
}
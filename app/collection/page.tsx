import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { authService } from "@/services/auth.service";
import { getPublicCollectionAction } from "@/actions/public.actions";
import CollectionView from "@/components/collection-view";
import AddRecordDialog from "@/components/add-record-dialog";
import ShareCollectionDialog from "@/components/share-collection-dialog";
import DiscogsSyncDialog from "@/components/discogs-sync-dialog";
import DiscogsSearchDialog from "@/components/discogs-search-dialog";
import Footer from "@/components/footer";
import BackToTop from "@/components/back-to-top";

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
  
  if (!collectionData) {
    // This shouldn't happen for the user's own collection
    redirect("/setup-profile");
  }
  
  const { records } = collectionData;

  // Get first name from Clerk user (more reliable) or fall back to database user name
  const userFirstName = (clerkUser.firstName && clerkUser.firstName.trim()) || 
                        (user.name && user.name.split(' ')[0]) || 
                        null;
  
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {userFirstName ? `${userFirstName}'s` : "My"} Vinyl Collection
          </h1>
          <div className="flex justify-center gap-3 mb-6">
            <DiscogsSearchDialog />
            <DiscogsSyncDialog />
            <ShareCollectionDialog user={user} />
            <AddRecordDialog />
          </div>
        </div>
        
        <CollectionView 
          initialRecords={records} 
          username={user.username || ""} 
          ownerName={userFirstName || user.username || "My"}
        />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
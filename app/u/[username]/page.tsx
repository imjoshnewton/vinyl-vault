import { Suspense } from "react";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getPublicCollectionAction, getPublicStatsAction } from "@/actions/public.actions";
import { usersRepository } from "@/data/users.repository";
import CollectionView from "@/components/collection-view";
import Footer from "@/components/footer";
import BackToTop from "@/components/back-to-top";
import CollectionSearchDialog from "@/components/collection-search-dialog";
import KioskModeButton from "@/components/kiosk-mode-button";
import OwnerViewingBanner from "@/components/owner-viewing-banner";

interface PublicCollectionPageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicCollectionPage({ params }: PublicCollectionPageProps) {
  const { username } = await params;
  
  // Get the public collection data
  const collectionData = await getPublicCollectionAction(username);
  const statsData = await getPublicStatsAction(username);
  
  if (!collectionData || !statsData) {
    notFound();
  }
  
  // Check if current user is the owner
  const clerkUser = await currentUser();
  let isOwner = false;
  
  if (clerkUser) {
    const currentDbUser = await usersRepository.findByClerkId(clerkUser.id);
    isOwner = currentDbUser?.id === collectionData.user.id;
  }
  
  const { user: collectionOwner, records } = collectionData;
  
  // Get first name for display
  const ownerFirstName = collectionOwner.name?.split(' ')[0] || collectionOwner.username;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-grow">
        {isOwner && <OwnerViewingBanner />}
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {ownerFirstName}&apos;s Vinyl Collection
          </h1>
          <div className="flex justify-center gap-3 mb-6">
            <CollectionSearchDialog records={records} />
            <KioskModeButton username={username} />
          </div>
        </div>
        
        <Suspense fallback={<div>Loading collection...</div>}>
          <CollectionView 
            initialRecords={records} 
            isOwner={isOwner} 
            username={username}
            ownerName={ownerFirstName || undefined}
          />
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

// Generate metadata for sharing
export async function generateMetadata({ params }: PublicCollectionPageProps) {
  const { username } = await params;
  const statsData = await getPublicStatsAction(username);
  
  if (!statsData) {
    return {
      title: "Collection Not Found",
    };
  }
  
  const { user, stats } = statsData;
  const displayName = user.name || user.username;
  
  return {
    title: `${displayName}'s Vinyl Collection - ${stats.totalRecords} Records`,
    description: `Check out ${displayName}'s vinyl collection with ${stats.totalLPs} LPs, ${stats.totalSingles} Singles, and ${stats.totalPlays} total plays.`,
    openGraph: {
      title: `${displayName}'s Vinyl Collection`,
      description: `${stats.totalRecords} vinyl records including ${stats.totalLPs} LPs and ${stats.totalSingles} Singles`,
      type: "website",
    },
  };
}
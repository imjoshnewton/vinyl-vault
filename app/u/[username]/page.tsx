import { Suspense } from "react";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getPublicCollectionAction, getPublicStatsAction } from "@/actions/public.actions";
import { usersRepository } from "@/data/users.repository";
import PublicCollectionView from "@/components/public-collection-view";
import PublicCollectionHeader from "@/components/public-collection-header";
import StatsCards from "@/components/stats-cards";

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
  const { stats } = statsData;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicCollectionHeader 
        collectionOwner={collectionOwner}
        isOwner={isOwner}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {collectionOwner.name || collectionOwner.username}&apos;s Vinyl Collection
          </h1>
          <p className="text-muted-foreground">
            Discover their music collection
          </p>
        </div>
        
        <StatsCards stats={stats} />
        
        <Suspense fallback={<div>Loading collection...</div>}>
          <PublicCollectionView 
            initialRecords={records}
            collectionOwner={collectionOwner}
            isOwner={isOwner}
          />
        </Suspense>
      </main>
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
"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Disc3, ArrowLeft } from "lucide-react";
import AddRecordDialog from "@/components/add-record-dialog";
import ShareCollectionDialog from "@/components/share-collection-dialog";
import DiscogsSyncDialog from "@/components/discogs-sync-dialog";
import DiscogsSearchDialog from "@/components/discogs-search-dialog";
import type { User } from "@/server/db";

interface PublicCollectionHeaderProps {
  collectionOwner: User;
  isOwner: boolean;
}

export default function PublicCollectionHeader({ 
  collectionOwner, 
  isOwner 
}: PublicCollectionHeaderProps) {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="flex items-center gap-2">
              <Disc3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold truncate">Vinyl Vault</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            {isOwner && (
              <div className="hidden sm:flex items-center gap-2">
                <AddRecordDialog />
                <DiscogsSearchDialog />
                <DiscogsSyncDialog />
                <ShareCollectionDialog user={collectionOwner} />
              </div>
            )}
            
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </SignedOut>
            
            <SignedIn>
              {!isOwner && (
                <Link href="/collection">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">My Collection</Button>
                </Link>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
        
        {/* Mobile owner controls */}
        {isOwner && (
          <div className="sm:hidden mt-3 flex gap-2 overflow-x-auto">
            <AddRecordDialog />
            <DiscogsSearchDialog />
            <DiscogsSyncDialog />
            <ShareCollectionDialog user={collectionOwner} />
          </div>
        )}
        
        {/* Mobile collection owner info */}
        {!isOwner && (
          <div className="sm:hidden mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate">
              Viewing {collectionOwner.name || collectionOwner.username}&apos;s collection
            </span>
          </div>
        )}
        
        {/* Desktop collection owner info */}
        {!isOwner && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <ArrowLeft className="w-4 h-4" />
            <span>
              Viewing {collectionOwner.name || collectionOwner.username}&apos;s collection
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
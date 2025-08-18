"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RecordsTable from "@/components/records-table";
import SpinModal from "@/components/spin-modal";
import NowSpinningBanner from "@/components/now-spinning-banner";
import type { VinylRecord } from "@/server/db";
import { Shuffle, Disc3, Music, Heart } from "lucide-react";

interface CollectionViewProps {
  initialRecords: VinylRecord[];
  isOwner?: boolean;
  username?: string;
}

type TabType = "all" | "lp" | "single" | "wishlist";

export default function CollectionView({ initialRecords, isOwner = true, username }: CollectionViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showSpinModal, setShowSpinModal] = useState(false);
  
  // Separate collection items from wishlist items
  const collectionRecords = initialRecords.filter(r => !r.isWishlist);
  const wishlistRecords = initialRecords.filter(r => r.isWishlist);
  
  // Filter records based on active tab
  const getFilteredRecords = () => {
    switch (activeTab) {
      case "all":
        return collectionRecords;
      case "lp":
        return collectionRecords.filter(r => r.type === "LP");
      case "single":
        return collectionRecords.filter(r => r.type === "Single");
      case "wishlist":
        return wishlistRecords;
      default:
        return collectionRecords;
    }
  };
  
  const filteredRecords = getFilteredRecords();
  
  // Calculate counts
  const allCount = collectionRecords.length;
  const lpCount = collectionRecords.filter(r => r.type === "LP").length;
  const singleCount = collectionRecords.filter(r => r.type === "Single").length;
  const wishlistCount = wishlistRecords.length;

  return (
    <>
      {/* Now Spinning Banner */}
      {username && (
        <NowSpinningBanner 
          username={username}
          onViewKiosk={(record) => {
            // TODO: Open kiosk with this record
            console.log("View kiosk for:", record);
          }}
        />
      )}
      
      {/* Stats Cards as Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card 
          className={`cursor-pointer transition-all ${activeTab === "all" ? "ring-2 ring-primary" : "hover:shadow-lg"}`}
          onClick={() => setActiveTab("all")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Disc3 className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">All Records</p>
                <p className="text-2xl font-bold">{allCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTab === "lp" ? "ring-2 ring-primary" : "hover:shadow-lg"}`}
          onClick={() => setActiveTab("lp")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LPs</p>
                <p className="text-2xl font-bold">{lpCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTab === "single" ? "ring-2 ring-primary" : "hover:shadow-lg"}`}
          onClick={() => setActiveTab("single")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Singles</p>
                <p className="text-2xl font-bold">{singleCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${activeTab === "wishlist" ? "ring-2 ring-primary" : "hover:shadow-lg"}`}
          onClick={() => setActiveTab("wishlist")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wish List</p>
                <p className="text-2xl font-bold">{wishlistCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table with Spin Button */}
      <Card className="overflow-hidden">
        <div className="sticky top-0 bg-background z-20 p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {activeTab === "all" && "All Records"}
            {activeTab === "lp" && "LPs"}
            {activeTab === "single" && "Singles"}
            {activeTab === "wishlist" && "Wish List"}
          </h2>
          
          {activeTab !== "wishlist" && (
            <Button 
              onClick={() => setShowSpinModal(true)}
              className="gap-2"
              disabled={filteredRecords.length === 0}
            >
              <Shuffle className="w-4 h-4" />
              Spin
            </Button>
          )}
        </div>
        
        <div className="relative">
          <RecordsTable records={filteredRecords} isOwner={isOwner} username={username} />
        </div>
      </Card>
      
      <SpinModal 
        open={showSpinModal} 
        onClose={() => setShowSpinModal(false)}
        recordType={activeTab === "lp" ? "LP" : activeTab === "single" ? "Single" : undefined}
      />
    </>
  );
}
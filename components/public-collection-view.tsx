"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PublicRecordsTable from "@/components/public-records-table";
import SpinModal from "@/components/spin-modal";
import type { VinylRecord, User } from "@/server/db";
import { Shuffle } from "lucide-react";

interface PublicCollectionViewProps {
  initialRecords: VinylRecord[];
  collectionOwner: User;
  isOwner: boolean;
}

export default function PublicCollectionView({ 
  initialRecords, 
  isOwner 
}: PublicCollectionViewProps) {
  const [activeTab, setActiveTab] = useState<"LP" | "Single" | "EP" | "All">("All");
  const [showSpinModal, setShowSpinModal] = useState(false);
  
  const filteredRecords = activeTab === "All" 
    ? initialRecords 
    : initialRecords.filter(r => r.type === activeTab);

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "LP" | "Single" | "EP" | "All")} className="w-full">
        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="All">
                All Records ({initialRecords.length})
              </TabsTrigger>
              <TabsTrigger value="LP">
                LPs ({initialRecords.filter(r => r.type === "LP").length})
              </TabsTrigger>
              <TabsTrigger value="Single">
                Singles ({initialRecords.filter(r => r.type === "Single").length})
              </TabsTrigger>
            </TabsList>
            
            <Button 
              onClick={() => setShowSpinModal(true)}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
              disabled={initialRecords.length === 0}
            >
              <Shuffle className="w-4 h-4" />
              Spin
            </Button>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            <PublicRecordsTable 
              records={filteredRecords}
              isOwner={isOwner}
            />
          </TabsContent>
        </Card>
      </Tabs>
      
      <SpinModal 
        open={showSpinModal} 
        onClose={() => setShowSpinModal(false)}
        recordType={activeTab === "All" ? undefined : activeTab}
      />
    </>
  );
}
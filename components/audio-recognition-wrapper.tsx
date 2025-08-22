"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AudioRecognition from "./audio-recognition";
import { setNowSpinningAction } from "@/actions/now-spinning.actions";
import type { AudioRecognitionResult } from "@/actions/audio-recognition.actions";
import type { VinylRecord } from "@/server/db";

interface AudioRecognitionWrapperProps {
  userRecords: VinylRecord[];
}

export default function AudioRecognitionWrapper({ userRecords }: AudioRecognitionWrapperProps) {
  const router = useRouter();

  const handleTrackFound = async (track: NonNullable<AudioRecognitionResult['result']>) => {
    // Find the matching record in the user's collection
    const matchingRecord = userRecords.find(record => 
      record.artist.toLowerCase().includes(track.artist.toLowerCase()) &&
      record.title.toLowerCase().includes(track.title.toLowerCase())
    );

    if (matchingRecord) {
      try {
        const result = await setNowSpinningAction(matchingRecord.id);
        
        if (result.success) {
          toast.success(`Now spinning: ${track.artist} - ${track.title}`, {
            description: "Your collection has been updated!"
          });
          router.refresh(); // Refresh the page to show updated Now Spinning status
        } else {
          toast.error("Failed to set Now Spinning", {
            description: result.error || "Unknown error occurred"
          });
        }
      } catch (error) {
        console.error('Error setting now spinning:', error);
        toast.error("Failed to set Now Spinning", {
          description: "Please try again"
        });
      }
    } else {
      toast.info("Track identified but not found in your collection", {
        description: `${track.artist} - ${track.title}`
      });
    }
  };

  const handleAddRecord = (trackData: { artist: string; title: string; label?: string; releaseYear?: number }) => {
    // For now, show a toast with instructions
    // In the future, we could integrate with the AddRecordDialog or create a new record directly
    toast.info("Add this record to your collection", {
      description: `Search for "${trackData.artist}" to add it to your collection`,
      duration: 5000,
    });
  };

  return (
    <AudioRecognition 
      userRecords={userRecords}
      onTrackFound={handleTrackFound}
      onAddRecord={handleAddRecord}
    />
  );
}
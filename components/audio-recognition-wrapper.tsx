"use client";

import AudioRecognition from "./audio-recognition";
import type { VinylRecord } from "@/server/db";

interface AudioRecognitionWrapperProps {
  userRecords: VinylRecord[];
}

export default function AudioRecognitionWrapper({ userRecords }: AudioRecognitionWrapperProps) {
  return (
    <AudioRecognition 
      userRecords={userRecords}
    />
  );
}
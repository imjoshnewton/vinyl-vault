"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shuffle } from "lucide-react";
import { getRandomRecordAction } from "@/actions/records.actions";
import type { VinylRecord } from "@/server/db";

interface SpinModalProps {
  open: boolean;
  onClose: () => void;
  recordType?: "LP" | "Single" | "EP";
}

export default function SpinModal({ open, onClose, recordType }: SpinModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VinylRecord | null>(null);
  const [diceValue, setDiceValue] = useState(1);

  const handleSpin = async () => {
    setIsSpinning(true);
    setSelectedRecord(null);
    
    // Animate dice for 2 seconds with increasing intervals for dramatic effect
    const animationDuration = 2000;
    let timeElapsed = 0;
    const intervals = [50, 75, 100, 150, 200, 250, 300, 400, 500];
    
    intervals.forEach((interval) => {
      timeElapsed += interval;
      if (timeElapsed < animationDuration) {
        setTimeout(() => {
          setDiceValue(Math.floor(Math.random() * 6) + 1);
        }, timeElapsed);
      }
    });
    
    // Get random record
    setTimeout(async () => {
      const record = await getRandomRecordAction(recordType);
      
      if (record) {
        setSelectedRecord(record);
        setIsSpinning(false);
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setIsSpinning(false);
        setSelectedRecord(null);
      }
    }, animationDuration);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Spin for a Random Record</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-8">
          <AnimatePresence mode="wait">
            {!selectedRecord && (
              <motion.div
                key="dice"
                className="relative w-24 h-24 mb-8"
                style={{ 
                  perspective: "1000px",
                  transformStyle: "preserve-3d"
                }}
              >
                <motion.div
                  className="w-24 h-24 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-2xl relative"
                  animate={isSpinning ? {
                    rotateX: [0, 720],
                    rotateY: [0, 1080],
                    rotateZ: [0, 360],
                    scale: [1, 1.1, 1],
                  } : {
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0,
                    scale: 1,
                  }}
                  transition={isSpinning ? {
                    duration: 2,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    times: [0, 0.5, 1]
                  } : {
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <span className="relative z-10">{diceValue}</span>
                  {/* Dice dots for visual flair */}
                  <div className="absolute inset-2 border border-white/20 rounded-lg" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 bg-white/30 rounded-full" />
                </motion.div>
              </motion.div>
            )}
            
            {selectedRecord && (
              <motion.div
                key="result"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="text-center"
              >
                <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-full" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{selectedRecord.artist}</h3>
                <p className="text-lg text-muted-foreground mb-1">{selectedRecord.title}</p>
                {selectedRecord.releaseYear && (
                  <p className="text-sm text-muted-foreground">Released: {selectedRecord.releaseYear}</p>
                )}
                <div className="mt-4">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                    {selectedRecord.type}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!selectedRecord && !isSpinning && (
            <div className="text-center text-muted-foreground mb-6">
              Click the button below to randomly select a record from your collection!
            </div>
          )}
          
          {selectedRecord && (
            <div className="text-center text-green-600 font-medium mb-6">
              🎵 Time to spin this record!
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-3">
          <Button
            onClick={handleSpin}
            disabled={isSpinning}
            className="flex-1 gap-2"
          >
            <Shuffle className="w-4 h-4" />
            {isSpinning ? "Spinning..." : selectedRecord ? "Spin Again" : "Spin"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
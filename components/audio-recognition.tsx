"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  Square, 
  Loader2,
  AlertCircle,
  Music
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { recognizeAudioAction, type AudioRecognitionResult } from "@/actions/audio-recognition.actions";
import AudioRecognitionResults from "./audio-recognition-results";
import type { VinylRecord } from "@/server/db";

interface AudioRecognitionProps {
  userRecords: VinylRecord[];
}

export default function AudioRecognition({ 
  userRecords
}: AudioRecognitionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [result, setResult] = useState<AudioRecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingSize, setRecordingSize] = useState<number>(0);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true
      });
      
      // Reset state
      setError(null);
      setResult(null);
      setRecordingSize(0);
      audioChunks.current = [];
      
      // Determine the best supported mime type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: mimeType,
      });
      console.log('Using mime type:', mimeType);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
          // Update recording size
          const totalSize = audioChunks.current.reduce((sum, chunk) => sum + chunk.size, 0);
          setRecordingSize(totalSize);
        }
      };
      
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };
      
      // Start recording with timeslice to get regular data updates
      mediaRecorder.current.start(1000); // Get data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Update recording time every second
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Auto-stop after 15 seconds (recommended by AudD)
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 15000);
      
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
      console.error('Error accessing microphone:', err);
    }
  }, []);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
  }, []);
  
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      console.log('Audio blob type:', audioBlob.type);
      
      // Add some basic validation
      if (audioBlob.size < 1000) {
        setError('Recording too short or empty. Please try again with music playing.');
        setIsProcessing(false);
        return;
      }
      
      const formData = new FormData();
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      formData.append('audio', audioFile);
      
      console.log('Sending audio file - Size:', audioFile.size, 'Type:', audioFile.type);
      
      const result = await recognizeAudioAction(formData);
      setResult(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    setError(null);
    setRecordingSize(0);
    setRecordingTime(0);
  };
  
  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          title="Identify what's playing"
        >
          <Music className="w-4 h-4" />
          <span className="hidden sm:inline">Listen</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Audio Recognition
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!result && !error && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Play some music and let us identify what&apos;s spinning!
              </p>
              
              {!isRecording && !isProcessing && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="gap-2 h-16 w-full text-lg"
                >
                  <Mic className="w-6 h-6" />
                  Start Listening
                </Button>
              )}
              
              {isRecording && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-red-500">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                    </div>
                  </div>
                  
                  {/* Recording Status */}
                  <div className="space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                      Recording: {(recordingSize / 1024).toFixed(1)} KB
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-100 ${
                          recordingSize > 50000 ? 'bg-green-500' : 
                          recordingSize > 10000 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((recordingSize / 200000) * 100, 100)}%` }}
                      />
                    </div>
                    {recordingSize < 5000 && recordingTime > 2 && (
                      <div className="text-xs text-orange-500 text-center">
                        ⚠️ Low data captured - ensure music is playing and microphone permission is granted
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Recording... (max 15 seconds)
                  </div>
                  
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                    className="gap-2 h-14 w-full"
                  >
                    <Square className="w-5 h-5" />
                    Stop Recording
                  </Button>
                </div>
              )}
              
              {isProcessing && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Identifying music...</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    This may take a few seconds
                  </div>
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Recognition Failed</span>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  setResult(null);
                }}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
          
          {result && result.status === 'success' && result.result && (
            <AudioRecognitionResults
              result={result}
              userRecords={userRecords}
              onClose={handleClose}
            />
          )}
          
          {result && result.status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">No Match Found</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {result.error?.error_message || "Could not identify the music. Try recording closer to the speakers or with less background noise."}
              </p>
              <Button
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
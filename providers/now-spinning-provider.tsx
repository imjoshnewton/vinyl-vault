"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { getNowSpinningAction, setNowSpinningAction, clearNowSpinningAction } from "@/actions/now-spinning.actions";
import type { VinylRecord } from "@/server/db";

interface NowSpinningData {
  record: VinylRecord;
  startedAt: Date;
}

interface NowSpinningContextType {
  nowSpinning: NowSpinningData | null;
  isLoading: boolean;
  setNowSpinning: (recordId: string) => Promise<void>;
  clearNowSpinning: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NowSpinningContext = createContext<NowSpinningContextType | undefined>(undefined);

interface NowSpinningProviderProps {
  children: ReactNode;
  username?: string;
  enablePolling?: boolean;
  pollingInterval?: number;
  initialData?: NowSpinningData | null;
}

export function NowSpinningProvider({
  children,
  username,
  enablePolling = false,
  pollingInterval = 60000, // Default 60 seconds
  initialData = null,
}: NowSpinningProviderProps) {
  const [nowSpinning, setNowSpinningState] = useState<NowSpinningData | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);

  const fetchNowSpinning = useCallback(async () => {
    if (!username) {
      setNowSpinningState(null);
      setIsLoading(false);
      return;
    }

    try {
      const result = await getNowSpinningAction(username);
      if (result.success && result.nowSpinning) {
        setNowSpinningState(result.nowSpinning);
      } else {
        setNowSpinningState(null);
      }
    } catch (error) {
      console.error("Failed to fetch now spinning:", error);
      setNowSpinningState(null);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  const setNowSpinning = useCallback(async (recordId: string) => {
    try {
      const result = await setNowSpinningAction(recordId);
      if (result.success) {
        // Immediately refresh to get the updated data
        await fetchNowSpinning();
      }
    } catch (error) {
      console.error("Failed to set now spinning:", error);
      throw error;
    }
  }, [fetchNowSpinning]);

  const clearNowSpinning = useCallback(async () => {
    try {
      const result = await clearNowSpinningAction();
      if (result.success) {
        setNowSpinningState(null);
      }
    } catch (error) {
      console.error("Failed to clear now spinning:", error);
      throw error;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!initialData) {
      fetchNowSpinning();
    }
  }, [fetchNowSpinning, initialData]);

  // Optional polling
  useEffect(() => {
    if (!enablePolling || !username) return;

    const interval = setInterval(fetchNowSpinning, pollingInterval);
    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, fetchNowSpinning, username]);

  return (
    <NowSpinningContext.Provider
      value={{
        nowSpinning,
        isLoading,
        setNowSpinning,
        clearNowSpinning,
        refresh: fetchNowSpinning,
      }}
    >
      {children}
    </NowSpinningContext.Provider>
  );
}

export function useNowSpinning() {
  const context = useContext(NowSpinningContext);
  if (context === undefined) {
    throw new Error("useNowSpinning must be used within a NowSpinningProvider");
  }
  return context;
}

/**
 * Optional hook for components that don't require the context
 * Returns null if not within a provider
 */
export function useOptionalNowSpinning() {
  try {
    return useContext(NowSpinningContext);
  } catch {
    return undefined;
  }
}
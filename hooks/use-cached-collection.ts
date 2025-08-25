"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecordsAction, createRecordAction, updateRecordAction, deleteRecordAction } from "@/actions/records.actions";
import { LocalCache, CacheKeys, optimisticUpdate } from "@/lib/cache";
import type { VinylRecord, NewVinylRecord } from "@/server/db";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

/**
 * Hook for cached collection data with optimistic updates
 */
export function useCachedCollection(options?: {
  type?: "LP" | "Single" | "EP";
  isWishlist?: boolean;
  sortBy?: "artist" | "title" | "releaseYear" | "createdAt";
  sortOrder?: "asc" | "desc";
  search?: string;
}) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  
  const queryKey = ["collection", userId, options];
  const cacheKey = CacheKeys.USER_COLLECTION(userId || "");

  // Fetch collection with caching
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Try local cache first
      const cached = LocalCache.get<VinylRecord[]>(cacheKey);
      if (cached && !options?.search) {
        // If we have cached data and no search, return it immediately
        // Still fetch fresh data in background
        getRecordsAction(options).then(freshData => {
          LocalCache.set(cacheKey, freshData, 5 * 60 * 1000); // 5 min TTL
          queryClient.setQueryData(queryKey, freshData);
        });
        return cached;
      }

      // Fetch fresh data
      const records = await getRecordsAction(options);
      
      // Cache if no search filter
      if (!options?.search) {
        LocalCache.set(cacheKey, records, 5 * 60 * 1000);
      }
      
      return records;
    },
    enabled: !!userId,
    staleTime: options?.search ? 0 : 5 * 60 * 1000, // Don't cache search results
  });

  // Add record mutation with optimistic update
  const addMutation = useMutation({
    mutationFn: (data: Omit<NewVinylRecord, "userId">) => createRecordAction(data),
    onMutate: async (newRecord) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousRecords = queryClient.getQueryData<VinylRecord[]>(queryKey);

      // Optimistically update
      if (previousRecords) {
        const optimisticRecord: VinylRecord = {
          id: `temp-${Date.now()}`,
          userId: userId!,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...newRecord,
        } as VinylRecord;

        queryClient.setQueryData(queryKey, [...previousRecords, optimisticRecord]);
        
        // Update local cache
        optimisticUpdate(cacheKey, (records: VinylRecord[]) => [...records, optimisticRecord]);
      }

      return { previousRecords };
    },
    onError: (err, newRecord, context) => {
      // Revert optimistic update on error
      if (context?.previousRecords) {
        queryClient.setQueryData(queryKey, context.previousRecords);
        LocalCache.set(cacheKey, context.previousRecords);
      }
      toast.error("Failed to add record");
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey });
      toast.success("Record added successfully!");
    },
  });

  // Update record mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<NewVinylRecord, "userId">> }) =>
      updateRecordAction(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousRecords = queryClient.getQueryData<VinylRecord[]>(queryKey);

      if (previousRecords) {
        const updatedRecords = previousRecords.map(record =>
          record.id === id ? { ...record, ...data, updatedAt: new Date() } : record
        );
        
        queryClient.setQueryData(queryKey, updatedRecords);
        optimisticUpdate(cacheKey, () => updatedRecords);
      }

      return { previousRecords };
    },
    onError: (err, variables, context) => {
      if (context?.previousRecords) {
        queryClient.setQueryData(queryKey, context.previousRecords);
        LocalCache.set(cacheKey, context.previousRecords);
      }
      toast.error("Failed to update record");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Record updated!");
    },
  });

  // Delete record mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: deleteRecordAction,
    onMutate: async (recordId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousRecords = queryClient.getQueryData<VinylRecord[]>(queryKey);

      if (previousRecords) {
        const filteredRecords = previousRecords.filter(record => record.id !== recordId);
        queryClient.setQueryData(queryKey, filteredRecords);
        optimisticUpdate(cacheKey, () => filteredRecords);
      }

      return { previousRecords };
    },
    onError: (err, recordId, context) => {
      if (context?.previousRecords) {
        queryClient.setQueryData(queryKey, context.previousRecords);
        LocalCache.set(cacheKey, context.previousRecords);
      }
      toast.error("Failed to delete record");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Record deleted");
    },
  });

  return {
    records: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    addRecord: addMutation.mutate,
    updateRecord: updateMutation.mutate,
    deleteRecord: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook to prefetch collection data
 */
export function usePrefetchCollection() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return () => {
    if (userId) {
      queryClient.prefetchQuery({
        queryKey: ["collection", userId, undefined],
        queryFn: () => getRecordsAction(),
        staleTime: 5 * 60 * 1000,
      });
    }
  };
}
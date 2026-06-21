/**
 * React Query hooks for learning worlds.
 * Provides cached fetching of worlds and world details from the API.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { worldsAPI } from "../../../services/api";
import type { WorldData } from "../types";

/** @async */
async function fetchWorldBySlug(slug: string): Promise<WorldData | null> {
  const res = await worldsAPI.getBySlug(slug);
  return res.data ?? null;
}

/**
 * Query key factory for consistent cache management.
 */
export const worldKeys = {
  all: ["worlds"] as const,
  bySlug: (slug: string) => ["world", slug] as const,
};

/**
 * Fetch all worlds (cached, staleTime: 5 minutes).
 */
export function useWorlds() {
  return useQuery<WorldData[]>({
    queryKey: worldKeys.all,
    queryFn: async () => {
      const res = await worldsAPI.list();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Fetch a single world by slug (cached, staleTime: 10 minutes).
 */
export function useWorld(slug: string | undefined) {
  return useQuery<WorldData | null>({
    queryKey: worldKeys.bySlug(slug ?? ""),
    queryFn: async () => {
      if (!slug) return null;
      return fetchWorldBySlug(slug);
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Prefetch a world detail page into the cache.
 * Call this on hover or other user intent signals.
 */
export function prefetchWorld(queryClient: ReturnType<typeof useQueryClient>, slug: string) {
  return queryClient.prefetchQuery({
    queryKey: worldKeys.bySlug(slug),
    queryFn: () => fetchWorldBySlug(slug),
    staleTime: 10 * 60 * 1000,
  });
}

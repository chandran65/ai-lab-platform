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

<<<<<<< Updated upstream
/**
 * Query key factory for consistent cache management.
 */
=======
>>>>>>> Stashed changes
export const worldKeys = {
  all: ["worlds"] as const,
  bySlug: (slug: string) => ["world", slug] as const,
};

<<<<<<< Updated upstream
/**
 * Fetch all worlds (cached, staleTime: 5 minutes).
 */
=======
>>>>>>> Stashed changes
export function useWorlds() {
  return useQuery<WorldData[]>({
    queryKey: worldKeys.all,
    queryFn: async () => {
      const res = await worldsAPI.list();
      return res.data ?? [];
    },
<<<<<<< Updated upstream
    staleTime: 5 * 60 * 1000, // 5 minutes
=======
    staleTime: 5 * 60 * 1000,
>>>>>>> Stashed changes
    retry: 2,
  });
}

<<<<<<< Updated upstream
/**
 * Fetch a single world by slug (cached, staleTime: 10 minutes).
 */
=======
>>>>>>> Stashed changes
export function useWorld(slug: string | undefined) {
  return useQuery<WorldData | null>({
    queryKey: worldKeys.bySlug(slug ?? ""),
    queryFn: async () => {
      if (!slug) return null;
      return fetchWorldBySlug(slug);
    },
    enabled: !!slug,
<<<<<<< Updated upstream
    staleTime: 10 * 60 * 1000, // 10 minutes
=======
    staleTime: 10 * 60 * 1000,
>>>>>>> Stashed changes
    retry: 2,
  });
}

<<<<<<< Updated upstream
/**
 * Prefetch a world detail page into the cache.
 * Call this on hover or other user intent signals.
 */
=======
>>>>>>> Stashed changes
export function prefetchWorld(queryClient: ReturnType<typeof useQueryClient>, slug: string) {
  return queryClient.prefetchQuery({
    queryKey: worldKeys.bySlug(slug),
    queryFn: () => fetchWorldBySlug(slug),
    staleTime: 10 * 60 * 1000,
  });
}

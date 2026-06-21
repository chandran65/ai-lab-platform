/**
 * Mindora Worlds — Utility helpers.
<<<<<<< Updated upstream
 *
 * These helper functions provide fallback access to world data.
 * Primary data fetching is done via the API (worldsAPI).
 * This file remains as a lightweight utility module.
=======
>>>>>>> Stashed changes
 */

import type { WorldData } from "../types";

<<<<<<< Updated upstream
/**
 * Get the recommended world for a given age.
 * Works with both hardcoded and API-fetched world data.
 */
=======
>>>>>>> Stashed changes
export function getWorldForAge(age: number, worlds: WorldData[]): WorldData | undefined {
  return worlds.find((w) => age >= w.minAge && age <= w.maxAge);
}

<<<<<<< Updated upstream
/**
 * Get total experiment count across all worlds.
 */
=======
>>>>>>> Stashed changes
export function getTotalExperiments(worlds: WorldData[]): number {
  return worlds.reduce((acc, w) => acc + w.experiments.length, 0);
}

<<<<<<< Updated upstream
/**
 * Get a world by its slug from a list of worlds.
 */
=======
>>>>>>> Stashed changes
export function getWorldBySlug(slug: string, worlds: WorldData[]): WorldData | undefined {
  return worlds.find((w) => w.slug === slug);
}

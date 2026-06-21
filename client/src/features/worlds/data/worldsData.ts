/**
 * Mindora Universe — World utility helpers.
 */

import type { WorldData } from "../types";

export function getWorldForAge(age: number, worlds: WorldData[]): WorldData | undefined {
  return worlds.find((w) => age >= w.minAge && age <= w.maxAge);
}

export function getTotalExperiments(worlds: WorldData[]): number {
  return worlds.reduce((acc, w) => acc + w.experiments.length, 0);
}

export function getWorldBySlug(slug: string, worlds: WorldData[]): WorldData | undefined {
  return worlds.find((w) => w.slug === slug);
}

/**
 * Shared TypeScript types for the Learning Worlds feature.
 * Mirrors the backend API response shape from WorldService.
 */

export interface Experiment {
  id: string;
  title: string;
  description: string;
  emoji: string;
  skills: string[];
  levels: number;
  duration: string;
  gameLink?: string;
  isNew?: boolean;
}

export interface WorldData {
  id: string;
  slug: string;
  title: string;
  name: string;
  subtitle: string;
  description: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  mascotName: string;
  mascotEmoji: string;
  mascotPersonality: string;
  theme: string;
  gradient: string;
  accentColor: string;
  order: number;
  skills: string[];
  experiments: Experiment[];
  completionReward: string;
  unlockRequirement?: string;
}

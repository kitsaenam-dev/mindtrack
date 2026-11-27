import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MoodId } from './moods';

// One entry per day. Everything stays on the device; nothing is sent anywhere.
export type Entry = {
  day: string; // "YYYY-MM-DD", see dates.ts
  mood: MoodId;
  note: string;
  updatedAt: string; // ISO timestamp
};

export const STORAGE_KEY = 'mindtrack.entries.v1';

export async function loadEntries(): Promise<Entry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortNewestFirst(parsed) : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: Entry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function sortNewestFirst(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
}

// Adds the entry, or replaces the one already saved for that day.
export function upsertEntry(entries: Entry[], entry: Entry): Entry[] {
  return sortNewestFirst([...entries.filter((e) => e.day !== entry.day), entry]);
}

export function removeEntry(entries: Entry[], day: string): Entry[] {
  return entries.filter((e) => e.day !== day);
}

// Results of self-check questionnaires, newest first. Also kept on the device only.
export type AssessmentResult = {
  id: string;
  assessment: import('./assessments').AssessmentId;
  answers: number[];
  total: number;
  takenAt: string; // ISO timestamp
};

export const RESULTS_KEY = 'mindtrack.results.v1';

export async function loadResults(): Promise<AssessmentResult[]> {
  const raw = await AsyncStorage.getItem(RESULTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addResult(result: AssessmentResult): Promise<AssessmentResult[]> {
  const next = [result, ...(await loadResults())];
  await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(next));
  return next;
}

// The person's setup from the first time they open the app.
export type Profile = {
  name: string;
  focusAreas: import('./areas').AreaId[];
  createdAt: string;
};

export const PROFILE_KEY = 'mindtrack.profile.v1';

export async function loadProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

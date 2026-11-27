// The five moods a person can pick from. Labels are plain words on purpose:
// Mindtrack is about noticing how you feel, not scoring it.
export type MoodId = 'awful' | 'low' | 'okay' | 'good' | 'great';

export type Mood = {
  id: MoodId;
  label: string;
  icon: string; // MaterialCommunityIcons name
};

export const MOODS: Mood[] = [
  { id: 'awful', label: 'Awful', icon: 'emoticon-cry-outline' },
  { id: 'low', label: 'Low', icon: 'emoticon-sad-outline' },
  { id: 'okay', label: 'Okay', icon: 'emoticon-neutral-outline' },
  { id: 'good', label: 'Good', icon: 'emoticon-happy-outline' },
  { id: 'great', label: 'Great', icon: 'emoticon-excited-outline' },
];

export function getMood(id: MoodId): Mood {
  const mood = MOODS.find((m) => m.id === id);
  if (!mood) throw new Error(`Unknown mood: ${id}`);
  return mood;
}

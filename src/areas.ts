import type { AssessmentId } from './assessments';

// Areas a person can choose to work on when they first open the app.
// Each area may point to an optional self-check, and always has some tips.
export type AreaId = 'mood' | 'anxiety' | 'sleep' | 'stress';

export type Area = {
  id: AreaId;
  label: string;
  icon: string;
  description: string;
  assessment?: AssessmentId;
  tips: string[];
};

// GUESS: these four areas were suggested, not specified. Sleep and stress have
// tips only for now; validated sleep and stress questionnaires (for example
// ISI, PSS-10) have licensing terms that need checking before adding them.
export const AREAS: Area[] = [
  {
    id: 'mood',
    label: 'Mood',
    icon: 'emoticon-outline',
    description: 'Feeling low, down or flat',
    assessment: 'phq9',
    tips: ['Log your mood each day to notice what lifts it.', 'Plan one small thing you enjoy each day.'],
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    icon: 'head-cog-outline',
    description: 'Worry, nervousness, feeling on edge',
    assessment: 'gad7',
    tips: ['Try slow breathing: in for 4 counts, out for 6.', 'Write worries down, then set them aside until later.'],
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: 'sleep',
    description: 'Trouble falling or staying asleep',
    tips: [
      'Go to bed and get up at the same time every day.',
      'Put screens away 30 minutes before bed.',
      'Keep caffeine to the morning.',
      'If you cannot sleep after 20 minutes, get up and do something calm until you feel sleepy.',
    ],
  },
  {
    id: 'stress',
    label: 'Stress',
    icon: 'weather-lightning',
    description: 'Feeling overwhelmed or under pressure',
    tips: [
      'Break big tasks into small steps and do just the next one.',
      'Take short breaks outside during the day.',
      'Talk to someone you trust about what is weighing on you.',
      'Notice what you can control, and let go of what you cannot.',
    ],
  },
];

export function getArea(id: AreaId): Area {
  const a = AREAS.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown area: ${id}`);
  return a;
}

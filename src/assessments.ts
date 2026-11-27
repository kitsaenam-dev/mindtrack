// Self-check questionnaires and how their answers are explained.
//
// PHQ-9 (mood) and GAD-7 (anxiety) were developed by Drs. Spitzer, Williams,
// Kroenke and colleagues with an educational grant from Pfizer Inc. No
// permission is required to reproduce, translate, display or distribute them.
// The score bands below are the published cut-offs. The advice text is
// general self-care guidance written for this app, not clinical advice.

export type AssessmentId = 'phq9' | 'gad7';

export type Severity = 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';

export type Band = {
  min: number;
  max: number;
  severity: Severity;
  title: string;
  meaning: string;
  steps: string[];
};

export type Assessment = {
  id: AssessmentId;
  name: string;
  shortName: string;
  description: string;
  prompt: string;
  questions: string[];
  bands: Band[];
  // Index of a question where any answer above 0 needs a safety message.
  safetyQuestion?: number;
};

export const ANSWER_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
] as const;

const SELF_CARE = [
  'Keep a regular sleep and wake time, even on weekends.',
  'Move your body a little each day. A 10 minute walk counts.',
  'Spend some time with, or message, someone you trust.',
  'Keep logging your mood here so you can notice patterns.',
];

const SEE_SOMEONE = 'Talk to a doctor, counsellor or other mental health professional about how you have been feeling.';

export const PHQ9: Assessment = {
  id: 'phq9',
  name: 'Mood check (PHQ-9)',
  shortName: 'Mood',
  description: '9 questions about low mood over the last two weeks.',
  prompt: 'Over the last 2 weeks, how often have you been bothered by:',
  questions: [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself, or that you are a failure or have let yourself or your family down',
    'Trouble concentrating on things, such as reading the newspaper or watching television',
    'Moving or speaking so slowly that other people could have noticed, or the opposite: being so fidgety or restless that you have been moving around a lot more than usual',
    'Thoughts that you would be better off dead, or of hurting yourself in some way',
  ],
  safetyQuestion: 8,
  bands: [
    {
      min: 0, max: 4, severity: 'minimal', title: 'Few or no signs of low mood',
      meaning: 'Your answers suggest you have had few signs of depression over the last two weeks.',
      steps: ['Keep doing what helps you feel well.', ...SELF_CARE.slice(0, 2), 'Check in again in a couple of weeks, or sooner if things change.'],
    },
    {
      min: 5, max: 9, severity: 'mild', title: 'Some signs of low mood',
      meaning: 'Your answers suggest mild signs of depression. Many people go through periods like this.',
      steps: [...SELF_CARE, 'Take this check again in two weeks. If it is not improving, talk to someone.'],
    },
    {
      min: 10, max: 14, severity: 'moderate', title: 'Moderate signs of low mood',
      meaning: 'Your answers suggest moderate signs of depression. This is a good time to get support.',
      steps: [SEE_SOMEONE, ...SELF_CARE.slice(0, 3), 'Be kind to yourself. Feeling this way is not a personal failing.'],
    },
    {
      min: 15, max: 19, severity: 'moderately-severe', title: 'Strong signs of low mood',
      meaning: 'Your answers suggest moderately severe signs of depression. Support from a professional can really help.',
      steps: ['Please make an appointment with a doctor or mental health professional soon.', 'Let someone you trust know how you are feeling.', ...SELF_CARE.slice(0, 2)],
    },
    {
      min: 20, max: 27, severity: 'severe', title: 'Very strong signs of low mood',
      meaning: 'Your answers suggest severe signs of depression. You do not have to deal with this alone.',
      steps: ['Please contact a doctor or mental health professional as soon as you can.', 'Tell someone you trust how you are feeling today.', 'If you feel unsafe, call a helpline or emergency services now.'],
    },
  ],
};

export const GAD7: Assessment = {
  id: 'gad7',
  name: 'Anxiety check (GAD-7)',
  shortName: 'Anxiety',
  description: '7 questions about worry and anxiety over the last two weeks.',
  prompt: 'Over the last 2 weeks, how often have you been bothered by:',
  questions: [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid, as if something awful might happen',
  ],
  bands: [
    {
      min: 0, max: 4, severity: 'minimal', title: 'Few or no signs of anxiety',
      meaning: 'Your answers suggest you have had few signs of anxiety over the last two weeks.',
      steps: ['Keep doing what helps you feel calm.', ...SELF_CARE.slice(0, 2), 'Check in again in a couple of weeks, or sooner if things change.'],
    },
    {
      min: 5, max: 9, severity: 'mild', title: 'Some signs of anxiety',
      meaning: 'Your answers suggest mild anxiety. Worry is common, and there are simple ways to ease it.',
      steps: ['Try slow breathing: in for 4 counts, out for 6, for a few minutes.', 'Set aside a short "worry time" each day and park worries until then.', 'Cut back on caffeine, especially later in the day.', ...SELF_CARE.slice(0, 2)],
    },
    {
      min: 10, max: 14, severity: 'moderate', title: 'Moderate signs of anxiety',
      meaning: 'Your answers suggest moderate anxiety. Talking to a professional is worth considering.',
      steps: [SEE_SOMEONE, 'Try slow breathing: in for 4 counts, out for 6, for a few minutes.', ...SELF_CARE.slice(0, 3)],
    },
    {
      min: 15, max: 21, severity: 'severe', title: 'Strong signs of anxiety',
      meaning: 'Your answers suggest severe anxiety. Support from a professional can really help.',
      steps: ['Please contact a doctor or mental health professional soon.', 'Let someone you trust know how you are feeling.', 'Try slow breathing when anxiety rises: in for 4 counts, out for 6.'],
    },
  ],
};

export const ASSESSMENTS: Assessment[] = [PHQ9, GAD7];

export function getAssessment(id: AssessmentId): Assessment {
  const a = ASSESSMENTS.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown assessment: ${id}`);
  return a;
}

export function score(answers: number[]): number {
  return answers.reduce((sum, v) => sum + v, 0);
}

export function bandFor(assessment: Assessment, total: number): Band {
  const band = assessment.bands.find((b) => total >= b.min && total <= b.max);
  if (!band) throw new Error(`Score ${total} is out of range for ${assessment.id}`);
  return band;
}

export function needsSafetyMessage(assessment: Assessment, answers: number[]): boolean {
  return assessment.safetyQuestion !== undefined && (answers[assessment.safetyQuestion] ?? 0) > 0;
}

// GUESS: helplines are for India, based on where the person is. Change them
// for other countries.
export const HELPLINES = [
  { name: 'Tele-MANAS (free, 24/7, India)', phone: '14416' },
  { name: 'Emergency services (India)', phone: '112' },
];

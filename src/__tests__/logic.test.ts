import { GAD7, PHQ9, bandFor, needsSafetyMessage, score } from '../assessments';
import { formatDay, toDayKey } from '../dates';
import { removeEntry, upsertEntry, type Entry } from '../storage';

const entry = (day: string, note = ''): Entry => ({ day, mood: 'okay', note, updatedAt: '2026-01-01T00:00:00Z' });

describe('entries', () => {
  it('keeps one entry per day and sorts newest first', () => {
    let list = upsertEntry([], entry('2026-11-01'));
    list = upsertEntry(list, entry('2026-11-03'));
    list = upsertEntry(list, entry('2026-11-01', 'edited'));
    expect(list.map((e) => e.day)).toEqual(['2026-11-03', '2026-11-01']);
    expect(list[1].note).toBe('edited');
  });

  it('removes an entry by day', () => {
    expect(removeEntry([entry('2026-11-01'), entry('2026-11-02')], '2026-11-01').map((e) => e.day)).toEqual(['2026-11-02']);
  });
});

describe('dates', () => {
  it('uses local calendar days', () => {
    expect(toDayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('labels today and yesterday', () => {
    const now = new Date(2026, 10, 27, 10);
    expect(formatDay('2026-11-27', now)).toBe('Today');
    expect(formatDay('2026-11-26', now)).toBe('Yesterday');
  });
});

describe('self-check scoring', () => {
  it.each([
    [0, 'minimal'], [4, 'minimal'], [5, 'mild'], [10, 'moderate'], [15, 'moderately-severe'], [27, 'severe'],
  ])('PHQ-9 score %i is %s', (total, severity) => {
    expect(bandFor(PHQ9, total).severity).toBe(severity);
  });

  it.each([[4, 'minimal'], [9, 'mild'], [14, 'moderate'], [21, 'severe']])('GAD-7 score %i is %s', (total, severity) => {
    expect(bandFor(GAD7, total).severity).toBe(severity);
  });

  it('bands cover every possible score with no gaps', () => {
    for (const a of [PHQ9, GAD7]) {
      for (let t = 0; t <= a.questions.length * 3; t++) expect(() => bandFor(a, t)).not.toThrow();
    }
  });

  it('every band offers next steps', () => {
    for (const a of [PHQ9, GAD7]) for (const b of a.bands) expect(b.steps.length).toBeGreaterThan(0);
  });

  it('sums answers', () => {
    expect(score([1, 2, 3])).toBe(6);
  });

  it('flags the PHQ-9 self-harm question when answered above zero', () => {
    const answers = Array(9).fill(0);
    expect(needsSafetyMessage(PHQ9, answers)).toBe(false);
    answers[8] = 1;
    expect(needsSafetyMessage(PHQ9, answers)).toBe(true);
    expect(needsSafetyMessage(GAD7, Array(7).fill(3))).toBe(false);
  });
});

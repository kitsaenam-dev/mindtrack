// Days are stored as local calendar dates ("YYYY-MM-DD") so that an entry
// belongs to the day the person lived it, whatever their time zone.
export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDay(key: string, today: Date = new Date()): string {
  if (key === toDayKey(today)) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (key === toDayKey(yesterday)) return 'Yesterday';
  return fromDayKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: fromDayKey(key).getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}

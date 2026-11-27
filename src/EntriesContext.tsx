import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadEntries, removeEntry, saveEntries, upsertEntry, type Entry } from './storage';

type EntriesValue = {
  entries: Entry[];
  loading: boolean;
  save: (entry: Entry) => Promise<void>;
  remove: (day: string) => Promise<void>;
};

const EntriesContext = createContext<EntriesValue | null>(null);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  // Latest list, so saves never write a stale copy to storage.
  const latest = useRef<Entry[]>([]);

  const commit = useCallback(async (next: Entry[]) => {
    latest.current = next;
    setEntries(next);
    await saveEntries(next);
  }, []);

  useEffect(() => {
    let active = true;
    loadEntries()
      .then((loaded) => {
        if (!active) return;
        latest.current = loaded;
        setEntries(loaded);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const save = useCallback((entry: Entry) => commit(upsertEntry(latest.current, entry)), [commit]);
  const remove = useCallback((day: string) => commit(removeEntry(latest.current, day)), [commit]);

  const value = useMemo(() => ({ entries, loading, save, remove }), [entries, loading, save, remove]);
  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
}

export function useEntries(): EntriesValue {
  const value = useContext(EntriesContext);
  if (!value) throw new Error('useEntries must be used inside EntriesProvider');
  return value;
}

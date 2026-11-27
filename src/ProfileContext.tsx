import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadProfile, saveProfile, type Profile } from './storage';

type ProfileValue = {
  profile: Profile | null;
  loading: boolean;
  editing: boolean;
  save: (profile: Profile) => Promise<void>;
  startEditing: () => void;
  cancelEditing: () => void;
};

const ProfileContext = createContext<ProfileValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (next: Profile) => {
    await saveProfile(next);
    setProfile(next);
    setEditing(false);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      loading,
      editing,
      save,
      startEditing: () => setEditing(true),
      cancelEditing: () => setEditing(false),
    }),
    [profile, loading, editing, save],
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile must be used inside ProfileProvider');
  return value;
}

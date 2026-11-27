import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Snackbar, Text, TextInput, TouchableRipple, useTheme, Icon } from 'react-native-paper';
import { useEntries } from '../EntriesContext';
import { useProfile } from '../ProfileContext';
import { toDayKey } from '../dates';
import { MOODS, type MoodId } from '../moods';

function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const theme = useTheme();
  const { entries, loading, save } = useEntries();
  const { profile } = useProfile();
  const today = toDayKey(new Date());
  const existing = entries.find((e) => e.day === today);

  const [mood, setMood] = useState<MoodId | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  // Once storage has loaded, show what was already written today.
  useEffect(() => {
    if (!loading && existing) {
      setMood(existing.mood);
      setNote(existing.note);
    }
    // Only when loading finishes; later edits are the person's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const onSave = async () => {
    if (!mood) return;
    await save({ day: today, mood, note: note.trim(), updatedAt: new Date().toISOString() });
    setSaved(true);
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Mindtrack" />
      </Appbar.Header>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="headlineMedium">{greeting(new Date())}{profile?.name ? `, ${profile.name}` : ''}</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            How are you feeling today?
          </Text>

          <Card mode="contained" style={styles.card}>
            <Card.Content>
              <View style={styles.moodRow} accessibilityRole="radiogroup">
                {MOODS.map((m) => {
                  const selected = mood === m.id;
                  return (
                    <TouchableRipple
                      key={m.id}
                      onPress={() => setMood(m.id)}
                      borderless
                      style={[
                        styles.mood,
                        selected && { backgroundColor: theme.colors.primaryContainer },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={m.label}
                      testID={`mood-${m.id}`}
                    >
                      <View style={styles.moodInner}>
                        <Icon
                          source={m.icon}
                          size={36}
                          color={selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant}
                        />
                        <Text
                          variant="labelMedium"
                          style={{ color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }}
                        >
                          {m.label}
                        </Text>
                      </View>
                    </TouchableRipple>
                  );
                })}
              </View>
            </Card.Content>
          </Card>

          <TextInput
            mode="outlined"
            label="What's on your mind? (optional)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={5}
            style={styles.note}
            testID="note-input"
          />

          <Button mode="contained" icon="check" onPress={onSave} disabled={!mood} style={styles.save} testID="save-button">
            {existing ? 'Update today' : 'Save today'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar visible={saved} onDismiss={() => setSaved(false)} duration={2500}>
        Saved. Thanks for checking in.
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 8 },
  card: { marginTop: 16 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mood: { borderRadius: 16, flex: 1, marginHorizontal: 2 },
  moodInner: { alignItems: 'center', paddingVertical: 10, gap: 4 },
  note: { marginTop: 16, minHeight: 120 },
  save: { marginTop: 16, alignSelf: 'flex-end' },
});

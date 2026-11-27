import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Icon, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AREAS, type AreaId } from '../areas';
import { useProfile } from '../ProfileContext';

// Shown the first time the app opens, and again when someone changes their
// focus areas. GUESS: there is no account or server yet, so "log in" is a
// local setup step; everything stays on the phone.
export default function OnboardingScreen() {
  const theme = useTheme();
  const { profile, save, cancelEditing } = useProfile();
  const [name, setName] = useState(profile?.name ?? '');
  const [areas, setAreas] = useState<AreaId[]>(profile?.focusAreas ?? []);
  const isEdit = profile !== null;

  const toggle = (id: AreaId) => setAreas((cur) => (cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]));

  const onContinue = () =>
    save({ name: name.trim(), focusAreas: areas, createdAt: profile?.createdAt ?? new Date().toISOString() });

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Icon source="sprout-outline" size={48} color={theme.colors.primary} />
        <Text variant="headlineMedium">{isEdit ? 'What you want to work on' : 'Welcome to Mindtrack'}</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          What would you like to improve? Pick as many as you like. You can change this any time.
        </Text>

        {!isEdit && (
          <TextInput
            mode="outlined"
            label="What should we call you? (optional)"
            value={name}
            onChangeText={setName}
            testID="name-input"
            style={styles.name}
          />
        )}

        <View style={styles.grid}>
          {AREAS.map((a) => {
            const selected = areas.includes(a.id);
            return (
              <Surface
                key={a.id}
                elevation={0}
                style={[
                  styles.tile,
                  {
                    backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                    borderColor: selected ? theme.colors.primary : 'transparent',
                  },
                ]}
              >
                <TouchableRipple
                  onPress={() => toggle(a.id)}
                  style={styles.tileInner}
                  borderless
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={a.label}
                  testID={`area-${a.id}`}
                >
                  <View style={styles.tileBody}>
                    <View style={styles.tileTop}>
                      <Icon source={a.icon} size={28} color={selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant} />
                      {selected && <Icon source="check-circle" size={20} color={theme.colors.primary} />}
                    </View>
                    <Text variant="titleMedium" style={{ color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}>
                      {a.label}
                    </Text>
                    <Text variant="bodySmall" style={{ color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }}>
                      {a.description}
                    </Text>
                  </View>
                </TouchableRipple>
              </Surface>
            );
          })}
        </View>

        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Self-check questionnaires are always optional. Your answers stay on this phone.
        </Text>

        <View style={styles.actions}>
          {isEdit && <Button onPress={cancelEditing}>Cancel</Button>}
          <Button mode="contained" onPress={onContinue} disabled={areas.length === 0} testID="continue-button">
            {isEdit ? 'Save' : 'Get started'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, gap: 12 },
  name: { marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  tile: { width: '47%', flexGrow: 1, borderRadius: 16, borderWidth: 2, overflow: 'hidden' },
  tileInner: { borderRadius: 16 },
  tileBody: { padding: 16, gap: 4, minHeight: 120 },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
});

import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Card, Dialog, Icon, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import { useEntries } from '../EntriesContext';
import { formatDay } from '../dates';
import { getMood } from '../moods';

export default function HistoryScreen() {
  const theme = useTheme();
  const { entries, loading, remove } = useEntries();
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="History" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={styles.center} />
      ) : entries.length === 0 ? (
        <View style={styles.empty}>
          <Icon source="notebook-outline" size={48} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium">No entries yet</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Your daily check-ins will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.day}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const mood = getMood(item.mood);
            return (
              <Card mode="elevated" style={styles.card} testID={`entry-${item.day}`}>
                <Card.Title
                  title={formatDay(item.day)}
                  subtitle={mood.label}
                  left={() => <Icon source={mood.icon} size={32} color={theme.colors.primary} />}
                  right={() => (
                    <IconButton icon="delete-outline" accessibilityLabel="Delete entry" onPress={() => setToDelete(item.day)} />
                  )}
                />
                {item.note ? (
                  <Card.Content>
                    <Text variant="bodyMedium">{item.note}</Text>
                  </Card.Content>
                ) : null}
              </Card>
            );
          }}
        />
      )}

      <Portal>
        <Dialog visible={toDelete !== null} onDismiss={() => setToDelete(null)}>
          <Dialog.Title>Delete this entry?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This can't be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setToDelete(null)}>Cancel</Button>
            <Button
              onPress={async () => {
                if (toDelete) await remove(toDelete);
                setToDelete(null);
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { marginTop: 48 },
  list: { padding: 16, gap: 12 },
  card: {},
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
});

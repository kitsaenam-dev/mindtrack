import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from '../../App';
import { EntriesProvider } from '../EntriesContext';
import { ProfileProvider } from '../ProfileContext';
import HistoryScreen from '../screens/HistoryScreen';
import SelfCheckScreen from '../screens/SelfCheckScreen';
import TodayScreen from '../screens/TodayScreen';
import { PROFILE_KEY, RESULTS_KEY, STORAGE_KEY } from '../storage';
import { lightTheme } from '../theme';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

async function wrap(ui: ReactNode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <PaperProvider theme={lightTheme}>
        <ProfileProvider>
          <EntriesProvider>{ui}</EntriesProvider>
        </ProfileProvider>
      </PaperProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

it('saves a mood and note for today', async () => {
  await wrap(<TodayScreen />);
  await screen.findByText('How are you feeling today?');
  await fireEvent.press(screen.getByTestId('mood-good'));
  await fireEvent.changeText(screen.getByTestId('note-input'), '  Went for a walk  ');
  await fireEvent.press(screen.getByTestId('save-button'));

  await screen.findByText('Saved. Thanks for checking in.');
  const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? '[]');
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({ mood: 'good', note: 'Went for a walk' });
});

it('shows saved entries in history', async () => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([{ day: '2026-01-02', mood: 'low', note: 'Tired after work', updatedAt: '2026-01-02T20:00:00Z' }]),
  );
  await wrap(<HistoryScreen />);
  expect(await screen.findByText('Tired after work')).toBeTruthy();
  expect(screen.getByText('Low')).toBeTruthy();
});

it('shows an empty state when there is no history', async () => {
  await wrap(<HistoryScreen />);
  expect(await screen.findByText('No entries yet')).toBeTruthy();
});

async function answerAll(count: number, value: number) {
  for (let i = 0; i < count; i++) {
    await fireEvent.press(screen.getByTestId(`answer-${value}`));
    await fireEvent.press(screen.getByTestId('next-button'));
  }
}

it('runs the anxiety check and shows results with next steps', async () => {
  await wrap(<SelfCheckScreen />);
  await fireEvent.press(await screen.findByText('Anxiety check (GAD-7)'));
  await answerAll(7, 2); // total 14: moderate

  await screen.findByTestId('result-view');
  expect(screen.getByText('Moderate signs of anxiety')).toBeTruthy();
  expect(screen.getByText('What you can do')).toBeTruthy();
  expect(screen.getByText(/Score 14 of 21/)).toBeTruthy();
  expect(screen.queryByTestId('safety-card')).toBeNull();

  await waitFor(async () => {
    const stored = JSON.parse((await AsyncStorage.getItem(RESULTS_KEY)) ?? '[]');
    expect(stored[0]).toMatchObject({ assessment: 'gad7', total: 14 });
  });
});

it('shows the safety message when the self-harm question is answered', async () => {
  await wrap(<SelfCheckScreen />);
  await fireEvent.press(await screen.findByText('Mood check (PHQ-9)'));
  await answerAll(8, 0);
  await answerAll(1, 1);

  await screen.findByTestId('result-view');
  expect(screen.getByTestId('safety-card')).toBeTruthy();
  expect(screen.getByText('14416')).toBeTruthy();
});

const profile = (focusAreas: string[]) =>
  AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ name: 'Asha', focusAreas, createdAt: '2026-11-27T00:00:00Z' }));

it('asks what to improve on first open, then shows the app', async () => {
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <App />
    </SafeAreaProvider>,
  );
  expect(await screen.findByText('Welcome to Mindtrack')).toBeTruthy();
  expect(screen.getByTestId('continue-button')).toBeDisabled();

  await fireEvent.changeText(screen.getByTestId('name-input'), 'Asha');
  await fireEvent.press(screen.getByTestId('area-sleep'));
  await fireEvent.press(screen.getByTestId('continue-button'));

  expect(await screen.findByText(/, Asha/)).toBeTruthy();
  const stored = JSON.parse((await AsyncStorage.getItem(PROFILE_KEY)) ?? 'null');
  expect(stored).toMatchObject({ name: 'Asha', focusAreas: ['sleep'] });
});

it('suggests checks that match the chosen areas and keeps the rest optional', async () => {
  await profile(['anxiety', 'sleep']);
  await wrap(<SelfCheckScreen />);
  expect(await screen.findByText('Suggested for you')).toBeTruthy();
  expect(screen.getByText('Other checks')).toBeTruthy();
  expect(screen.getByTestId('tips-sleep')).toBeTruthy();
  expect(screen.getByText(/All self-checks are optional/)).toBeTruthy();
  // GAD-7 is suggested, so it is listed before the PHQ-9.
  const titles = screen.getAllByText(/check \((GAD-7|PHQ-9)\)/).map((n) => n.props.children);
  expect(titles).toEqual(['Anxiety check (GAD-7)', 'Mood check (PHQ-9)']);
});

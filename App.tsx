import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BottomNavigation, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import { EntriesProvider } from './src/EntriesContext';
import { ProfileProvider, useProfile } from './src/ProfileContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SelfCheckScreen from './src/screens/SelfCheckScreen';
import TodayScreen from './src/screens/TodayScreen';
import { darkTheme, lightTheme } from './src/theme';

const routes = [
  { key: 'today', title: 'Today', focusedIcon: 'emoticon-happy', unfocusedIcon: 'emoticon-happy-outline' },
  { key: 'selfcheck', title: 'Improve', focusedIcon: 'clipboard-text', unfocusedIcon: 'clipboard-text-outline' },
  { key: 'history', title: 'History', focusedIcon: 'calendar-month', unfocusedIcon: 'calendar-month-outline' },
];

const renderScene = BottomNavigation.SceneMap({
  today: TodayScreen,
  selfcheck: SelfCheckScreen,
  history: HistoryScreen,
});

function Main() {
  const { profile, loading, editing } = useProfile();
  const [index, setIndex] = useState(0);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!profile || editing) return <OnboardingScreen />;
  return <BottomNavigation navigationState={{ index, routes }} onIndexChange={setIndex} renderScene={renderScene} />;
}

export default function App() {
  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <PaperProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
        <EntriesProvider>
          <ProfileProvider>
            <Main />
          </ProfileProvider>
        </EntriesProvider>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

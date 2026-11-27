import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

// Material Design 3 baseline themes from react-native-paper, with a calm
// teal seed colour. GUESS: the brand colour was not specified; change it here.
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#006A6A',
    onPrimary: '#FFFFFF',
    primaryContainer: '#9CF1F0',
    onPrimaryContainer: '#002020',
    secondaryContainer: '#CCE8E7',
    onSecondaryContainer: '#051F1F',
    background: '#F4FBFA',
    surface: '#F4FBFA',
    surfaceVariant: '#DAE5E4',
    onSurfaceVariant: '#3F4948',
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#80D5D4',
    onPrimary: '#003737',
    primaryContainer: '#004F4F',
    onPrimaryContainer: '#9CF1F0',
    secondaryContainer: '#324B4B',
    onSecondaryContainer: '#CCE8E7',
    background: '#0E1515',
    surface: '#0E1515',
    surfaceVariant: '#3F4948',
    onSurfaceVariant: '#BEC9C8',
  },
};

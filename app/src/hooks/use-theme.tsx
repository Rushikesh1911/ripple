import React, { createContext, useContext, useState } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themePref: ThemeType;
  setThemePref: (t: ThemeType) => void;
  activeTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePref, setThemePref] = useState<ThemeType>('light'); // default to light mode
  const colorScheme = useDeviceColorScheme();
  const systemTheme = (colorScheme === 'dark' || colorScheme === 'light') ? colorScheme : 'light';
  
  const activeTheme = themePref === 'system' ? systemTheme : themePref;

  return (
    <ThemeContext.Provider value={{ themePref, setThemePref, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { themePref: 'light' as ThemeType, setThemePref: () => {}, activeTheme: 'light' as 'light' | 'dark' };
  return ctx;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  const theme = ctx ? ctx.activeTheme : 'light';
  return Colors[theme];
}

export function useThemeColor(colorName: keyof typeof Colors.light & keyof typeof Colors.dark) {
  const ctx = useContext(ThemeContext);
  const theme = ctx ? ctx.activeTheme : 'light';
  return Colors[theme][colorName];
}

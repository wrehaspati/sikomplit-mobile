import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemePreferenceContextValue = {
  themeMode: ThemeMode;
  isLoaded: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colorScheme: 'light' | 'dark';
};

const THEME_STORAGE_KEY = 'theme_mode';

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadThemeMode = async () => {
      try {
        const storedThemeMode = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (!isActive) {
          return;
        }

        if (storedThemeMode === 'light' || storedThemeMode === 'dark' || storedThemeMode === 'system') {
          setThemeModeState(storedThemeMode);
        } else {
          setThemeModeState('light');
        }
      } catch {
        if (isActive) {
          setThemeModeState('light');
        }
      } finally {
        if (isActive) {
          setIsLoaded(true);
        }
      }
    };

    loadThemeMode();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    SecureStore.setItemAsync(THEME_STORAGE_KEY, themeMode).catch(() => undefined);
  }, [themeMode, isLoaded]);

  const colorScheme: 'light' | 'dark' =
    themeMode === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : themeMode;

  const value = useMemo(
    () => ({
      themeMode,
      isLoaded,
      setThemeMode: setThemeModeState,
      colorScheme,
    }),
    [themeMode, isLoaded, colorScheme]
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export const useThemePreference = () => useContext(ThemePreferenceContext);
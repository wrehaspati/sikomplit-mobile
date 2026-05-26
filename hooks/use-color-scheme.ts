import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useThemePreference } from '@/contexts/theme-context';

export function useColorScheme() {
  const themePreference = useThemePreference();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (themePreference?.isLoaded) {
    return themePreference.colorScheme;
  }

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Beranda' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="login" options={{ presentation: 'card', title: 'Masuk SIKOMPLIT' }} />
        <Stack.Screen name="register" options={{ presentation: 'card', title: 'Daftar SIKOMPLIT' }} />
        <Stack.Screen name="reset-password" options={{ presentation: 'card', title: 'Reset Kata Sandi' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

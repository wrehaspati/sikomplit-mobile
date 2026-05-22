import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { BookmarkProvider } from '@/contexts/bookmark-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <BookmarkProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style="auto" />
          <RootLayoutNav />
        </ThemeProvider>
      </BookmarkProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const auth = useAuth();
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Beranda' }} />
      <Stack.Protected guard={!!auth?.state.token}>
        <Stack.Screen name="form" options={{ presentation: 'card', title: 'Formulir Rekomendasi' }} />
      </Stack.Protected>
      <Stack.Protected guard={!auth?.state.token}>
        <Stack.Screen name="login" options={{ presentation: 'card', title: 'Masuk SIKOMPLIT' }} />
        <Stack.Screen name="register" options={{ presentation: 'card', title: 'Daftar SIKOMPLIT' }} />
        <Stack.Screen name="reset-password" options={{ presentation: 'card', title: 'Reset Kata Sandi' }} />
        <Stack.Screen name="email-verify" options={{ presentation: 'card', title: 'Verifikasi Email' }} />
      </Stack.Protected>
      <Stack.Screen name="fullscreen-alert" options={{ presentation: 'fullScreenModal', headerShown: false }} />
    </Stack>
  );
}
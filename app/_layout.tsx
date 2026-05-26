import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { BookmarkProvider } from '@/contexts/bookmark-context';
import { ThemePreferenceProvider } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getPushNotificationData,
  getPushNotificationRoute,
  registerAndStorePushTokenAsync,
} from '../services/push-notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutContent />
    </ThemePreferenceProvider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <BookmarkProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style="auto" />
          <PushNotificationBootstrap />
          <RootLayoutNav />
        </ThemeProvider>
      </BookmarkProvider>
    </AuthProvider>
  );
}

function PushNotificationBootstrap() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth?.state.isLoading || !auth?.state.token) {
      console.log('Skipping push notification registration');
      return;
    }

    registerAndStorePushTokenAsync()
      .then((token) => {
        console.log('FCM device token stored:', token);
      })
      .catch((error) => {
        console.warn('Push notification registration failed:', error);
      });

    const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
      const data = getPushNotificationData(notification);
      console.log('Push notification received:', data ?? notification.request.content);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = getPushNotificationData(response.notification);
      const route = getPushNotificationRoute(data);

      if (route) {
        router.push(route as never);
      }
    });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, [auth?.state.isLoading, auth?.state.token, router]);

  return null;
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
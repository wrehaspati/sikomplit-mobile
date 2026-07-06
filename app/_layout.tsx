import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { BookmarkProvider } from "@/contexts/bookmark-context";
import {
  SubmissionProvider,
  useSubmissions,
} from "@/contexts/submission-context";
import { ThemePreferenceProvider } from "@/contexts/theme-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Notifications from "expo-notifications";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import {
  getPushNotificationData,
  getPushNotificationRoute,
  registerAndStorePushTokenAsync,
} from "../services/push-notifications";

export const unstable_settings = {
  anchor: "(tabs)",
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
        <SubmissionProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <StatusBar style="auto" />
            <PushNotificationBootstrap />
            <RootLayoutNav />
          </ThemeProvider>
        </SubmissionProvider>
      </BookmarkProvider>
    </AuthProvider>
  );
}

/**
 * Register the device for push notifications and listen for incoming notifications
 */
function PushNotificationBootstrap() {
  const auth = useAuth();
  const router = useRouter();
  const submissions = useSubmissions();

  useEffect(() => {
    if (auth?.state.isLoading || !auth?.state.token) {
      return;
    }

    registerAndStorePushTokenAsync();

    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        getPushNotificationData(notification);
        submissions?.refreshAllSubmissions();
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = getPushNotificationData(response.notification);
        const route = getPushNotificationRoute(data);

        submissions?.refreshAllSubmissions();

        if (route) {
          router.push(route as never);
        }
      });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, [auth?.state.isLoading, auth?.state.token, router, submissions]);

  return null;
}

/**
 * Stack navigation for the application
 */
function RootLayoutNav() {
  const auth = useAuth();
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, title: "Beranda" }}
      />
      <Stack.Protected guard={!!auth?.state.token}>
        <Stack.Screen
          name="form"
          options={{ presentation: "card", title: "Formulir Rekomendasi" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!auth?.state.token}>
        <Stack.Screen
          name="login"
          options={{ presentation: "card", title: "Masuk SIKOMPLIT" }}
        />
        <Stack.Screen
          name="register"
          options={{ presentation: "card", title: "Daftar SIKOMPLIT" }}
        />
        <Stack.Screen
          name="reset-password"
          options={{ presentation: "card", title: "Reset Kata Sandi" }}
        />
        <Stack.Screen
          name="email-verify"
          options={{ presentation: "card", title: "Verifikasi Email" }}
        />
      </Stack.Protected>
      <Stack.Screen
        name="fullscreen-alert"
        options={{ presentation: "fullScreenModal", headerShown: false }}
      />
      <Stack.Screen
        name="term"
        options={{ presentation: "card", title: "Syarat dan Ketentuan" }}
      />
    </Stack>
  );
}

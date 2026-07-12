import { verifyEmailToken } from "@/api/auth-api";
import { FullscreenAlert } from "@/components/alert";
import { ThemedView } from "@/components/themed-view";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";

export default function VerifyEmailDeepLinkScreen() {
  const { email, token } = useLocalSearchParams<{
    email: string;
    token: string;
  }>();
  const sanitizedEmail = email ? email.replace(/ /g, "+") : "";
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      if (!email || !token) {
        if (isMounted) {
          Alert.alert("Error", "Email atau token tidak valid.");
          router.replace("/login");
        }
        return;
      }
      try {
        await verifyEmailToken(sanitizedEmail, token);
        if (isMounted) {
          setVerifying(false);
          FullscreenAlert({
            title: "Email Terverifikasi",
            description:
              "Email berhasil diverifikasi. Silakan login untuk melanjutkan.",
            type: "success",
            buttonHref: "/login",
            buttonText: "Login",
          });
        }
      } catch (error: any) {
        if (isMounted) {
          Alert.alert(
            "Gagal Verifikasi",
            "Tautan tidak valid atau kedaluwarsa.",
          );
          router.replace("/login");
        }
      }
    };
    verify();
    return () => {
      isMounted = false;
    };
  }, [email, token]);

  if (verifying) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return null;
}

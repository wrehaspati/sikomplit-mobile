import { submitNewPassword } from "@/api/auth-api";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

// Zod validation schema
const FormSchema = z
  .object({
    password: z.string().trim().min(8, {
      message: "Password harus diisi minimal 8 karakter.",
    }),
    password_confirmation: z.string().trim(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak sama.",
    path: ["password_confirmation"],
  });

export default function SetNewPasswordScreen() {
  const { email, token } = useLocalSearchParams<{
    email: string;
    token: string;
  }>();
  const sanitizedEmail = email ? email.replace(/ /g, "+") : "";

  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with react hook form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  // Handling form submission
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (!sanitizedEmail || !token) {
      Alert.alert(
        "Gagal Menyimpan",
        "Email atau token tidak valid. Silakan gunakan tautan dari email Anda.",
      );
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    try {
      await submitNewPassword(sanitizedEmail, token, values.password);
      Alert.alert(
        "Berhasil",
        "Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.",
        [
          {
            text: "OK",
            onPress: () => {
              router.dismissTo("/");
            },
          },
        ],
      );
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.data?.message) {
        Alert.alert(
          "Gagal Menyimpan",
          error.response?.data?.message ||
            "Tautan reset kata sandi tidak valid atau sudah kadaluarsa.",
        );
      } else {
        Alert.alert(
          "Kesalahan Sistem",
          "Terjadi kesalahan saat menyimpan kata sandi baru. Silakan coba lagi nanti.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          marginHorizontal: 24,
        }}
      >
        <View style={{ alignItems: "center", width: "100%", gap: 12 }}>
          <ThemedText type="title" style={{ textAlign: "center" }}>
            Kata Sandi Baru
          </ThemedText>
          <ThemedText
            type="subheadline"
            style={{ textAlign: "center" }}
            darkColor={Colors.dark.text.secondary}
            lightColor={Colors.light.text.secondary}
          >
            Silakan masukkan kata sandi baru Anda untuk akun{" "}
            {sanitizedEmail || "Anda"}
          </ThemedText>
          <View style={{ width: "100%", marginTop: 24, gap: 20 }}>
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <ThemedTextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  title="Password Baru"
                  placeholder="Masukan kata sandi baru"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  icon={
                    <IconSymbol
                      name="lock.shield.fill"
                      color={Colors.light.text.secondary}
                    />
                  }
                  secureTextEntry
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="password_confirmation"
              render={({ field, fieldState }) => (
                <ThemedTextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  title="Konfirmasi Password"
                  placeholder="Masukan ulang kata sandi baru"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  icon={
                    <IconSymbol
                      name="lock.shield.fill"
                      color={Colors.light.text.secondary}
                    />
                  }
                  secureTextEntry
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <ThemedButton
              variant="primary"
              size="default"
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                marginTop: 12,
              }}
              disabled={isLoading}
              onPress={form.handleSubmit(onSubmit)}
            >
              {isLoading ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <ThemedText type="defaultSemiBold"> </ThemedText>
                  <ActivityIndicator size="small" color="white" />
                  <ThemedText type="defaultSemiBold"> </ThemedText>
                </View>
              ) : (
                "Simpan Kata Sandi"
              )}
            </ThemedButton>
            <Pressable
              onPress={() => {
                router.canDismiss()
                  ? router.dismiss()
                  : router.navigate("/login");
              }}
              hitSlop={10}
              style={{ alignSelf: "center", marginTop: 8 }}
            >
              <ThemedText
                type="defaultSemiBold"
                lightColor={Colors.accentBlue}
                darkColor={Colors.accentBlue}
              >
                Batal
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

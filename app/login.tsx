import Disclaimer from "@/components/disclaimer";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

// Zod validation schema
const FormSchema = z.object({
  email: z
    .email({
      message: "Periksa kembali email yang Anda masukkan.",
    })
    .trim(),
  password: z.string().trim().min(8, {
    message: "Password harus diisi minimal 8 karakter.",
  }),
});

export default function LoginScreen() {
  const auth = useAuth();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with react hook form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onTouched",
    defaultValues: {
      email: email ?? "",
      password: "",
    },
  });

  // Handling form submission
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (!auth) return;
      await auth.signIn(values);
      router.dismissTo("/");
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert("Gagal Masuk", "Email atau password anda salah");
      } else if (
        error.response?.status === 422 &&
        error.response?.data?.message?.includes("not verified")
      ) {
        router.push({
          pathname: "/email-verify",
          params: { email: values.email },
        });
      } else {
        const code = error.code || error.status || "UNKNOWN_ERROR";
        Alert.alert(
          code,
          "Terjadi kesalahan saat mencoba masuk. Silakan hubungi administrator.",
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
          justifyContent: "space-between",
          marginHorizontal: 24,
        }}
      >
        <View style={{ alignItems: "center", flex: 1, width: "100%", gap: 12 }}>
          <ThemedText type="title" style={{ textAlign: "center" }}>
            Masuk
          </ThemedText>
          <ThemedText
            type="subheadline"
            style={{ textAlign: "center" }}
            darkColor={Colors.dark.text.secondary}
            lightColor={Colors.light.text.secondary}
          >
            Masuk untuk melanjutkan ke SIKOMPLIT
          </ThemedText>
          <View style={{ width: "100%", marginTop: 12, gap: 20 }}>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <ThemedTextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  title="Email"
                  placeholder="Masukan email"
                  autoComplete="email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  icon={
                    <IconSymbol
                      name="envelope.fill"
                      color={Colors.light.text.secondary}
                    />
                  }
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <ThemedTextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  title="Password"
                  placeholder="Masukan kata sandi"
                  autoComplete="password"
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
                "Masuk"
              )}
            </ThemedButton>
            <Pressable
              onPress={() => {
                router.navigate("/send-reset-password");
              }}
              hitSlop={10}
              style={{ alignSelf: "center" }}
            >
              <ThemedText
                type="defaultSemiBold"
                lightColor={Colors.accentBlue}
                darkColor={Colors.accentBlue}
              >
                Lupa Kata Sandi?
              </ThemedText>
            </Pressable>
          </View>
        </View>
        <View style={{ width: "100%", marginVertical: 24, gap: 20 }}>
          <Disclaimer />
          <ThemedButton
            variant="outline"
            size="default"
            style={{ justifyContent: "center" }}
            onPress={() => {
              router.navigate("/register");
            }}
          >
            Buat Akun Baru
          </ThemedButton>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

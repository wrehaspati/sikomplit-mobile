import { verifyEmail } from "@/api/auth-api";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const FormSchema = z.object({
  email: z.email({
    message: "Periksa kembali email yang Anda masukkan.",
  }).trim(),
});

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onTouched",
    defaultValues: {
      email: email,
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (isLoading || cooldown > 0) return;
    setIsLoading(true);
    try {
      await verifyEmail(values.email);
      setIsLoading(false);
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown(cooldown => {
          if (cooldown <= 1) {
            clearInterval(interval);
            return 0;
          }
          return cooldown - 1;
        });
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);
      if (error.response?.status === 400 || error.response?.data?.message.includes("Email sudah terverifikasi")) {
        router.canDismiss() && router.dismissTo({ pathname: "/login", params: { email: values.email } });
        Alert.alert("Email Sudah Terverifikasi", "Silakan login untuk melanjutkan.");
      } else {
        Alert.alert("Gagal Mengirim Verifikasi", "Terjadi kesalahan saat mengirim ulang email verifikasi. Silakan hubungi administrator jika masalah ini terus berlanjut.");
      }
    }
  };

  if (!email) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <ThemedText type="title">Akses Ditolak</ThemedText>
        <ThemedText type="subheadline" style={{ textAlign: 'center' }}>
          Halaman ini hanya dapat diakses melalui proses verifikasi email setelah pendaftaran atau saat login dengan akun yang belum terverifikasi. Silakan kembali ke halaman sebelumnya dan pastikan Anda mengikuti langkah-langkah yang benar untuk memverifikasi email Anda.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24 }}>
        <View style={{ alignItems: 'center', flex: 1, width: '100%', gap: 12 }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>Verifikasi Email</ThemedText>
          <ThemedText type="subheadline" style={{ textAlign: 'center' }}
            darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
            Verifikasi email Anda untuk melanjutkan ke SIKOMPLIT
          </ThemedText>
          <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <ThemedTextInput
                  value={field.value}
                  onChangeText={() => { }}
                  title="Email"
                  placeholder="Gagal memuat email"
                  autoComplete="email"
                  aria-disabled={true}
                  editable={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  icon={<IconSymbol name="envelope.fill" color={Colors.light.text.secondary} />}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <View style={{ width: '100%', gap: 4 }}>
              <ThemedButton
                variant="primary"
                size="default"
                style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 12 }}
                disabled={(isLoading || cooldown > 0)}
                onPress={form.handleSubmit(onSubmit)}>
                {isLoading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedText type="defaultSemiBold">
                      {" "}
                    </ThemedText>
                    <ActivityIndicator size="small" color="white" />
                    <ThemedText type="defaultSemiBold">
                      {" "}
                    </ThemedText>
                  </View>
                ) : (
                  'Kirim Ulang' + (cooldown > 0 ? ` (${cooldown})` : '')
                )}
              </ThemedButton>
              <ThemedButton
                variant="secondary"
                size="default"
                style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 12 }}
                onPress={() => router.canDismiss() && router.dismissTo("/login")}>
                Kembali ke Login
              </ThemedButton>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
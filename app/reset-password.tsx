import { resetPassword } from "@/api/auth-api";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const FormSchema = z.object({
  email: z.email({
    message: "Periksa kembali email yang Anda masukkan.",
  }).trim(),
});

export default function ResetPasswordScreen() {
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onTouched",
    defaultValues: {
      email: "userx1@example.com",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (isLoading || cooldown > 0) return;
    setIsLoading(true);
    try {
      await resetPassword(values.email);
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
        Alert.alert("Gagal Mengirim Permintaan Reset", "Terjadi kesalahan saat mengirim permintaan reset kata sandi. Silakan hubungi administrator jika masalah ini terus berlanjut.");
      }
    }
  };
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24 }}>
        <View style={{ alignItems: 'center', flex: 1, width: '100%', gap: 12 }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>Reset Kata Sandi</ThemedText>
          <ThemedText type="subheadline" style={{ textAlign: 'center' }}>
            Masukkan email untuk mereset kata sandi Anda
          </ThemedText>
          <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <ThemedTextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  title="Email"
                  placeholder="Masukkan email Anda"
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
                'Kirim' + (cooldown > 0 ? ` (${cooldown})` : '')
              )}
            </ThemedButton>
            <Pressable onPress={() => { router.back(); }} hitSlop={10} style={{ alignSelf: 'center' }}>
              <ThemedText type="defaultSemiBold" lightColor={Colors.accentBlue} darkColor={Colors.accentBlue}>
                Kembali
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
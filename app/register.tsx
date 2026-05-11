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
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().trim().min(1, { message: "Nama lengkap wajib diisi." }).min(3, { message: "Nama lengkap minimal 3 karakter." }),
  phone: z.string().trim().min(1, { message: "Nomor telepon wajib diisi." }).regex(/^[0-9+\-\s()]+$/, { message: "Nomor telepon tidak valid." }).min(8, { message: "Nomor telepon minimal 8 karakter." }),
  email: z.string().trim().min(1, { message: "Email wajib diisi." }).email({ message: "Email harus diisi dengan format yang benar." }),
  password: z.string().trim().min(8, { message: "Kata sandi minimal 8 karakter." }),
  confirmPassword: z.string().trim().min(1, { message: "Konfirmasi kata sandi wajib diisi." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak sama.",
  path: ["confirmPassword"],
});

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleNextStep = async () => {
    const isValid = await form.trigger(["name", "phone"]);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    console.log("register", values);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24 }}>
        <View style={{ alignItems: 'center', flex: 1, width: '100%', gap: 12 }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>Daftar Akun</ThemedText>
          <ThemedText type="subheadline" style={{ textAlign: 'center' }}
            darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
            Buat akun baru untuk melanjutkan ke SIKOMPLIT
          </ThemedText>
          {step === 1 && (
            <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <ThemedTextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    title="Nama Lengkap"
                    placeholder="Masukan nama lengkap"
                    autoComplete="name"
                    icon={<IconSymbol name="person.fill" color={Colors.light.text.secondary} />}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <ThemedTextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    title="Nomor Telepon"
                    placeholder="Masukan nomor telepon"
                    autoComplete="tel"
                    keyboardType="phone-pad"
                    icon={<IconSymbol name="phone.fill" color={Colors.light.text.secondary} />}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <ThemedButton variant="primary" size="default" style={{ justifyContent: 'center', marginTop: 12 }}
                onPress={handleNextStep}>
                Selanjutnya
              </ThemedButton>
            </View>
          )}
          {step === 2 && (
            <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
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
                    icon={<IconSymbol name="envelope.fill" color={Colors.light.text.secondary} />}
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
                    title="Kata Sandi"
                    placeholder="Masukan kata sandi"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    icon={<IconSymbol name="lock.shield.fill" color={Colors.light.text.secondary} />}
                    secureTextEntry
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <ThemedTextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    title="Konfirmasi Kata Sandi"
                    placeholder="Masukan ulang kata sandi"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    icon={<IconSymbol name="checkmark.shield.fill" color={Colors.light.text.secondary} />}
                    secureTextEntry
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <View style={{ gap: 4 }}>
                <ThemedButton variant="primary" size="default" style={{ justifyContent: 'center', marginTop: 12 }}
                  onPress={form.handleSubmit(onSubmit)}>
                  Daftar
                </ThemedButton>
                <ThemedButton variant="secondary" size="default" style={{ justifyContent: 'center', marginTop: 12 }}
                  onPress={() => setStep(1)}>
                  Kembali
                </ThemedButton>
              </View>
            </View>
          )}
        </View>
        <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
          <Pressable onPress={() => { router.navigate("/"); }} hitSlop={10} style={{ alignSelf: 'center' }}>
            <ThemedText type="defaultSemiBold" lightColor={Colors.accentBlue} darkColor={Colors.accentBlue}>
              Syarat dan Ketentuan
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
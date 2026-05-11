import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [step, setStep] = useState(1);

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
              <ThemedTextInput title="Nama Lengkap" placeholder="Masukan nama lengkap" autoComplete="name"
                icon={<IconSymbol name="person.fill" color={Colors.light.text.secondary} />} />
              <ThemedTextInput title="Nomor Telepon" placeholder="Masukan nomor telepon" autoComplete="tel"
                icon={<IconSymbol name="phone.fill" color={Colors.light.text.secondary} />} />
              <ThemedButton variant="primary" size="default" style={{ justifyContent: 'center', marginTop: 12 }}
                onPress={() => setStep(2)}>
                Selanjutnya
              </ThemedButton>
            </View>
          )}
          {step === 2 && (
            <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
              <ThemedTextInput title="Email" placeholder="Masukan email" autoComplete="email"
                icon={<IconSymbol name="envelope.fill" color={Colors.light.text.secondary} />} />
              <ThemedTextInput title="Kata Sandi" placeholder="Masukan kata sandi" autoComplete="new-password"
                icon={<IconSymbol name="lock.shield.fill" color={Colors.light.text.secondary} />} secureTextEntry />
              <ThemedTextInput title="Konfirmasi Kata Sandi" placeholder="Masukan ulang kata sandi" autoComplete="new-password"
                icon={<IconSymbol name="checkmark.shield.fill" color={Colors.light.text.secondary} />} secureTextEntry />
              <View style={{ gap: 4 }}>
                <ThemedButton variant="primary" size="default" style={{ justifyContent: 'center', marginTop: 12 }}
                  onPress={() => { }}>
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
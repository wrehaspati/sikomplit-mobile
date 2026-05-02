import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { Link } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [step, setStep] = useState(1);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 23 }}>
        <View style={{ alignItems: 'center', flex: 1, width: '100%', gap: 12 }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>Daftar Akun</ThemedText>
          <ThemedText type="subheadline" style={{ textAlign: 'center' }}
            darkColor={Colors.labelSecondary} lightColor={Colors.labelSecondary}>
            Buat akun baru untuk melanjutkan ke SIKOMPLIT
          </ThemedText>
          {step === 1 && (
            <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
              <ThemedTextInput text="Nama Lengkap" placeholder="Masukan nama lengkap" autoComplete="name"
                icon={<IconSymbol name="person.fill" color={Colors.labelSecondary} />} />
              <ThemedTextInput text="Nomor Telepon" placeholder="Masukan nomor telepon" autoComplete="tel"
                icon={<IconSymbol name="phone.fill" color={Colors.labelSecondary} />} />
              <ThemedButton variant="primary" size="default" style={{ justifyContent: 'center', marginTop: 12 }}
                onPress={() => setStep(2)}>
                Selanjutnya
              </ThemedButton>
            </View>
          )}
          {step === 2 && (
            <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
              <ThemedTextInput text="Email" placeholder="Masukan email" autoComplete="email"
                icon={<IconSymbol name="envelope.fill" color={Colors.labelSecondary} />} />
              <ThemedTextInput text="Kata Sandi" placeholder="Masukan kata sandi" autoComplete="new-password"
                icon={<IconSymbol name="lock.shield.fill" color={Colors.labelSecondary} />} secureTextEntry />
              <ThemedTextInput text="Konfirmasi Kata Sandi" placeholder="Masukan ulang kata sandi" autoComplete="new-password"
                icon={<IconSymbol name="checkmark.shield.fill" color={Colors.labelSecondary} />} secureTextEntry />
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
          <Link href="/" dismissTo style={{ textAlign: 'center' }}>
            <ThemedText type="link">
              Syarat dan Ketentuan
            </ThemedText>
          </Link>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
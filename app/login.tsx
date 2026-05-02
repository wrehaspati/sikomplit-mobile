import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { responsiveScale } from "@/constants/scaling";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 23 }}>
        <View style={{ alignItems: 'center', flex: 1, width: '100%', gap: 12 }}>
          <Image source={require('@/assets/images/app-icon-wide.webp')} style={{ width: '100%', height: responsiveScale(120), marginBottom: 20 }} contentFit="contain" contentPosition={'center'} />
          <ThemedText type="title" style={{ textAlign: 'center' }}>Masuk</ThemedText>
          <ThemedText type="subheadline" style={{ textAlign: 'center' }}
            darkColor={Colors.labelSecondary} lightColor={Colors.labelSecondary}>
            Masuk untuk melanjutkan ke SIKOMPLIT
          </ThemedText>
          <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
            <ThemedTextInput text="Email" placeholder="Masukan email" autoComplete="email"
              icon={<IconSymbol name="envelope.fill" color={Colors.labelSecondary} />} />
            <ThemedTextInput text="Password" placeholder="Masukan kata sandi" autoComplete="password"
              icon={<IconSymbol name="lock.shield.fill" color={Colors.labelSecondary} />} secureTextEntry />
            <ThemedButton variant="primary" size="default" style={{ justifyContent: 'center', marginTop: 12 }} onPress={() => { }}>
              Masuk
            </ThemedButton>
            <Link href="/" dismissTo style={{ textAlign: 'center' }}>
              <ThemedText type="link">Lupa Kata Sandi?</ThemedText>
            </Link>
          </View>
        </View>
        <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
          <ThemedButton variant="outline" size="default" style={{ justifyContent: 'center' }} onPress={() => {
            router.navigate('/');
          }}>
            Buat Akun Baru
          </ThemedButton>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
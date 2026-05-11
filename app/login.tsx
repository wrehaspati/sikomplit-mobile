import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { responsiveScale } from "@/constants/scaling";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24 }}>
        <View style={{ alignItems: 'center', flex: 1, width: '100%', gap: 12 }}>
          <Image source={require('@/assets/images/app-icon-wide.webp')} style={{ width: '100%', height: responsiveScale(120), marginBottom: 20 }} contentFit="contain" contentPosition={'center'} />
          <ThemedText type="title" style={{ textAlign: 'center' }}>Masuk</ThemedText>
          <ThemedText type="subheadline" style={{ textAlign: 'center' }}
            darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
            Masuk untuk melanjutkan ke SIKOMPLIT
          </ThemedText>
          <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
            <ThemedTextInput title="Email" placeholder="Masukan email" autoComplete="email"
              icon={<IconSymbol name="envelope.fill" color={Colors.light.text.secondary} />} />
            <ThemedTextInput title="Password" placeholder="Masukan kata sandi" autoComplete="password"
              icon={<IconSymbol name="lock.shield.fill" color={Colors.light.text.secondary} />} secureTextEntry />
            <ThemedButton variant="primary" size="default" style={{ justifyContent: 'center', marginTop: 12 }} onPress={() => { }}>
              Masuk
            </ThemedButton>
            <Pressable onPress={() => { router.navigate("/reset-password"); }} hitSlop={10} style={{ alignSelf: 'center' }}>
              <ThemedText type="defaultSemiBold" lightColor={Colors.accentBlue} darkColor={Colors.accentBlue}>
                Lupa Kata Sandi?
              </ThemedText>
            </Pressable>
          </View>
        </View>
        <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
          <ThemedButton variant="outline" size="default" style={{ justifyContent: 'center' }} onPress={() => {
            router.navigate("/register");
          }}>
            Buat Akun Baru
          </ThemedButton>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
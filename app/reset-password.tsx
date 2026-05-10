import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24 }}>
        <View style={{ alignItems: 'center', flex: 1, width: '100%', gap: 12 }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>Reset Kata Sandi</ThemedText>
          <ThemedText type="subheadline" style={{ textAlign: 'center' }}>
            Masukan email untuk mereset kata sandi Anda
          </ThemedText>
          <View style={{ width: '100%', marginTop: 12, gap: 20 }}>
            <ThemedTextInput text="Email" placeholder="Masukan email" autoComplete="email"
              icon={<IconSymbol name="envelope.fill" color={Colors.light.text.secondary} />} />
            <ThemedButton variant="primary" size="default" style={{ justifyContent: 'center', marginTop: 12 }} onPress={() => { }}>
              Reset Kata Sandi
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
import { StyleSheet } from 'react-native';

import ThemedButton from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { router } from 'expo-router';

export default function SettingScreen() {
  const auth = useAuth();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Pengaturan</ThemedText>
      <ThemedText>Atur preferensi aplikasi kamu di sini.</ThemedText>
      <ThemedButton onPress={() => {
        auth?.signOut()
        router.navigate('/');
      }}>
        Keluar
      </ThemedButton>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
});

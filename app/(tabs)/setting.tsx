import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Pengaturan</ThemedText>
      <ThemedText>Atur preferensi aplikasi kamu di sini.</ThemedText>
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

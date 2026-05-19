import { Directory, File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import { fetch } from 'expo/fetch';
import { Alert, Linking } from 'react-native';

export async function downloadAndOpenDocument(
  url: string,
  onProgress?: (progressFraction: number) => void
) {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    if (onProgress) {
      onProgress(0.5);
    }

    // Fetch the file with Authorization header
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    if (onProgress) {
      onProgress(0.9);
    }

    // Stream the response into a file
    const fileName = url.split('/').pop()?.split('?')[0] || `file_${Date.now()}`;
    const cacheDir = new Directory(Paths.cache);
    cacheDir.create({ idempotent: true });

    const file = new File(Paths.cache, fileName);

    // Read the response bytes
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    file.write(bytes);

    if (onProgress) {
      onProgress(1);
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri);
      return;
    }

    await Linking.openURL(file.uri);
  } catch (err) {
    console.error('downloadAndOpenDocument error', err);
    Alert.alert('Gagal membuka dokumen', 'Tidak dapat mengunduh atau membuka dokumen. Silakan coba lagi.');
    throw err;
  }
}

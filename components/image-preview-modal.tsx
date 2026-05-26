import { Colors, RADIUS } from '@/constants/theme';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { IconSymbol } from './ui/icon-symbol';

interface Props {
  visible: boolean;
  uri?: string;
  onClose: () => void;
}

export default function ImagePreviewModal({ visible, uri, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      onDismiss={onClose}
    >
      <ImageViewer
        key={uri ?? 'empty'}
        imageUrls={[{ url: uri ?? '' }]}
        saveToLocalByLongPress
        menuContext={{ saveToLocal: 'Simpan ke Galeri', cancel: 'Batal' }}
        renderHeader={() => <View style={styles.header}></View>}
      />
      <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
        <IconSymbol name="x.circle.fill" size={40} color={Colors.light.fill.vibrant.tertiary} />
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    width: '100%',
    position: 'absolute',
  },
  image: {
    width: '90%',
    height: '80%',
    borderRadius: RADIUS.DEFAULT,
    overflow: 'hidden'
  },
  closeButton: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 20
  },
});

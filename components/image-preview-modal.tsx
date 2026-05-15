import { responsiveScale } from '@/constants/scaling';
import { Colors, Radius } from '@/constants/theme';
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} >
      <ImageViewer
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  header: {
    height: 50,
    width: '100%',
    position: 'absolute',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: '90%',
    height: '80%',
    borderRadius: Radius.default,
    overflow: 'hidden'
  },
  closeButton: {
    position: 'absolute',
    top: responsiveScale(80),
    right: 20,
    zIndex: 20
  },
  closeText: {
    color: Colors.light.text.primary,
    fontSize: 18,
    fontWeight: '600'
  }
});

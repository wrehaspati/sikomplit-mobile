import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Lebar layar iPhone 13 Pro Max (dalam poin)
const baseWidth = 428;

export const responsiveScale = (size: number) => {
  const newSize = (SCREEN_WIDTH / baseWidth) * size;
  // Memastikan hasil pembulatan sesuai dengan kepadatan pixel layar
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
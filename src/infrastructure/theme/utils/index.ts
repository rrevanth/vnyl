/**
 * Theme Utils - Central export for all theme utility functions
 */

// Color utilities
export {
  hexToRgb,
  rgbToHex,
  hexToRgba,
  lightenColor,
  darkenColor,
  getContrastRatio,
  isAccessible,
  generateColorPalette,
  getTextColor,
  blendColors,
  createGradientStops,
  generateStateColors,
  extractDominantColor,
  createColorScale,
  mediaColorUtils
} from './color-utils'

// Spacing utilities
export {
  baseSpacing,
  getSpacing,
  getVerticalSpacing,
  getHorizontalSpacing,
  getContainerPadding,
  getSectionSpacing,
  getCardSpacing,
  calculateGridLayout,
  getPosterCardDimensions,
  getBackdropCardDimensions,
  getModalSpacing,
  getNavigationSpacing,
  getFormSpacing,
  getContentSpacing,
  getAnimationSpacing,
  spacingUtils,
  deviceSpacing
} from './spacing-utils'
export type { SpacingSize, GridLayoutResult } from './spacing-utils'
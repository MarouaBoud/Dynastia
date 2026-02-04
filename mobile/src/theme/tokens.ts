/**
 * Design Tokens
 *
 * Single source of truth for the Dynastia design system.
 * "Sanctuary Finance" aesthetic: Soft luxury meets approachable warmth.
 *
 * Not sterile fintech blue. Not childish/gamified.
 * Refined warmth — like a high-end spa for your finances.
 */

// =============================================================================
// Colors
// =============================================================================

export const colors = {
  // Primary - Warm Sage (calm, growth, money)
  primary: {
    50: '#F0F5F3',
    100: '#DCE8E3',
    200: '#B9D1C7',
    300: '#8FB5A6',
    400: '#6B9A88',
    500: '#5B7B6F', // Main primary
    600: '#4A6459',
    700: '#3D5A4F',
    800: '#2D4239',
    900: '#1E2D27',
  },

  // Accent - Soft Gold (wealth, achievement, celebration)
  accent: {
    50: '#FBF7F0',
    100: '#F5ECD9',
    200: '#EBD9B3',
    300: '#DFC68D',
    400: '#D4B366',
    500: '#C9A86C', // Main accent
    600: '#B08E4A',
    700: '#8B6914',
    800: '#6B5210',
    900: '#4A380B',
  },

  // Semantic Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#4A9D7C',
    600: '#059669',
    700: '#047857',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#D4A84B',
    600: '#D97706',
    700: '#B45309',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#C27070',
    600: '#DC2626',
    700: '#B91C1C',
  },

  // Neutrals - Warm grays (not cold blue-grays)
  neutral: {
    0: '#FFFFFF',
    50: '#FAF9F7',
    100: '#F5F3F0',
    200: '#E8E6E3',
    300: '#D4D1CC',
    400: '#A8A29E',
    500: '#7B8794',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },

  // Budget bucket colors (semantic)
  buckets: {
    savings: '#4A9D7C', // Green - growth
    bills: '#3B82F6', // Blue - stability
    lifestyle: '#8B5CF6', // Purple - enjoyment
  },
} as const;

// =============================================================================
// Typography
// =============================================================================

export const typography = {
  // Font families
  fonts: {
    display: 'System', // TODO: Replace with DM Serif Display when loaded
    heading: 'System',
    body: 'System',
    mono: 'monospace',
  },

  // Font sizes with line heights
  sizes: {
    // Display - for hero numbers and headlines
    displayLg: { fontSize: 36, lineHeight: 44 },
    displayMd: { fontSize: 28, lineHeight: 36 },
    displaySm: { fontSize: 24, lineHeight: 32 },

    // Headings
    headingLg: { fontSize: 22, lineHeight: 28 },
    headingMd: { fontSize: 18, lineHeight: 24 },
    headingSm: { fontSize: 16, lineHeight: 22 },

    // Body text
    bodyLg: { fontSize: 16, lineHeight: 24 },
    bodyMd: { fontSize: 14, lineHeight: 20 },
    bodySm: { fontSize: 12, lineHeight: 16 },

    // Labels and captions
    label: { fontSize: 14, lineHeight: 18 },
    caption: { fontSize: 12, lineHeight: 16 },
    tiny: { fontSize: 10, lineHeight: 14 },
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// =============================================================================
// Spacing
// =============================================================================

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

// =============================================================================
// Border Radius
// =============================================================================

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

// =============================================================================
// Shadows
// =============================================================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  // Colored shadows for special elements
  accent: {
    shadowColor: colors.accent[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  success: {
    shadowColor: colors.success[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// =============================================================================
// Animation
// =============================================================================

export const animation = {
  // Durations (ms)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },

  // Easing curves
  easing: {
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// =============================================================================
// Z-Index
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
} as const;

// =============================================================================
// Component-specific tokens
// =============================================================================

export const components = {
  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    padding: {
      sm: { horizontal: 12, vertical: 8 },
      md: { horizontal: 16, vertical: 12 },
      lg: { horizontal: 24, vertical: 16 },
    },
  },
  input: {
    height: 52,
    padding: { horizontal: 16, vertical: 14 },
  },
  card: {
    padding: {
      sm: 12,
      md: 16,
      lg: 20,
    },
  },
} as const;

// =============================================================================
// Theme Export
// =============================================================================

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  animation,
  zIndex,
  components,
} as const;

export type Tokens = typeof tokens;
export type Colors = typeof colors;
export type Typography = typeof typography;

export default tokens;

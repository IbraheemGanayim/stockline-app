/**
 * Spacing system for consistent layout and padding/margin values
 * Based on 8px grid system from Stockline UI Kit
 * @author Ibraheem Ganayim
 */

export const spacing = {
  // Base unit (8px grid system)
  base: 8,

  // Spacing scale
  xs: 4,    // 0.5 * base
  sm: 8,    // 1 * base
  md: 16,   // 2 * base
  lg: 24,   // 3 * base
  xl: 32,   // 4 * base
  '2xl': 40, // 5 * base
  '3xl': 48, // 6 * base
  '4xl': 56, // 7 * base
  '5xl': 64, // 8 * base

  // Common spacing values
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,

  // Screen padding
  screen: {
    horizontal: 16,
    vertical: 20,
    top: 20,
    bottom: 20
  },

  // Component spacing
  component: {
    // Card spacing
    card: {
      padding: 16,
      margin: 8,
      gap: 12
    },
    
    // Button spacing
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      gap: 8
    },
    
    // Input spacing
    input: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16
    },
    
    // List spacing
    list: {
      gap: 8,
      itemPadding: 16
    },

    // Section spacing
    section: {
      marginBottom: 24,
      gap: 16
    }
  },

  // Border radius
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999
  }
};

export default spacing;

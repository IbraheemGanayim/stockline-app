/**
 * Typography system based on Stockline UI Kit design specifications
 * Provides consistent text styling throughout the application
 * @author Ibraheem Ganayim
 */

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System'
  },

  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700'
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },

  // Pre-defined text styles
  styles: {
    // Headers
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.25,
      letterSpacing: -0.5
    },
    h2: {
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 1.3,
      letterSpacing: -0.25
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.375,
      letterSpacing: 0
    },
    h4: {
      fontSize: 20,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0
    },
    h5: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 1.5,
      letterSpacing: 0
    },
    h6: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.5,
      letterSpacing: 0
    },

    // Body text
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.43,
      letterSpacing: 0.25
    },

    // Captions and labels
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.33,
      letterSpacing: 0.4
    },
    overline: {
      fontSize: 10,
      fontWeight: '400',
      lineHeight: 2.66,
      letterSpacing: 1.5,
      textTransform: 'uppercase'
    },

    // Button text
    button: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.75,
      letterSpacing: 0.4,
      textTransform: 'uppercase'
    },

    // Subtitle
    subtitle1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.75,
      letterSpacing: 0.15
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.57,
      letterSpacing: 0.1
    }
  }
};

export default typography;

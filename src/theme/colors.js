/**
 * Color palette based on Stockline stock trading app design
 * Provides consistent color theming throughout the application
 * @author Ibraheem Ganayim
 */

export const colors = {
  // Primary colors - Stockline green theme
  primary: {
    main: '#70C7A0',
    light: '#8DD1B3',
    dark: '#5BB088',
    50: '#F0F9F5',
    100: '#D4F1E5',
    200: '#A8E2CB',
    300: '#7DD4B1',
    400: '#70C7A0',
    500: '#5BB088',
    600: '#4A9970',
    700: '#398257',
    800: '#286B3F',
    900: '#175427'
  },

  // Stock colors for gains/losses
  stock: {
    gain: '#4CAF50',
    loss: '#F44336',
    gainLight: '#E8F5E8',
    lossLight: '#FFEBEE',
    neutral: '#9E9E9E'
  },

  // Secondary colors
  secondary: {
    main: '#FF6B35',
    light: '#FF8A65',
    dark: '#E64A19',
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF6B35',
    600: '#F57C00',
    700: '#EF6C00',
    800: '#E65100',
    900: '#BF360C'
  },

  // Neutral/Gray scale
  neutral: {
    white: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    black: '#000000'
  },

  // Semantic colors
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    background: '#E8F5E8'
  },

  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    background: '#FFF3E0'
  },

  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#D32F2F',
    background: '#FFEBEE'
  },

  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    background: '#E3F2FD'
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F1F3F4',
    grey: '#F8F9FA'
  },

  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
    disabled: '#BDBDBD'
  },

  // Border colors
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575'
  },

  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)'
  }
};

export default colors;

/**
 * ThemeProvider - Context provider for dark mode and light mode support
 * Manages theme state, system detection, and user preferences
 * @author Ibraheem Ganayim
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

// Theme preference options
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// AsyncStorage key for theme preference
const THEME_STORAGE_KEY = '@stockline_theme_preference';

// Create theme context
const ThemeContext = createContext({
  theme: lightColors,
  themeMode: THEME_MODES.SYSTEM,
  isDark: false,
  setThemeMode: () => {},
  colors: lightColors
});

/**
 * ThemeProvider component that manages theme state and preferences
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState(THEME_MODES.SYSTEM);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if dark mode should be active
  const isDark = themeMode === THEME_MODES.DARK || 
    (themeMode === THEME_MODES.SYSTEM && systemColorScheme === 'dark');

  // Get current theme colors
  const theme = isDark ? darkColors : lightColors;
  const colors = theme; // Alias for backward compatibility

  /**
   * Load theme preference from AsyncStorage
   */
  const loadThemePreference = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && Object.values(THEME_MODES).includes(savedTheme)) {
        setThemeModeState(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      // Use default (system) theme if loading fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save theme preference to AsyncStorage
   * @param {string} mode - Theme mode to save
   */
  const saveThemePreference = useCallback(async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  /**
   * Set theme mode and persist preference
   * @param {string} mode - Theme mode to set
   */
  const setThemeMode = useCallback((mode) => {
    if (!Object.values(THEME_MODES).includes(mode)) {
      console.warn(`Invalid theme mode: ${mode}`);
      return;
    }
    
    setThemeModeState(mode);
    saveThemePreference(mode);
  }, [saveThemePreference]);

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  // Update StatusBar style based on theme
  useEffect(() => {
    if (!isLoading) {
      StatusBar.setBarStyle(
        isDark ? 'light-content' : 'dark-content',
        true // animated
      );
    }
  }, [isDark, isLoading]);

  // Context value
  const contextValue = {
    theme,
    themeMode,
    isDark,
    setThemeMode,
    colors, // Alias for backward compatibility
    isLoading
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook to get theme colors directly
 * @returns {Object} Current theme colors
 */
export const useThemeColors = () => {
  const { colors } = useTheme();
  return colors;
};

/**
 * Hook to check if dark mode is active
 * @returns {boolean} Whether dark mode is active
 */
export const useIsDark = () => {
  const { isDark } = useTheme();
  return isDark;
};

export default ThemeProvider;

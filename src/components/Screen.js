/**
 * Screen component - Base wrapper for all screens with theme support
 * Provides consistent safe area handling and padding
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useTheme } from '../contexts/ThemeProvider';

/**
 * Screen component that provides consistent layout and safe area handling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} props.scrollable - Whether screen content should be scrollable (default: false)
 * @param {boolean} props.padding - Whether to apply default padding (default: true)
 * @param {string} props.backgroundColor - Background color (default: theme.colors.background.primary)
 * @param {Object} props.style - Additional styles for the container
 * @param {Object} props.contentContainerStyle - Additional styles for scroll content (when scrollable)
 * @param {boolean} props.keyboardAvoiding - Enable keyboard avoiding behavior (default: true)
 * @param {string} props.statusBarStyle - Status bar style ('light-content' or 'dark-content')
 * @param {boolean} props.hasBottomTabs - Whether the screen has bottom tabs (default: true)
 * @param {number} props.bottomTabHeight - Height of bottom tabs for padding calculation (default: 100)
 */
const Screen = ({
  children,
  scrollable = false,
  padding = true,
  backgroundColor, // Will use theme background if not provided
  style,
  contentContainerStyle,
  keyboardAvoiding = true,
  statusBarStyle, // Will use theme-based status bar if not provided
  hasBottomTabs = true,
  bottomTabHeight = 100,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  
  // Use theme colors if not explicitly provided
  const screenBackgroundColor = backgroundColor || colors.background;
  const screenStatusBarStyle = statusBarStyle || (isDark ? 'light-content' : 'dark-content');
  
  const containerStyle = [
    styles.container,
    { backgroundColor: screenBackgroundColor },
    padding && styles.padding,
    hasBottomTabs && styles.bottomTabPadding,
    style
  ];

  const ContentComponent = scrollable ? ScrollView : View;
  const contentProps = scrollable ? {
    contentContainerStyle: [
      styles.scrollContent,
      padding && styles.padding,
      hasBottomTabs && { paddingBottom: bottomTabHeight },
      contentContainerStyle
    ],
    showsVerticalScrollIndicator: false,
    keyboardShouldPersistTaps: 'handled',
    ...props
  } : props;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screenBackgroundColor }]} edges={['bottom']}>
      <StatusBar 
        barStyle={screenStatusBarStyle} 
        backgroundColor={screenBackgroundColor}
        translucent={false}
      />
      <ContentComponent
        style={scrollable ? styles.scrollContainer : containerStyle}
        {...contentProps}
      >
        {scrollable ? (
          <View style={containerStyle}>
            {children}
          </View>
        ) : (
          children
        )}
      </ContentComponent>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
    // backgroundColor is now dynamic from theme
  },
  container: {
    flex: 1
  },
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  padding: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 16
  },
  bottomTabPadding: {
    paddingBottom: 100 // Default bottom tab padding for non-scrollable content
  }
});

export default Screen;

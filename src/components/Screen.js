/**
 * Screen component - Base wrapper for all screens
 * Provides consistent safe area handling and padding
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

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
 */
const Screen = ({
  children,
  scrollable = false,
  padding = true,
  backgroundColor = '#FFFFFF',
  style,
  contentContainerStyle,
  keyboardAvoiding = true,
  statusBarStyle = 'dark-content',
  ...props
}) => {
  const containerStyle = [
    styles.container,
    { backgroundColor },
    padding && styles.padding,
    style
  ];

  const ContentComponent = scrollable ? ScrollView : View;
  const contentProps = scrollable ? {
    contentContainerStyle: [
      styles.scrollContent,
      padding && styles.padding,
      contentContainerStyle
    ],
    showsVerticalScrollIndicator: false,
    keyboardShouldPersistTaps: 'handled',
    ...props
  } : props;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={backgroundColor}
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
    flex: 1,
    backgroundColor: '#FFFFFF'
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
  }
});

export default Screen;

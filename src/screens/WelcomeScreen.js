/**
 * Welcome Screen - First-time user onboarding after successful account creation
 * Beautiful welcome experience with personalized greeting
 * @author Ibraheem Ganayim
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { PrimaryButton } from '../components';
import { useAuth } from '../contexts/AuthProvider';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

/**
 * WelcomeScreen component for first-time user onboarding
 * @param {Object} navigation - React Navigation object
 * @param {Object} route - Route params containing user data
 */
const WelcomeScreen = ({ navigation, route }) => {
  const { user, clearFirstTimeUser } = useAuth();
  const { userName } = route?.params || {};
  
  // Use the user's display name from auth context, fallback to route param, then default
  const displayName = userName || user?.displayName || 'There';

  /**
   * Handle getting started - clear first-time flag and close welcome screen
   */
  const handleGetStarted = () => {
    // Clear the first-time user flag
    clearFirstTimeUser();
    // Navigate back to main app
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Decorative Elements */}
      <View style={styles.decorativeElements}>
        {/* Top left star */}
        <View style={[styles.star, styles.starTopLeft]} />
        
        {/* Top right shapes */}
        <View style={[styles.circle, styles.circleTopRight]} />
        <View style={[styles.triangle, styles.triangleTopRight]} />
        
        {/* Bottom left star */}
        <View style={[styles.star, styles.starBottomLeft]} />
        
        {/* Bottom right star */}
        <View style={[styles.star, styles.starBottomRight]} />
        
        {/* Additional decorative elements */}
        <View style={[styles.diamond, styles.diamondCenter]} />
        <View style={[styles.zigzag, styles.zigzagLeft]} />
        <View style={[styles.dot, styles.dotBottom]} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <View style={styles.logoShape} />
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Hello {displayName}! 👋</Text>
          <Text style={styles.title}>Welcome to Stockline</Text>
          <Text style={styles.subtitle}>It's great to have you here</Text>
        </View>

        {/* Small decorative dot */}
        <View style={styles.centerDot} />
      </View>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="I'm ready to start!"
          onPress={handleGetStarted}
          style={styles.getStartedButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  logoShape: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    transform: [{ rotate: '45deg' }],
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  getStartedButton: {
    marginTop: 0,
  },
  
  // Decorative Elements
  star: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: theme.colors.primary.main,
    opacity: 0.7,
  },
  starTopLeft: {
    top: height * 0.15,
    left: width * 0.08,
    transform: [{ rotate: '45deg' }],
  },
  starBottomLeft: {
    bottom: height * 0.35,
    left: width * 0.12,
    transform: [{ rotate: '45deg' }],
  },
  starBottomRight: {
    bottom: height * 0.25,
    right: width * 0.15,
    transform: [{ rotate: '45deg' }],
  },
  
  circle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    opacity: 0.8,
  },
  circleTopRight: {
    top: height * 0.12,
    right: width * 0.25,
  },
  
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F59E0B',
    opacity: 0.7,
  },
  triangleTopRight: {
    top: height * 0.18,
    right: width * 0.08,
  },
  
  diamond: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: theme.colors.primary.main,
    transform: [{ rotate: '45deg' }],
    opacity: 0.6,
  },
  diamondCenter: {
    top: height * 0.45,
    right: width * 0.25,
  },
  
  zigzag: {
    position: 'absolute',
    width: 30,
    height: 3,
    backgroundColor: '#FF6B6B',
    opacity: 0.6,
  },
  zigzagLeft: {
    top: height * 0.55,
    left: width * 0.15,
    transform: [{ rotate: '15deg' }],
  },
  
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    opacity: 0.8,
  },
  dotBottom: {
    bottom: height * 0.45,
    left: width * 0.35,
  },
});

export default WelcomeScreen;

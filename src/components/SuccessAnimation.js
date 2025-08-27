/**
 * Success Animation Component
 * Shows a success animation with message for completed transactions
 * @author Ibraheem Ganayim
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

/**
 * SuccessAnimation component
 * @param {string} message - Main success message
 * @param {string} subMessage - Secondary message
 */
const SuccessAnimation = ({ message = 'Success!', subMessage }) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ),
    ]).start();
  }, [scaleAnim, fadeAnim, bounceAnim]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={[theme.colors.success.main, theme.colors.success.light]}
        style={styles.successCard}
      >
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{
                scale: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2]
                })
              }]
            }
          ]}
        >
          <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />
        </Animated.View>
        
        <Text style={styles.successMessage}>{message}</Text>
        {subMessage && (
          <Text style={styles.successSubMessage}>{subMessage}</Text>
        )}
        
        {/* Success particles effect */}
        <View style={styles.particlesContainer}>
          {[...Array(6)].map((_, index) => (
            <Animated.View 
              key={index}
              style={[
                styles.particle,
                {
                  opacity: bounceAnim,
                  transform: [{
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20 - (index * 5)]
                    })
                  }, {
                    translateX: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (index % 2 === 0 ? 1 : -1) * (10 + index * 3)]
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: theme.colors.success.main,
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    minWidth: screenWidth * 0.7,
    shadowColor: theme.colors.success.main,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.7,
  },
});

export default SuccessAnimation;
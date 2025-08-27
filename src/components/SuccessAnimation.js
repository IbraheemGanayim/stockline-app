/**
 * SuccessAnimation - Beautiful success feedback with animations
 * Shows success states for login/signup completion
 * @author Ibraheem Ganayim
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const SuccessAnimation = ({ 
  visible, 
  title = 'Success!', 
  message = 'Welcome back!',
  onComplete,
  duration = 2000 
}) => {
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const checkmarkAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Sequence of animations
      Animated.sequence([
        // Fade in background
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Scale in container
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        // Animate checkmark
        Animated.timing(checkmarkAnimation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Slide in text
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      const timeout = setTimeout(() => {
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onComplete) onComplete();
        });
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [visible, duration, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        { opacity: fadeAnimation }
      ]}
    >
      <Animated.View 
        style={[
          styles.container,
          { 
            transform: [{ scale: scaleAnimation }] 
          }
        ]}
      >
        {/* Success Icon with Animation */}
        <View style={styles.iconContainer}>
          <Animated.View 
            style={[
              styles.iconBackground,
              {
                transform: [
                  {
                    scale: checkmarkAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={{
                opacity: checkmarkAnimation,
                transform: [
                  {
                    scale: checkmarkAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              }}
            >
              <Ionicons 
                name="checkmark" 
                size={48} 
                color="white" 
              />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Success Text */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              transform: [{ translateY: slideAnimation }],
              opacity: slideAnimation.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>

        {/* Ripple Effect */}
        <Animated.View 
          style={[
            styles.ripple,
            {
              transform: [
                {
                  scale: checkmarkAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 3],
                  }),
                },
              ],
              opacity: checkmarkAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.3, 0],
              }),
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    maxWidth: width - 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.stock.gain,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.stock.gain,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.stock.gain,
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -50,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SuccessAnimation;

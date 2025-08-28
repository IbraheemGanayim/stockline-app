/**
 * BackgroundElements component - Decorative background elements
 * Adds subtle design elements typical in stock trading apps
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * BackgroundElements component - Creates decorative background elements
 * Features small circles, lines, and shapes scattered in the background
 */
const BackgroundElements = () => {
  return (
    <View style={styles.container}>
      {/* Small decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />
      <View style={[styles.circle, styles.circle4]} />
      <View style={[styles.circle, styles.circle5]} />
      
      {/* Small decorative lines */}
      <View style={[styles.line, styles.line1]} />
      <View style={[styles.line, styles.line2]} />
      <View style={[styles.line, styles.line3]} />
      
      {/* Small decorative dots */}
      <View style={[styles.dot, styles.dot1]} />
      <View style={[styles.dot, styles.dot2]} />
      <View style={[styles.dot, styles.dot3]} />
      <View style={[styles.dot, styles.dot4]} />
      <View style={[styles.dot, styles.dot5]} />
      <View style={[styles.dot, styles.dot6]} />
      
      {/* Subtle geometric shapes */}
      <View style={[styles.triangle, styles.triangle1]} />
      <View style={[styles.triangle, styles.triangle2]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  
  // Base circle style
  circle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(51, 212, 157, 0.08)', // Very subtle green
  },
  
  // Circle variations
  circle1: {
    width: 60,
    height: 60,
    top: '15%',
    right: '10%',
  },
  circle2: {
    width: 40,
    height: 40,
    top: '25%',
    left: '8%',
    backgroundColor: 'rgba(51, 212, 157, 0.05)',
  },
  circle3: {
    width: 80,
    height: 80,
    bottom: '20%',
    right: '5%',
    backgroundColor: 'rgba(51, 212, 157, 0.04)',
  },
  circle4: {
    width: 30,
    height: 30,
    bottom: '30%',
    left: '15%',
    backgroundColor: 'rgba(51, 212, 157, 0.06)',
  },
  circle5: {
    width: 25,
    height: 25,
    top: '45%',
    right: '20%',
    backgroundColor: 'rgba(51, 212, 157, 0.07)',
  },
  
  // Base line style
  line: {
    position: 'absolute',
    backgroundColor: 'rgba(51, 212, 157, 0.1)',
    borderRadius: 2,
  },
  
  // Line variations
  line1: {
    width: 60,
    height: 2,
    top: '20%',
    left: '25%',
    transform: [{ rotate: '15deg' }],
  },
  line2: {
    width: 40,
    height: 2,
    bottom: '25%',
    right: '30%',
    transform: [{ rotate: '-20deg' }],
    backgroundColor: 'rgba(51, 212, 157, 0.08)',
  },
  line3: {
    width: 30,
    height: 2,
    top: '60%',
    left: '10%',
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'rgba(51, 212, 157, 0.06)',
  },
  
  // Base dot style
  dot: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(51, 212, 157, 0.12)',
  },
  
  // Dot variations
  dot1: {
    width: 6,
    height: 6,
    top: '18%',
    left: '20%',
  },
  dot2: {
    width: 4,
    height: 4,
    top: '35%',
    right: '15%',
    backgroundColor: 'rgba(51, 212, 157, 0.08)',
  },
  dot3: {
    width: 8,
    height: 8,
    bottom: '40%',
    left: '25%',
    backgroundColor: 'rgba(51, 212, 157, 0.10)',
  },
  dot4: {
    width: 5,
    height: 5,
    bottom: '15%',
    right: '25%',
    backgroundColor: 'rgba(51, 212, 157, 0.09)',
  },
  dot5: {
    width: 7,
    height: 7,
    top: '50%',
    left: '5%',
    backgroundColor: 'rgba(51, 212, 157, 0.07)',
  },
  dot6: {
    width: 3,
    height: 3,
    top: '70%',
    right: '10%',
    backgroundColor: 'rgba(51, 212, 157, 0.11)',
  },
  
  // Base triangle style (using transforms)
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  
  // Triangle variations
  triangle1: {
    top: '30%',
    right: '8%',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(51, 212, 157, 0.06)',
    transform: [{ rotate: '15deg' }],
  },
  triangle2: {
    bottom: '35%',
    left: '8%',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(51, 212, 157, 0.08)',
    transform: [{ rotate: '-30deg' }],
  },
});

export default BackgroundElements;

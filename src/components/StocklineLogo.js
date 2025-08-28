/**
 * StocklineLogo component - Simple circle design
 * Clean and professional logo for stock trading app
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * StocklineLogo component - Simple circle with rotated square inside
 * @param {Object} props - Component props
 * @param {number} props.size - Logo size (default: 80)
 * @param {string} props.color - Primary color (default: #33D49D)
 * @param {Object} props.style - Additional styles
 */
const StocklineLogo = ({ 
  size = 80, 
  color = '#33D49D',
  style 
}) => {
  const logoSize = size;
  const innerSquareSize = size * 0.5;

  const containerStyle = {
    width: logoSize,
    height: logoSize,
    borderRadius: logoSize / 2,
    backgroundColor: color,
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  };

  return (
    <View style={[containerStyle, styles.logoContainer, style]}>
      <View style={[styles.logoShape, {
        width: innerSquareSize,
        height: innerSquareSize,
        borderRadius: innerSquareSize / 4,
      }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShape: {
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
});

export default StocklineLogo;

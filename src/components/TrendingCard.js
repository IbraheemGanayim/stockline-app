/**
 * Trending Card Component
 * Horizontal card layout for trending stocks with larger charts
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeProvider';
import { theme } from '../theme';
import MiniChart from './MiniChart';

const TrendingCard = ({ 
  ticker, 
  companyName, 
  price, 
  change, 
  changePercent, 
  onPress,
  customIcon = null,
  iconBackgroundColor = null,
  sparklineData = null
}) => {
  const { colors, isDark } = useTheme();
  const isPositive = change >= 0;
  
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: 'transparent',
          borderColor: colors.border,
        }
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[
          styles.iconContainer,
          iconBackgroundColor && { backgroundColor: iconBackgroundColor }
        ]}>
          {customIcon ? customIcon : (
            <Text style={styles.tickerIcon}>{ticker.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.stockInfo}>
          <Text style={[styles.ticker, { color: colors.textPrimary }]}>{ticker}</Text>
          <Text style={[styles.companyName, { color: colors.textSecondary }]}>{companyName}</Text>
        </View>
      </View>
      
      <View style={styles.chartSection}>
        {sparklineData && (
          <MiniChart 
            data={sparklineData} 
            isPositive={isPositive}
            width={96.5}
            height={49.5}
          />
        )}
      </View>
      
      <View style={styles.priceSection}>
        <Text style={[styles.price, { color: colors.textPrimary }]}>${price.toFixed(2)}</Text>
        <Text style={[styles.changeText, isPositive ? styles.positiveText : styles.negativeText]}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 212,
    height: 136,
    padding: 0,
    marginRight: 16,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    left: 12,
    width: 102,
    height: 40,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#A0AEC0',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  tickerIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  stockInfo: {
    width: 54,
    height: 32,
  },
  ticker: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  companyName: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.2,
  },
  chartSection: {
    position: 'absolute',
    width: 96,
    height: 50,
    right: 8,
    top: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceSection: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    width: 80,
    height: 40,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  positiveText: {
    color: theme.colors.stock.gain,
  },
  negativeText: {
    color: theme.colors.stock.loss,
  },
});

export default TrendingCard;

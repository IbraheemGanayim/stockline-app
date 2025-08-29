/**
 * Stock Card Component
 * Displays individual stock information with price and change
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeProvider';
import { theme } from '../theme';

const StockCard = ({ 
  ticker, 
  companyName, 
  price, 
  change, 
  changePercent, 
  onPress,
  showChart = false,
  customIcon = null,
  iconBackgroundColor = null
}) => {
  const { colors, isDark } = useTheme();
  const isPositive = change >= 0;
  
  return (
    <TouchableOpacity style={[
      styles.card, 
      { 
        backgroundColor: colors.cardBackground,
        shadowOpacity: isDark ? 0.3 : 0.1,
      }
    ]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
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
      
      <View style={styles.rightSection}>
        <Text style={[styles.price, { color: colors.textPrimary }]}>${price.toFixed(2)}</Text>
        <View style={styles.changeContainer}>
          <Text style={[styles.changeText, isPositive ? styles.positiveText : styles.negativeText]}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      {showChart && (
        <View style={styles.chartContainer}>
          <View style={[styles.miniChart, isPositive ? styles.positiveChart : styles.negativeChart]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor is now dynamic from theme
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    // shadowOpacity is now dynamic from theme
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tickerIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  stockInfo: {
    flex: 1,
  },
  ticker: {
    fontSize: 16,
    fontWeight: '700',
    // color is now dynamic from theme
    marginBottom: 2,
  },
  companyName: {
    fontSize: 14,
    // color is now dynamic from theme
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    // color is now dynamic from theme
    marginBottom: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveText: {
    color: theme.colors.stock.gain,
  },
  negativeText: {
    color: theme.colors.stock.loss,
  },
  chartContainer: {
    marginLeft: 12,
  },
  miniChart: {
    width: 60,
    height: 30,
    borderRadius: 4,
  },
  positiveChart: {
    backgroundColor: theme.colors.stock.gainLight,
  },
  negativeChart: {
    backgroundColor: theme.colors.stock.lossLight,
  },
});

export default StockCard;

/**
 * Portfolio Card Component
 * Displays portfolio value summary with gains/losses
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const PortfolioCard = ({ 
  totalValue = 13240.11, 
  dailyChange = 1.74, 
  gainAmount = 234.11, 
  lossAmount = 34.11 
}) => {
  const isPositive = dailyChange >= 0;
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Portfolio value</Text>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        <View style={[styles.changeContainer, isPositive ? styles.positiveChange : styles.negativeChange]}>
          <Text style={[styles.changeText, isPositive ? styles.positiveText : styles.negativeText]}>
            {dailyChange.toFixed(2)}%
          </Text>
          <Ionicons 
            name={isPositive ? 'arrow-up' : 'arrow-down'} 
            size={16} 
            color="white" 
            style={styles.changeIcon}
          />
        </View>
      </View>

      <View style={styles.gainsLossesContainer}>
        <View style={styles.gainLossItem}>
          <View style={styles.gainIndicator} />
          <Text style={styles.gainLossLabel}>Stock Gains: </Text>
          <Text style={styles.gainAmount}>${gainAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.gainLossItem}>
          <View style={styles.lossIndicator} />
          <Text style={styles.gainLossLabel}>Stock Loss: </Text>
          <Text style={styles.lossAmount}>${lossAmount.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
    opacity: 0.9,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  positiveChange: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  negativeChange: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  positiveText: {
    color: 'white',
  },
  negativeText: {
    color: 'white',
  },
  changeIcon: {
    marginLeft: 4,
  },
  gainsLossesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gainLossItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gainIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  lossIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginRight: 8,
  },
  gainLossLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  gainAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  lossAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default PortfolioCard;

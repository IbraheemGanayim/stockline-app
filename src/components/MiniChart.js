/**
 * Mini Chart Component
 * Displays small bar charts/histograms for stock price data
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';

/**
 * Mini Chart component for sparkline visualization using simple bars
 */
const MiniChart = ({ data, isPositive, width = 60, height = 30, style = {} }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const barWidth = width / data.length;
  
  return (
    <View style={[styles.miniChart, { width, height }, style]}>
      {data.map((value, index) => {
        const barHeight = ((value - min) / range) * height * 0.8;
        const marginTop = height - barHeight;
        
        return (
          <View
            key={index}
            style={[
              styles.chartBar,
              {
                width: barWidth * 0.7,
                height: Math.max(barHeight, 2), // Minimum height of 2
                marginTop,
                backgroundColor: isPositive ? theme.colors.stock.gain : theme.colors.stock.loss,
                opacity: 0.3 + (index / data.length) * 0.7, // Gradient effect
                marginRight: index < data.length - 1 ? barWidth * 0.3 : 0,
              }
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartBar: {
    borderRadius: 1,
  },
});

export default MiniChart;

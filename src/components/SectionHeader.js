/**
 * Section Header Component
 * Displays section titles with optional action buttons
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeProvider';
import { theme } from '../theme';

const SectionHeader = ({ 
  title, 
  actionText, 
  onActionPress, 
  showIndicator = false,
  style 
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        {showIndicator && <View style={[styles.indicator, { backgroundColor: colors.buttonPrimary }]} />}
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      
      {actionText && onActionPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 4,
    height: 16,
    // backgroundColor is now dynamic from theme
    borderRadius: 2,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    // color is now dynamic from theme
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    // color is now dynamic from theme
    marginRight: 4,
  },
});

export default SectionHeader;

/**
 * Section Header Component
 * Displays section titles with optional action buttons
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const SectionHeader = ({ 
  title, 
  actionText, 
  onActionPress, 
  showIndicator = false,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        {showIndicator && <View style={styles.indicator} />}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {actionText && onActionPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
          <Text style={styles.actionText}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
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
    backgroundColor: theme.colors.primary.main,
    borderRadius: 2,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    marginRight: 4,
  },
});

export default SectionHeader;

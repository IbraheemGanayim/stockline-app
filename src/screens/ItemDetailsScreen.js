/**
 * Item Details Screen - Detailed view of a specific item
 * Shows full item information with edit/delete options for owner
 * @author Ibraheem Ganayim
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, PrimaryButton } from '../components';
import { useDoc, useAuthUser } from '../hooks';
import { theme } from '../theme';

/**
 * ItemDetailsScreen component for viewing item details
 * @param {Object} route - React Navigation route object
 * @param {Object} navigation - React Navigation object
 */
const ItemDetailsScreen = ({ route, navigation }) => {
  const { itemId, item: initialItem } = route.params;
  const { userId } = useAuthUser();
  
  const { 
    data: item, 
    loading, 
    error, 
    deleteDoc, 
    deleting,
    isOwner 
  } = useDoc(itemId);

  // Use initial item data while loading full data
  const displayItem = item || initialItem;

  /**
   * Handle item deletion with confirmation
   */
  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  /**
   * Confirm and execute item deletion
   */
  const confirmDelete = async () => {
    try {
      const result = await deleteDoc();
      
      if (result.success) {
        Alert.alert(
          'Item Deleted',
          'The item has been successfully deleted.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  /**
   * Format price for display
   * @param {number|string} price - Item price
   * @returns {string} Formatted price
   */
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return price || 'Price not specified';
  };

  /**
   * Render item image
   * @returns {JSX.Element} Image component
   */
  const renderImage = () => {
    if (!displayItem?.imageUrl) {
      return (
        <View style={styles.imagePlaceholder}>
          <Ionicons 
            name="image-outline" 
            size={64} 
            color={theme.colors.text.tertiary} 
          />
          <Text style={styles.imagePlaceholderText}>No Image</Text>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: displayItem.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    );
  };

  /**
   * Render owner actions (edit/delete)
   * @returns {JSX.Element|null} Actions component or null
   */
  const renderOwnerActions = () => {
    if (!isOwner) return null;

    return (
      <View style={styles.ownerActions}>
        <PrimaryButton
          title="Delete Item"
          onPress={handleDelete}
          variant="outline"
          style={[styles.actionButton, styles.deleteButton]}
          textStyle={styles.deleteButtonText}
          loading={deleting}
          loadingText="Deleting..."
        />
      </View>
    );
  };

  /**
   * Render error state
   * @returns {JSX.Element} Error component
   */
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons 
        name="alert-circle-outline" 
        size={64} 
        color={theme.colors.error.main} 
      />
      <Text style={styles.errorTitle}>Failed to load item</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <PrimaryButton
        title="Go Back"
        onPress={() => navigation.goBack()}
        variant="outline"
        style={styles.errorButton}
      />
    </View>
  );

  if (error && !displayItem) {
    return (
      <Screen padding={true}>
        {renderError()}
      </Screen>
    );
  }

  if (!displayItem) {
    return (
      <Screen padding={true}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading item details...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padding={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {renderImage()}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{displayItem.title}</Text>
            <Text style={styles.price}>{formatPrice(displayItem.price)}</Text>
          </View>

          {displayItem.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{displayItem.category}</Text>
            </View>
          )}

          {displayItem.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{displayItem.description}</Text>
            </View>
          )}

          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Ionicons 
                name="calendar-outline" 
                size={16} 
                color={theme.colors.text.tertiary} 
              />
              <Text style={styles.metaText}>
                Created {formatDate(displayItem.createdAt)}
              </Text>
            </View>

            {displayItem.updatedAt && displayItem.updatedAt !== displayItem.createdAt && (
              <View style={styles.metaItem}>
                <Ionicons 
                  name="refresh-outline" 
                  size={16} 
                  color={theme.colors.text.tertiary} 
                />
                <Text style={styles.metaText}>
                  Updated {formatDate(displayItem.updatedAt)}
                </Text>
              </View>
            )}
          </View>

          {renderOwnerActions()}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.background.secondary
  },
  image: {
    width: '100%',
    height: '100%'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[200]
  },
  imagePlaceholderText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
    ...theme.typography.styles.caption
  },
  content: {
    padding: theme.spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 16
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#70C7A0'
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.lg
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    color: '#70C7A0',
    backgroundColor: '#F0F9F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden'
  },
  section: {
    marginBottom: theme.spacing.lg
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24
  },
  metaSection: {
    marginBottom: theme.spacing.xl
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  metaText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8
  },
  ownerActions: {
    marginTop: theme.spacing.lg
  },
  actionButton: {
    marginBottom: theme.spacing.md
  },
  deleteButton: {
    borderColor: theme.colors.error.main
  },
  deleteButtonText: {
    color: theme.colors.error.main
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    ...theme.typography.styles.body1
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.typography.styles.h4
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.typography.styles.body1
  },
  errorButton: {
    paddingHorizontal: theme.spacing.xl
  }
});

export default ItemDetailsScreen;

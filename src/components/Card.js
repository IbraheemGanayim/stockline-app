/**
 * Card component - Reusable card container for list items and content blocks
 * Styled according to Stockline design system
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  Image, 
  StyleSheet 
} from 'react-native';
import { theme } from '../theme';

/**
 * Card component for displaying item information
 * @param {Object} props - Component props
 * @param {Object} props.item - Item data to display
 * @param {Function} props.onPress - Press handler for the card
 * @param {boolean} props.touchable - Whether card is touchable (default: true)
 * @param {Object} props.style - Additional styles for card container
 * @param {string} props.variant - Card variant ('default', 'compact', 'detailed')
 * @param {boolean} props.showImage - Whether to show item image (default: true)
 * @param {boolean} props.showDescription - Whether to show item description (default: true)
 * @param {boolean} props.showPrice - Whether to show item price (default: true)
 * @param {boolean} props.showDate - Whether to show creation date (default: false)
 * @param {React.ReactNode} props.children - Additional content to render
 * @param {React.ReactNode} props.actions - Action buttons or components
 */
const Card = ({
  item,
  onPress,
  touchable = true,
  style,
  variant = 'default',
  showImage = true,
  showDescription = true,
  showPrice = true,
  showDate = false,
  children,
  actions,
  ...props
}) => {
  const CardComponent = touchable ? TouchableOpacity : View;
  const cardProps = touchable ? { onPress, activeOpacity: 0.7 } : {};

  const cardStyle = [
    styles.card,
    styles[`${variant}Card`],
    style
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return price || '';
  };

  const renderImage = () => {
    if (!showImage) return null;

    return (
      <View style={styles.imageContainer}>
        {item?.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {item?.title?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    return (
      <View style={styles.content}>
        <View style={styles.header}>
          {item?.title && (
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          )}
          
          {showPrice && item?.price && (
            <Text style={styles.price}>
              {formatPrice(item.price)}
            </Text>
          )}
        </View>

        {showDescription && item?.description && (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        {showDate && item?.createdAt && (
          <Text style={styles.date}>
            {formatDate(item.createdAt)}
          </Text>
        )}

        {item?.category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>
              {item.category}
            </Text>
          </View>
        )}

        {children}
      </View>
    );
  };

  const renderActions = () => {
    if (!actions) return null;

    return (
      <View style={styles.actions}>
        {actions}
      </View>
    );
  };

  return (
    <CardComponent style={cardStyle} {...cardProps} {...props}>
      {variant === 'compact' ? (
        <View style={styles.compactLayout}>
          {renderImage()}
          <View style={styles.compactContent}>
            {renderContent()}
            {renderActions()}
          </View>
        </View>
      ) : (
        <View style={styles.defaultLayout}>
          {renderImage()}
          {renderContent()}
          {renderActions()}
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },

  // Card variants
  defaultCard: {
    padding: 16
  },
  compactCard: {
    padding: 12
  },
  detailedCard: {
    padding: 20
  },

  // Layout styles
  defaultLayout: {
    flexDirection: 'column'
  },
  compactLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  compactContent: {
    flex: 1,
    marginLeft: theme.spacing.md
  },

  // Image styles
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: theme.spacing.md,
    borderRadius: theme.spacing.radius.md,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center'
  },
  imagePlaceholderText: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.tertiary
  },

  // Content styles
  content: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#70C7A0'
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    color: '#70C7A0',
    backgroundColor: '#F0F9F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden'
  },

  // Actions styles
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm
  },

  // Compact variant specific styles
  compactImageContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.spacing.radius.md,
    overflow: 'hidden'
  }
});

// Compact variant image override
styles.compactLayout = {
  ...styles.compactLayout,
  alignItems: 'flex-start'
};

// Override image container for compact variant
const originalImageContainer = styles.imageContainer;
styles.compactImageContainer = {
  ...originalImageContainer,
  width: 80,
  height: 80,
  marginBottom: 0
};

export default Card;

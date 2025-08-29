/**
 * PrimaryButton component - Main action button with loading and disabled states and theme support
 * Styled according to Stockline design system
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { theme } from '../theme';
import { useTheme } from '../contexts/ThemeProvider';

/**
 * PrimaryButton component with loading and disabled states
 * @param {Object} props - Component props
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Press handler
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.variant - Button variant ('primary', 'secondary', 'outline', 'text')
 * @param {string} props.size - Button size ('small', 'medium', 'large')
 * @param {Object} props.style - Additional styles for button container
 * @param {Object} props.textStyle - Additional styles for button text
 * @param {string} props.loadingText - Text to show when loading
 * @param {boolean} props.fullWidth - Whether button should take full width
 */
const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  loadingText,
  fullWidth = false,
  ...props
}) => {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`${size}Button`]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    switch (variant) {
      case 'secondary':
        baseStyle.push(
          { backgroundColor: theme.colors.secondary.main, borderColor: theme.colors.secondary.main },
          isDisabled && { backgroundColor: theme.colors.neutral[300], borderColor: theme.colors.neutral[300] }
        );
        break;
      case 'outline':
        baseStyle.push(
          { backgroundColor: 'transparent', borderColor: colors.buttonPrimary },
          isDisabled && { backgroundColor: 'transparent', borderColor: theme.colors.neutral[300] }
        );
        break;
      case 'text':
        baseStyle.push(
          { backgroundColor: 'transparent', borderColor: 'transparent', paddingHorizontal: theme.spacing.sm },
          isDisabled && { backgroundColor: 'transparent', borderColor: 'transparent' }
        );
        break;
      default: // primary
        baseStyle.push(
          { backgroundColor: colors.buttonPrimary, borderColor: colors.buttonPrimary },
          isDisabled && { backgroundColor: theme.colors.neutral[300], borderColor: theme.colors.neutral[300] }
        );
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];

    switch (variant) {
      case 'secondary':
        baseStyle.push(
          { color: theme.colors.neutral.white },
          isDisabled && { color: theme.colors.text.disabled }
        );
        break;
      case 'outline':
        baseStyle.push(
          { color: colors.buttonPrimary },
          isDisabled && { color: theme.colors.neutral[400] }
        );
        break;
      case 'text':
        baseStyle.push(
          { color: colors.buttonPrimary },
          isDisabled && { color: theme.colors.neutral[400] }
        );
        break;
      default: // primary
        baseStyle.push(
          { color: colors.buttonText },
          isDisabled && { color: theme.colors.text.disabled }
        );
    }

    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  const getLoadingColor = () => {
    switch (variant) {
      case 'secondary':
      case 'outline':
        return colors.buttonPrimary;
      case 'text':
        return colors.buttonPrimary;
      default: // primary
        return colors.buttonText;
    }
  };

  const displayText = loading && loadingText ? loadingText : title;

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={getLoadingColor()}
          style={styles.loadingIndicator}
        />
      )}
      <Text style={getTextStyle()}>
        {displayText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: {
    width: '100%'
  },

  // Button sizes
  smallButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36
  },
  mediumButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
    borderRadius: 16,
  },
  largeButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    minHeight: 56
  },

  // Primary variant
  primaryButton: {
    backgroundColor: '#33D49D',
    borderColor: '#33D49D'
  },
  primaryButtonDisabled: {
    backgroundColor: theme.colors.neutral[300],
    borderColor: theme.colors.neutral[300]
  },

  // Secondary variant
  secondaryButton: {
    backgroundColor: theme.colors.secondary.main,
    borderColor: theme.colors.secondary.main
  },
  secondaryButtonDisabled: {
    backgroundColor: theme.colors.neutral[300],
    borderColor: theme.colors.neutral[300]
  },

  // Outline variant
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: '#33D49D'
  },
  outlineButtonDisabled: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.neutral[300]
  },

  // Text variant
  textButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: theme.spacing.sm
  },
  textButtonDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent'
  },

  // Text styles
  text: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },

  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Primary text
  primaryText: {
    color: '#FFFFFF'
  },
  primaryTextDisabled: {
    color: theme.colors.text.disabled
  },

  // Secondary text
  secondaryText: {
    color: theme.colors.neutral.white
  },
  secondaryTextDisabled: {
    color: theme.colors.text.disabled
  },

  // Outline text
  outlineText: {
    color: '#33D49D'
  },
  outlineTextDisabled: {
    color: theme.colors.neutral[400]
  },

  // Text button text
  textButtonText: {
    color: '#33D49D'
  },
  textButtonTextDisabled: {
    color: theme.colors.neutral[400]
  },

  // Loading indicator
  loadingIndicator: {
    marginRight: theme.spacing.component.button.gap
  }
});

export default PrimaryButton;

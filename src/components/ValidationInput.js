/**
 * ValidationInput - Enhanced input with real-time validation and feedback
 * Provides visual feedback, validation states, and accessibility features
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const ValidationInput = ({
  label,
  value,
  onChangeText,
  onValidationChange,
  validator,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  style,
  showRequirements = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationResult, setValidationResult] = useState({ 
    isValid: false, 
    message: '', 
    status: 'idle' 
  });
  
  const shakeAnimation = new Animated.Value(0);

  // Real-time validation
  useEffect(() => {
    if (validator && value !== undefined) {
      const result = validator(value);
      setValidationResult(result);
      
      // Call parent validation change handler
      if (onValidationChange) {
        onValidationChange(result);
      }
    }
  }, [value, validator]); // Removed onValidationChange from dependencies to prevent infinite loops

  // Shake animation for errors
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { 
        toValue: 10, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(shakeAnimation, { 
        toValue: -10, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(shakeAnimation, { 
        toValue: 10, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(shakeAnimation, { 
        toValue: 0, 
        duration: 100, 
        useNativeDriver: true 
      }),
    ]).start();
  };

  // Trigger shake when validation fails
  useEffect(() => {
    if (validationResult.status === 'error' && value && value.length > 0) {
      triggerShake();
    }
  }, [validationResult.status]);

  const getStatusIcon = () => {
    if (!value || validationResult.status === 'idle') return null;
    
    switch (validationResult.status) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color={theme.colors.stock.gain} />;
      case 'error':
        return <Ionicons name="close-circle" size={20} color={theme.colors.stock.loss} />;
      case 'typing':
        return <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text.tertiary} />;
      case 'weak':
        return <Ionicons name="shield-outline" size={20} color="#FF9500" />;
      case 'medium':
        return <Ionicons name="shield-half" size={20} color="#FF9500" />;
      default:
        return null;
    }
  };

  const getInputContainerStyle = () => {
    const baseStyle = [styles.inputContainer];
    
    if (isFocused) {
      baseStyle.push(styles.inputContainerFocused);
    }
    
    switch (validationResult.status) {
      case 'success':
        baseStyle.push(styles.inputContainerSuccess);
        break;
      case 'error':
        baseStyle.push(styles.inputContainerError);
        break;
      case 'weak':
      case 'medium':
        baseStyle.push(styles.inputContainerWarning);
        break;
    }
    
    return baseStyle;
  };

  const getMessageStyle = () => {
    switch (validationResult.status) {
      case 'success':
        return styles.successMessage;
      case 'error':
        return styles.errorMessage;
      case 'weak':
      case 'medium':
        return styles.warningMessage;
      default:
        return styles.neutralMessage;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Animated.View 
        style={[
          getInputContainerStyle(),
          { transform: [{ translateX: shakeAnimation }] }
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label || placeholder}
          accessibilityHint={validationResult.message}
          {...props}
        />
        
        <View style={styles.iconContainer}>
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color={theme.colors.text.tertiary} 
              />
            </TouchableOpacity>
          )}
          
          {getStatusIcon()}
        </View>
      </Animated.View>
      
      {/* Validation Message */}
      {validationResult.message && (
        <Text 
          style={[styles.message, getMessageStyle()]}
          accessibilityLiveRegion="polite"
        >
          {validationResult.message}
        </Text>
      )}
      
      {/* Password Requirements */}
      {showRequirements && validationResult.requirements && (
        <View style={styles.requirementsContainer}>
          {Object.entries(validationResult.requirements).map(([key, requirement]) => (
            <View key={key} style={styles.requirementItem}>
              <Ionicons 
                name={requirement.met ? 'checkmark-circle' : 'ellipse-outline'} 
                size={16} 
                color={requirement.met ? theme.colors.stock.gain : theme.colors.text.tertiary} 
              />
              <Text 
                style={[
                  styles.requirementText,
                  requirement.met ? styles.requirementMet : styles.requirementNotMet
                ]}
              >
                {requirement.text}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Password Strength Bar */}
      {validationResult.strength !== undefined && value && (
        <View style={styles.strengthBarContainer}>
          <View style={styles.strengthBarBackground}>
            <View 
              style={[
                styles.strengthBarFill,
                { 
                  width: `${validationResult.strength * 100}%`,
                  backgroundColor: getStrengthColor(validationResult.strength)
                }
              ]} 
            />
          </View>
        </View>
      )}
    </View>
  );
};

const getStrengthColor = (strength) => {
  if (strength < 0.4) return '#FF6B6B';
  if (strength < 0.8) return '#FF9500';
  return theme.colors.stock.gain;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 56,
    paddingHorizontal: 16,
    transition: 'all 0.2s ease',
  },
  inputContainerFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainerSuccess: {
    borderColor: theme.colors.stock.gain,
    backgroundColor: '#F8FDF8',
  },
  inputContainerError: {
    borderColor: theme.colors.stock.loss,
    backgroundColor: '#FFF8F8',
  },
  inputContainerWarning: {
    borderColor: '#FF9500',
    backgroundColor: '#FFF9F0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '400',
    paddingVertical: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordToggle: {
    padding: 4,
  },
  message: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  successMessage: {
    color: theme.colors.stock.gain,
  },
  errorMessage: {
    color: theme.colors.stock.loss,
  },
  warningMessage: {
    color: '#FF9500',
  },
  neutralMessage: {
    color: theme.colors.text.secondary,
  },
  requirementsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 13,
    marginLeft: 8,
  },
  requirementMet: {
    color: theme.colors.stock.gain,
    fontWeight: '500',
  },
  requirementNotMet: {
    color: theme.colors.text.secondary,
  },
  strengthBarContainer: {
    marginTop: 8,
  },
  strengthBarBackground: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'all 0.3s ease',
  },
});

export default ValidationInput;

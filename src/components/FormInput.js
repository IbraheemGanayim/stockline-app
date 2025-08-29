/**
 * FormInput component - Simple and reliable input field with theme support
 * Designed to work perfectly without focus issues
 * @author Ibraheem Ganayim
 */

import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeProvider';

/**
 * Simple FormInput component that always works
 */
const FormInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: colors.inputBackground,
          borderColor: colors.border
        },
        isFocused && {
          backgroundColor: colors.inputBackground,
          borderColor: colors.buttonPrimary,
          shadowColor: colors.buttonPrimary,
        },
        hasError && {
          borderColor: colors.error,
          backgroundColor: colors.inputBackground,
        }
      ]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={true}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {hasError && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 56,
    paddingHorizontal: 16,
    // backgroundColor and borderColor are now dynamic from theme
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 16,
    // color is now dynamic from theme
  },
  passwordToggle: {
    paddingLeft: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
    // color is now dynamic from theme
  }
});

export default FormInput;
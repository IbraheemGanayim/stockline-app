/**
 * Signup Screen - User registration with email, password, and display name
 * Beautiful Stockline UI Kit design with exact color matching
 * @author Ibraheem Ganayim
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ValidationInput, SuccessAnimation, PrimaryButton, StocklineLogo, BackgroundElements, Screen } from '../components';
import { useAuth } from '../contexts/AuthProvider';
import { useTheme } from '../contexts/ThemeProvider';
import { 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword, 
  validateDisplayName,
  getFirebaseErrorMessage 
} from '../utils/validation';
import { theme } from '../theme';

/**
 * SignupScreen component for user registration
 * @param {Object} navigation - React Navigation object
 */
const SignupScreen = ({ navigation }) => {
  const { signUp, loading } = useAuth();
  const { colors, isDark } = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation states
  const [validationStates, setValidationStates] = useState({
    displayName: { isValid: false, status: 'idle' },
    email: { isValid: false, status: 'idle' },
    password: { isValid: false, status: 'idle' },
    confirmPassword: { isValid: false, status: 'idle' }
  });

  // UI states
  const [generalError, setGeneralError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [hasPasswordValue, setHasPasswordValue] = useState(false);

  // Validation handlers - using stable callbacks to prevent infinite loops
  const handleDisplayNameValidation = useCallback((result) => {
    setValidationStates(prev => ({ ...prev, displayName: result }));
    setGeneralError('');
  }, []);

  const handleEmailValidation = useCallback((result) => {
    setValidationStates(prev => ({ ...prev, email: result }));
    setGeneralError('');
  }, []);

  const handlePasswordValidation = useCallback((result) => {
    setValidationStates(prev => ({ ...prev, password: result }));
    setGeneralError('');
  }, []);

  const handleConfirmPasswordValidation = useCallback((result) => {
    setValidationStates(prev => ({ ...prev, confirmPassword: result }));
    setGeneralError('');
  }, []);

  // Confirm password validator - memoized based on current password
  const confirmPasswordValidator = useMemo(() => 
    (confirmPassword) => validateConfirmPassword(formData.password, confirmPassword), 
    [formData.password]
  );

  // Check if form is valid for submission
  const isFormValid = Object.values(validationStates).every(state => state.isValid);

  /**
   * Handle signup form submission
   */
  const handleSignup = async () => {
    setAttemptedSubmit(true);
    
    if (!isFormValid) {
      return;
    }

    try {
      setGeneralError('');
      const result = await signUp(
        formData.email.trim(),
        formData.password,
        formData.displayName.trim()
      );

      if (result.success) {
        // User is now authenticated, auth context will switch to AppStack
        // We'll handle welcome screen navigation in the auth context or separately
        console.log('Account created successfully for:', formData.displayName.trim());
      } else {
        // Show friendly error message
        const friendlyError = getFirebaseErrorMessage(result.error);
        setGeneralError(friendlyError);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setGeneralError('Something unexpected happened. Please try again!');
    }
  };

  /**
   * Navigate back to login screen
   */
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <BackgroundElements />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: colors.cardBackground }]}
              onPress={navigateToLogin}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <StocklineLogo size={80} color={colors.buttonPrimary} />
            </View>
            
            <Text style={[styles.title, { color: colors.textPrimary }]}>Join Stockline</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Start investing for your favorite companies{"\n"}with as little as <Text style={[styles.highlightText, { color: colors.buttonPrimary }]}>$1</Text>
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <ValidationInput
              label="Full Name"
              value={formData.displayName}
              onChangeText={(value) => setFormData(prev => ({ ...prev, displayName: value }))}
              onValidationChange={handleDisplayNameValidation}
              validator={validateDisplayName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />

            <ValidationInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
              onValidationChange={handleEmailValidation}
              validator={validateEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <ValidationInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, password: value }));
                setHasPasswordValue(value.length > 0);
              }}
              onValidationChange={handlePasswordValidation}
              validator={validatePassword}
              placeholder="Create a strong password"
              secureTextEntry={true}
              showRequirements={isPasswordFocused || hasPasswordValue}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />

            <ValidationInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              onValidationChange={handleConfirmPasswordValidation}
              validator={confirmPasswordValidator}
              placeholder="Confirm your password"
              secureTextEntry={true}
            />

            {generalError ? (
              <View style={[styles.errorContainer, { backgroundColor: isDark ? colors.cardBackground : '#FEF2F2', borderColor: colors.error }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{generalError}</Text>
              </View>
            ) : null}

            <PrimaryButton
              title={loading ? 'Creating account...' : 'Create Account'}
              onPress={handleSignup}
              disabled={loading || (attemptedSubmit && !isFormValid)}
              style={[
                styles.continueButton,
                (!isFormValid && attemptedSubmit) && styles.disabledButton
              ]}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>Or continue with</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Ionicons name="logo-google" size={24} color="#4285F4" />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Ionicons name="logo-apple" size={24} color={isDark ? colors.textPrimary : "#000000"} />
              </TouchableOpacity>
            </View>


          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
              <Text style={[styles.signInText, { color: colors.buttonPrimary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
        
      {/* Success Animation */}
      <SuccessAnimation
        visible={showSuccess}
        title="Account created! 🎉"
        message="Welcome to Stockline! Let's start investing"
        onComplete={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
    // backgroundColor is now dynamic from theme
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
    // backgroundColor is now dynamic from theme
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center'
    // color is now dynamic from theme
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20
    // color is now dynamic from theme
  },
  highlightText: {
    fontWeight: '600'
    // color is now dynamic from theme
  },
  formContainer: {
    paddingTop: 8,
  },
  continueButton: {
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1
    // backgroundColor is now dynamic from theme
  },
  dividerText: {
    fontSize: 14,
    marginHorizontal: 16
    // color is now dynamic from theme
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
    // backgroundColor and borderColor are now dynamic from theme
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1
    // backgroundColor and borderColor are now dynamic from theme
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1
    // color is now dynamic from theme
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 16
    // color is now dynamic from theme
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600'
    // color is now dynamic from theme
  },
});

export default SignupScreen;

/**
 * Login Screen - User authentication with email and password
 * Beautiful Stockline UI Kit inspired design with modern styling
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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ValidationInput, SuccessAnimation, PrimaryButton } from '../components';

import { useAuth } from '../contexts/AuthProvider';
import { validateEmail, getFirebaseErrorMessage } from '../utils/validation';
import { runFirebaseConnectionTest } from '../services/connectionTest';
import { theme } from '../theme';

/**
 * LoginScreen component for user authentication
 * @param {Object} navigation - React Navigation object
 */
const LoginScreen = ({ navigation }) => {
  const { signIn, loading } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Validation states
  const [validationStates, setValidationStates] = useState({
    email: { isValid: false, status: 'idle' },
    password: { isValid: false, status: 'idle' }
  });

  // UI states
  const [generalError, setGeneralError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Validation handlers - using useRef to prevent infinite loops
  const handleEmailValidation = useCallback((result) => {
    setValidationStates(prev => ({ ...prev, email: result }));
    // Clear general error when user starts typing
    setGeneralError('');
  }, []);

  const handlePasswordValidation = useCallback((result) => {
    setValidationStates(prev => ({ ...prev, password: result }));
    // Clear general error when user starts typing
    setGeneralError('');
  }, []);

  // Simple password validator for login (just check if not empty) - memoized
  const validatePassword = useMemo(() => (password) => {
    if (!password) {
      return { isValid: false, message: '', status: 'idle' };
    }
    if (password.length === 0) {
      return { isValid: false, message: 'Password is required', status: 'error' };
    }
    return { isValid: true, message: 'Ready to go! ✓', status: 'success' };
  }, []);

  // Check if form is valid for submission
  const isFormValid = validationStates.email.isValid && validationStates.password.isValid;

  /**
   * Handle login form submission
   */
  const handleLogin = async () => {
    setAttemptedSubmit(true);
    
    if (!isFormValid) {
      return;
    }

    try {
      setGeneralError('');
      const result = await signIn(formData.email.trim(), formData.password);

      if (result.success) {
        // Show success animation
        setShowSuccess(true);
        // Navigation will be handled by auth context after animation
      } else {
        // Show friendly error message
        const friendlyError = getFirebaseErrorMessage(result.error);
        setGeneralError(friendlyError);
      }
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError('Something unexpected happened. Please try again!');
    }
  };

  /**
   * Navigate to signup screen
   */
  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  /**
   * Test Firebase connection (for debugging)
   */
  const testConnection = async () => {
    console.log('Testing Firebase connection...');
    const results = await runFirebaseConnectionTest();
    console.log('Connection test results:', results);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
        {/* Header with Logo/Icon */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <View style={styles.logoShape} />
            </View>
          </View>
                      <Text style={styles.title}>Hi There! 👋</Text>
            <Text style={styles.subtitle}>
              Welcome back, Sign in to your account
            </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}> 
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
            onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
            onValidationChange={handlePasswordValidation}
            validator={validatePassword}
            placeholder="Enter your password"
            secureTextEntry={true}
          />

          {generalError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={theme.colors.stock.loss} />
              <Text style={styles.errorText}>{generalError}</Text>
            </View>
          ) : null}

          <PrimaryButton
            title={loading ? 'Signing in...' : 'Sign In'}
            onPress={handleLogin}
            disabled={loading || (attemptedSubmit && !isFormValid)}
            style={[
              styles.continueButton,
              (!isFormValid && attemptedSubmit) && styles.disabledButton
            ]}
          />

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or login with</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#4285F4" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color="#000000" />
            </TouchableOpacity>
          </View>



           {/* Sign Up Link */}
           <View style={styles.signupContainer}>
             <Text style={styles.signupText}>
               Don't have an account?{' '}
             </Text>
             <TouchableOpacity onPress={navigateToSignup} disabled={loading}>
               <Text style={styles.signInText}>Sign Up</Text>
             </TouchableOpacity>
           </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Animation */}
      <SuccessAnimation
        visible={showSuccess}
        title="Welcome back! 👋"
        message="You're all set to start trading"
        onComplete={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#70C7A0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#70C7A0',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoShape: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  highlightText: {
    color: '#70C7A0',
    fontWeight: '600',
  },
  formContainer: {
    paddingTop: 10,
  },
  continueButton: {
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  signupText: {
    fontSize: 16,
    color: '#6B7280',
  },
  signInText: {
    fontSize: 16,
    color: '#70C7A0',
    fontWeight: '600',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 16,
    color: '#70C7A0',
    fontWeight: '500',
  },
});

export default LoginScreen;

/**
 * Validation utilities for real-time input validation
 * Provides friendly, human-readable validation feedback
 * @author Ibraheem Ganayim
 */

/**
 * Email validation with real-time feedback
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with status and message
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: '', status: 'idle' };
  }
  
  if (email.length < 3) {
    return { isValid: false, message: 'Keep typing...', status: 'typing' };
  }
  
  if (!email.includes('@')) {
    return { isValid: false, message: 'Don\'t forget the @ symbol', status: 'error' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Almost there! Check the format', status: 'error' };
  }
  
  return { isValid: true, message: 'Looking good! ✨', status: 'success' };
};

/**
 * Password validation with detailed requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with requirements breakdown
 */
export const validatePassword = (password) => {
  const requirements = {
    minLength: { met: password.length >= 8, text: 'At least 8 characters' },
    uppercase: { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    lowercase: { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    number: { met: /\d/.test(password), text: 'One number' },
    special: { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'One special character' }
  };
  
  const metCount = Object.values(requirements).filter(req => req.met).length;
  const totalRequirements = Object.keys(requirements).length;
  
  let status = 'idle';
  let message = '';
  
  if (!password) {
    status = 'idle';
    message = '';
  } else if (metCount === 0) {
    status = 'error';
    message = 'Password needs to be stronger';
  } else if (metCount < 3) {
    status = 'weak';
    message = 'Getting better...';
  } else if (metCount < totalRequirements) {
    status = 'medium';
    message = 'Almost there!';
  } else {
    status = 'success';
    message = 'Strong password! 🔒';
  }
  
  return {
    isValid: metCount === totalRequirements,
    requirements,
    strength: metCount / totalRequirements,
    status,
    message
  };
};

/**
 * Confirm password validation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} Validation result
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: '', status: 'idle' };
  }
  
  if (confirmPassword.length < password.length) {
    return { isValid: false, message: 'Keep typing...', status: 'typing' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords don\'t match', status: 'error' };
  }
  
  return { isValid: true, message: 'Perfect match! ✓', status: 'success' };
};

/**
 * Display name validation
 * @param {string} displayName - Display name to validate
 * @returns {Object} Validation result
 */
export const validateDisplayName = (displayName) => {
  if (!displayName) {
    return { isValid: false, message: '', status: 'idle' };
  }
  
  if (displayName.length < 2) {
    return { isValid: false, message: 'At least 2 characters needed', status: 'error' };
  }
  
  if (displayName.length > 30) {
    return { isValid: false, message: 'Keep it under 30 characters', status: 'error' };
  }
  
  if (!/^[a-zA-Z0-9\s_-]+$/.test(displayName)) {
    return { isValid: false, message: 'Only letters, numbers, spaces, _ and - allowed', status: 'error' };
  }
  
  return { isValid: true, message: 'Nice choice! ✓', status: 'success' };
};

/**
 * Get user-friendly Firebase error messages
 * @param {string} errorCode - Firebase error code or error object
 * @returns {string} Human-readable error message
 */
export const getFirebaseErrorMessage = (error) => {
  // Handle both error objects and error codes
  const errorCode = typeof error === 'string' ? error : error?.code || error;
  
  const errorMessages = {
    // Login credential errors - more friendly and actionable
    'auth/user-not-found': '🤔 We don\'t recognize that email address. Please rewrite your email or create a new account!',
    'auth/wrong-password': '🔑 That password doesn\'t match our records. Please rewrite your password and try again!',
    'auth/invalid-credential': '🔐 Incorrect email or password. Please rewrite your credentials and try again.',
    'auth/invalid-email': '📧 That email format doesn\'t look right. Please rewrite your email address correctly.',
    
    // Account status errors
    'auth/user-disabled': '⚠️ This account has been temporarily disabled. Please contact our support team for help.',
    'auth/email-already-in-use': '✉️ This email is already registered. Try signing in instead, or use a different email!',
    
    // Security and rate limiting
    'auth/too-many-requests': '⏱️ Slow down there! Too many attempts. Please wait a few minutes and try again.',
    'auth/user-token-expired': '⌛ Your session has expired. Please sign in again to continue.',
    'auth/requires-recent-login': '🔒 For your security, please sign in again to continue.',
    
    // Password strength
    'auth/weak-password': '💪 Let\'s make that password stronger for better security (at least 6 characters).',
    
    // Network and technical errors
    'auth/network-request-failed': '📡 Having trouble connecting. Please check your internet and try again.',
    'auth/operation-not-allowed': '🚫 This sign-in method isn\'t available right now. Please try again later.',
    'auth/app-deleted': '⚙️ Something\'s wrong on our end. Please contact support.',
    'auth/invalid-api-key': '⚙️ Configuration issue detected. Please contact support.',
    'auth/project-not-found': '⚙️ Service configuration error. Please contact support.',
    'auth/quota-exceeded': '📊 Our service is temporarily busy. Please try again in a few minutes.',
    
    // Verification errors
    'auth/email-already-verified': '✅ Your email is already verified!',
    'auth/expired-action-code': '⏰ That verification link has expired. Please request a new one.',
    'auth/invalid-action-code': '🔗 That verification link isn\'t valid. Please request a new one.',
  };
  
  return errorMessages[errorCode] || '🤷 Something unexpected happened. Please rewrite your email and password, then try again. Contact support if the problem continues.';
};

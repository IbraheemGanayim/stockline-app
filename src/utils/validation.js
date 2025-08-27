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
 * @param {string} errorCode - Firebase error code
 * @returns {string} Human-readable error message
 */
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'Hmm, we can\'t find an account with that email. Double-check or sign up!',
    'auth/wrong-password': 'Oops! That password isn\'t quite right. Try again?',
    'auth/email-already-in-use': 'This email is already registered. Try signing in instead!',
    'auth/weak-password': 'Let\'s make that password stronger for better security',
    'auth/invalid-email': 'That email doesn\'t look quite right. Can you check it?',
    'auth/user-disabled': 'This account has been temporarily disabled. Contact support if you need help.',
    'auth/too-many-requests': 'Whoa there! Too many attempts. Take a short break and try again.',
    'auth/network-request-failed': 'Connection trouble! Check your internet and try again.',
    'auth/operation-not-allowed': 'Sign up isn\'t available right now. Try again in a moment.',
    'auth/invalid-credential': 'Something\'s not right with those credentials. Please try again.',
    'auth/user-token-expired': 'Your session expired. Please sign in again.',
    'auth/requires-recent-login': 'For security, please sign in again to continue.',
  };
  
  return errorMessages[errorCode] || 'Something unexpected happened. Please try again!';
};

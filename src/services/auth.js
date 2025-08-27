/**
 * Authentication service using Firebase Auth
 * Handles user registration, login, logout, and session management
 * @author Ibraheem Ganayim
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password  
 * @param {string} displayName - User display name
 * @returns {Promise<Object>} User object or error
 */
export const registerUser = async (email, password, displayName) => {
  console.log('🔄 Starting user registration...', { email, displayName });
  
  if (!auth) {
    console.error('❌ Firebase Auth not initialized');
    return { success: false, error: 'Authentication service not available' };
  }
  
  try {
    // Debug network connectivity
    console.log('🌐 Testing network connectivity...');
    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        timeout: 5000 
      });
      console.log('✅ Network connectivity OK');
    } catch (netError) {
      console.error('❌ Network connectivity issue:', netError.message);
      return { success: false, error: 'Please check your internet connection and try again.' };
    }
    
    console.log('📧 Creating user with Firebase Auth...');
    console.log('🔥 Creating user with createUserWithEmailAndPassword...');
    console.log('🔧 Auth instance:', !!auth);
    console.log('🔧 Auth config:', {
      projectId: auth?.app?.options?.projectId,
      authDomain: auth?.app?.options?.authDomain
    });
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ User created successfully:', user.uid);

    console.log('👤 Updating user profile...');
    await updateProfile(user, {
      displayName: displayName
    });
    console.log('✅ Profile updated');

    if (db) {
      console.log('💾 Creating user document in Firestore...');
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: user.emailVerified
      });
      console.log('✅ User document created');
    }

    console.log('📬 Sending email verification...');
    try {
      await sendEmailVerification(user);
      console.log('✅ Email verification sent');
    } catch (emailError) {
      console.warn('⚠️ Email verification failed:', emailError.message);
    }

    console.log('🎉 Registration completed successfully!');
    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        emailVerified: user.emailVerified
      }
    };
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

/**
 * Retry function for network operations
 * @param {Function} operation - Async operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 */
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !error.code?.includes('network')) {
        throw error;
      }
      console.log(`🔄 Retry ${attempt}/${maxRetries} after network error, waiting ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object or error
 */
export const loginUser = async (email, password) => {
  console.log('🔄 Starting user login...', { email });
  
  if (!auth) {
    console.error('❌ Firebase Auth not initialized');
    return { success: false, error: 'Authentication service not available' };
  }
  
  try {
    // Test basic connectivity first
    console.log('🌐 Testing network connectivity...');
    try {
      await fetch('https://www.google.com', { method: 'HEAD' });
      console.log('✅ Basic network connectivity OK');
    } catch (netError) {
      console.error('❌ No internet connection:', netError.message);
      return { success: false, error: 'Please check your internet connection and try again.' };
    }
    
    console.log('🔐 Signing in with email and password...');
    console.log('🔧 Using auth domain:', auth?.app?.options?.authDomain);
    
    // Use retry logic for Firebase operation
    const userCredential = await retryOperation(async () => {
      return await signInWithEmailAndPassword(auth, email, password);
    });
    const user = userCredential.user;
    console.log('✅ User signed in successfully:', user.uid);

    if (db) {
      console.log('💾 Updating last login time...');
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log('✅ Last login time updated');
      } catch (firestoreError) {
        console.warn('⚠️ Failed to update last login time:', firestoreError.message);
      }
    }

    console.log('🎉 Login completed successfully!');
    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      }
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

/**
 * Sign out current user
 * @returns {Promise<Object>} Success status or error
 */
export const logoutUser = async () => {
  try {
    if (!auth) {
      return { success: false, error: 'Auth not available' };
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<Object>} Success status or error
 */
export const resetPassword = async (email) => {
  try {
    if (!auth) {
      return { success: false, error: 'Auth not available' };
    }
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

/**
 * Get user document from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object>} User document or null
 */
export const getUserDocument = async (uid) => {
  try {
    if (!db) {
      console.error('Firestore not available');
      return null;
    }
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
};

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthState = (callback) => {
  if (!auth) {
    console.error('Auth not available for subscription');
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current authenticated user
 * @returns {Object|null} Current user or null
 */
export const getCurrentUser = () => {
  return auth ? auth.currentUser : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!getCurrentUser();
};

/**
 * Get user authentication state (async check)
 * @returns {Promise<Object|null>} Current user or null
 */
export const getAuthState = () => {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(null);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Update user profile information
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.displayName - Display name
 * @param {string} profileData.photoURL - Photo URL
 * @returns {Promise<Object>} Success status or error
 */
export const updateUserProfile = async (profileData) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'No authenticated user found.' };
    }

    await updateProfile(user, profileData);
    
    // Update Firestore document if available
    if (db) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          ...profileData,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (firestoreError) {
        console.warn('⚠️ Failed to update Firestore profile:', firestoreError.message);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

/**
 * Convert Firebase error codes to user-friendly messages
 * Enhanced for Firebase Auth v9+ modular SDK
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    // Authentication errors
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. Please contact support.';
    
    // Network and configuration errors
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/app-deleted':
      return 'Firebase project configuration error. Please contact support.';
    case 'auth/invalid-api-key':
      return 'Firebase configuration error. Please contact support.';
    case 'auth/project-not-found':
      return 'Firebase project not found. Please contact support.';
    case 'auth/quota-exceeded':
      return 'Service temporarily unavailable. Please try again later.';
    
    // Account verification errors
    case 'auth/email-already-verified':
      return 'Email is already verified.';
    case 'auth/expired-action-code':
      return 'Verification link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'Invalid verification link. Please request a new one.';
    
    // Generic fallback
    default:
      console.warn('Unhandled Firebase Auth error:', errorCode);
      return 'An unexpected error occurred. Please try again.';
  }
};

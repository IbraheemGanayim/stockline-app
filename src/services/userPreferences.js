/**
 * User Preferences Service
 * Handles user preferences storage in both AsyncStorage and Firebase
 * @author Ibraheem Ganayim
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Storage keys
const STORAGE_KEYS = {
  USER_PREFERENCES: '@YallaBit:userPreferences',
  LANGUAGE: '@YallaBit:selectedLanguage',
  NOTIFICATIONS: '@YallaBit:notificationSettings',
  EMAIL_PREFERENCES: '@YallaBit:emailPreferences'
};

/**
 * Default user preferences
 */
const DEFAULT_PREFERENCES = {
  language: 'english',
  notifications: {
    push: true,
    email: true,
    marketUpdates: true,
    portfolioAlerts: true,
    priceAlerts: true
  },
  emailPreferences: {
    newsletter: true,
    marketSummary: true,
    tradingAlerts: true,
    promotions: false
  },
  privacy: {
    shareAnalytics: true,
    personalizedAds: false
  },
  display: {
    theme: 'light',
    currency: 'USD',
    numberFormat: 'US'
  }
};

/**
 * Get user preferences from AsyncStorage
 * @returns {Promise<Object>} User preferences object
 */
export const getUserPreferences = async () => {
  try {
    const preferences = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (preferences) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(preferences) };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Save user preferences to AsyncStorage
 * @param {Object} preferences - Preferences object to save
 * @returns {Promise<boolean>} Success status
 */
export const saveUserPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
};

/**
 * Update specific preference
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 * @returns {Promise<boolean>} Success status
 */
export const updateUserPreference = async (key, value) => {
  try {
    const currentPreferences = await getUserPreferences();
    const updatedPreferences = { ...currentPreferences, [key]: value };
    return await saveUserPreferences(updatedPreferences);
  } catch (error) {
    console.error('Error updating user preference:', error);
    return false;
  }
};

/**
 * Sync user preferences with Firebase
 * @param {string} userId - User ID
 * @param {Object} preferences - Preferences to sync
 * @returns {Promise<Object>} Result object with success status
 */
export const syncPreferencesWithFirebase = async (userId, preferences) => {
  if (!userId || !db) {
    return { success: false, error: 'User ID or Firebase not available' };
  }

  try {
    const userPrefsRef = doc(db, 'userPreferences', userId);
    await setDoc(userPrefsRef, {
      ...preferences,
      userId,
      updatedAt: new Date().toISOString(),
      syncedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error syncing preferences with Firebase:', error);
    return { 
      success: false, 
      error: 'Failed to sync preferences with server' 
    };
  }
};

/**
 * Load user preferences from Firebase
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Preferences object or null
 */
export const loadPreferencesFromFirebase = async (userId) => {
  if (!userId || !db) {
    return null;
  }

  try {
    const userPrefsRef = doc(db, 'userPreferences', userId);
    const prefsSnap = await getDoc(userPrefsRef);
    
    if (prefsSnap.exists()) {
      const firebasePrefs = prefsSnap.data();
      
      // Merge with local preferences and save locally
      const localPrefs = await getUserPreferences();
      const mergedPrefs = { ...localPrefs, ...firebasePrefs };
      
      await saveUserPreferences(mergedPrefs);
      return mergedPrefs;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading preferences from Firebase:', error);
    return null;
  }
};

/**
 * Update language preference
 * @param {string} userId - User ID
 * @param {string} language - Language code
 * @returns {Promise<Object>} Result object
 */
export const updateLanguagePreference = async (userId, language) => {
  try {
    // Save locally
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    await updateUserPreference('language', language);
    
    // Sync with Firebase if user is logged in
    if (userId) {
      const preferences = await getUserPreferences();
      await syncPreferencesWithFirebase(userId, preferences);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating language preference:', error);
    return { 
      success: false, 
      error: 'Failed to update language preference' 
    };
  }
};

/**
 * Get language preference
 * @returns {Promise<string>} Language code
 */
export const getLanguagePreference = async () => {
  try {
    const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return language || 'english';
  } catch (error) {
    console.error('Error getting language preference:', error);
    return 'english';
  }
};

/**
 * Update notification preferences
 * @param {string} userId - User ID
 * @param {Object} notificationSettings - Notification settings
 * @returns {Promise<Object>} Result object
 */
export const updateNotificationPreferences = async (userId, notificationSettings) => {
  try {
    await updateUserPreference('notifications', notificationSettings);
    
    if (userId) {
      const preferences = await getUserPreferences();
      await syncPreferencesWithFirebase(userId, preferences);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { 
      success: false, 
      error: 'Failed to update notification preferences' 
    };
  }
};

/**
 * Reset all preferences to default
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object
 */
export const resetPreferencesToDefault = async (userId) => {
  try {
    await saveUserPreferences(DEFAULT_PREFERENCES);
    
    if (userId) {
      await syncPreferencesWithFirebase(userId, DEFAULT_PREFERENCES);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error resetting preferences:', error);
    return { 
      success: false, 
      error: 'Failed to reset preferences' 
    };
  }
};

/**
 * Export user preferences data
 * @returns {Promise<Object>} Preferences data for export
 */
export const exportUserPreferences = async () => {
  try {
    const preferences = await getUserPreferences();
    return {
      success: true,
      data: {
        preferences,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
  } catch (error) {
    console.error('Error exporting preferences:', error);
    return { 
      success: false, 
      error: 'Failed to export preferences' 
    };
  }
};

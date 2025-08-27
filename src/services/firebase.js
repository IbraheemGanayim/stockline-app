/**
 * Firebase configuration for YallaBit (Project ID: yallabit-70fde)
 * Authentication: Email/Password enabled
 * Authorized domains: localhost, yallabit-70fde.firebaseapp.com, yallabit-70fde.web.app
 * Using modular Firebase SDK v9+ with AsyncStorage persistence
 */

import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_USE_EMULATORS
} from '@env';

// Firebase config from .env file 
const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Firebase Config from .env file loaded');
console.log('📊 Project ID:', firebaseConfig.projectId);
console.log('🔑 API Key (first 10 chars):', firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'MISSING');
console.log('🌐 Auth Domain:', firebaseConfig.authDomain);

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

// Initialize Firebase Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('🔐 Firebase Auth initialized with AsyncStorage persistence');
  
  // iOS Simulator specific network debugging
  if (__DEV__ && Platform.OS === 'ios') {
    console.log('🍎 iOS Debug Mode - Auth settings:');
    console.log('   - Auth domain:', app.options.authDomain);
    console.log('   - Project ID:', app.options.projectId);
    console.log('   - Platform:', Platform.OS);
    console.log('   - Is simulator:', Platform.isTV !== undefined ? 'Unknown' : 'Likely simulator');
  }
  
  // Optionally connect to local emulators when explicitly enabled
  const useEmulators = String(EXPO_PUBLIC_FIREBASE_USE_EMULATORS).toLowerCase() === 'true';
  if (__DEV__ && useEmulators) {
    try {
      const { connectAuthEmulator } = require('firebase/auth');
      // iOS Simulator uses host machine on 127.0.0.1, Android emulator uses 10.0.2.2
      const emulatorHost = Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://127.0.0.1';
      connectAuthEmulator(auth, `${emulatorHost}:9099`, { disableWarnings: true });
      console.log('🧪 Firebase Auth emulator enabled via env flag');
    } catch (emulatorError) {
      console.log('⚠️ Failed to enable Auth emulator, falling back to production:', emulatorError?.message);
    }
  }
  
} catch (error) {
  // If auth is already initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
    console.log('🔐 Firebase Auth already initialized, using existing instance');
  } else {
    console.error('❌ Firebase Auth initialization error:', error);
    throw error;
  }
}

// Initialize Firestore
const db = getFirestore(app);
console.log('🗄️ Firestore initialized');

// Initialize Storage
const storage = getStorage(app);
console.log('📦 Storage initialized');

// Optionally connect Firestore/Storage emulators via the same flag
try {
  const useEmulators = String(EXPO_PUBLIC_FIREBASE_USE_EMULATORS).toLowerCase() === 'true';
  if (__DEV__ && useEmulators) {
    const emulatorHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
    connectFirestoreEmulator(db, emulatorHost, 8080);
    connectStorageEmulator(storage, emulatorHost, 9199);
    console.log('🧪 Firestore and Storage emulators enabled via env flag');
  }
} catch (e) {
  console.log('⚠️ Failed to enable Firestore/Storage emulators:', e?.message);
}

// Export Firebase services
export { app, auth, db, storage };

// Legacy exports for backward compatibility
export const getFirebaseAuth = () => auth;
export const getFirebaseFirestore = () => db;
export const getFirebaseStorage = () => storage;

export default app;

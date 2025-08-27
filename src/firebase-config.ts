/**
 * Firebase Configuration - TypeScript Implementation
 * Project ID: yallabit-70fde
 * Authentication: Email/Password enabled
 * 
 * Uses modular Firebase SDK v9+ with proper TypeScript support
 * Environment variables should be configured for security
 */

import { Platform } from 'react-native';
import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  Auth, 
  getReactNativePersistence,
  connectAuthEmulator 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage, 
  connectStorageEmulator 
} from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables - Replace with your actual values or use environment configuration
// These should ideally come from environment variables or Firebase hosting config
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key-here",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "yallabit-70fde.firebaseapp.com",
  projectId: "yallabit-70fde", // Your confirmed project ID
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "yallabit-70fde.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase App
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  console.log('📊 Project ID:', firebaseConfig.projectId);
  console.log('🌐 Auth Domain:', firebaseConfig.authDomain);

  // Initialize Firebase Auth with React Native persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('🔐 Firebase Auth initialized with AsyncStorage persistence');
  } catch (error: any) {
    // If auth is already initialized, get the existing instance
    if (error.code === 'auth/already-initialized') {
      auth = getAuth(app);
      console.log('🔐 Firebase Auth already initialized, using existing instance');
    } else {
      console.error('❌ Firebase Auth initialization error:', error);
      throw error;
    }
  }

  // Initialize Firestore
  db = getFirestore(app);
  console.log('🗄️ Firestore initialized successfully');

  // Initialize Storage  
  storage = getStorage(app);
  console.log('📦 Firebase Storage initialized successfully');

  // Connect to emulators in development if enabled
  const useEmulators = process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS === 'true';
  if (__DEV__ && useEmulators) {
    try {
      const emulatorHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
      
      // Connect Auth emulator
      connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { 
        disableWarnings: true 
      });
      
      // Connect Firestore emulator
      connectFirestoreEmulator(db, emulatorHost, 8080);
      
      // Connect Storage emulator
      connectStorageEmulator(storage, emulatorHost, 9199);
      
      console.log('🧪 Firebase emulators connected successfully');
    } catch (emulatorError) {
      console.warn('⚠️ Failed to connect to emulators, using production:', emulatorError);
    }
  }

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Export Firebase services
export { app, auth, db, storage };

// Export configuration for reference
export { firebaseConfig };

// Helper functions to get Firebase services (with null checks)
export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
};

export const getFirebaseFirestore = (): Firestore => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
};

export const getFirebaseStorage = (): FirebaseStorage => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }
  return storage;
};

// Export app as default
export default app;

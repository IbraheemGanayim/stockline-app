/**
 * Firebase Connection Test Utility
 * Helps diagnose Firebase connectivity and configuration issues
 * @author Ibraheem Ganayim
 */

import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

/**
 * Test Firebase Authentication connectivity
 * @returns {Promise<Object>} Test result
 */
export const testFirebaseAuth = async () => {
  try {
    console.log('🔄 Testing Firebase Auth connection...');
    
    if (!auth) {
      return { success: false, error: 'Auth not initialized' };
    }
    
    // Try anonymous sign-in as a connectivity test
    const result = await signInAnonymously(auth);
    await result.user.delete(); // Clean up test user
    
    console.log('✅ Firebase Auth connection successful');
    return { success: true, message: 'Auth connection working' };
  } catch (error) {
    console.error('❌ Firebase Auth connection failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

/**
 * Test Firestore connectivity
 * @returns {Promise<Object>} Test result
 */
export const testFirestore = async () => {
  try {
    console.log('🔄 Testing Firestore connection...');
    
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }
    
    // Try to write a test document
    const testCollection = collection(db, 'connectionTest');
    const docRef = await addDoc(testCollection, {
      timestamp: new Date(),
      test: true
    });
    
    console.log('✅ Firestore connection successful, test doc ID:', docRef.id);
    return { success: true, message: 'Firestore connection working', docId: docRef.id };
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

/**
 * Run comprehensive Firebase connectivity test
 * @returns {Promise<Object>} Complete test results
 */
export const runFirebaseConnectionTest = async () => {
  console.log('🚀 Starting Firebase connection tests...');
  
  const results = {
    auth: await testFirebaseAuth(),
    firestore: await testFirestore(),
    timestamp: new Date().toISOString()
  };
  
  const allSuccess = results.auth.success && results.firestore.success;
  
  if (allSuccess) {
    console.log('🎉 All Firebase services are working correctly!');
  } else {
    console.log('⚠️ Some Firebase services have issues. Check configuration.');
  }
  
  return { ...results, overall: allSuccess };
};

export default { testFirebaseAuth, testFirestore, runFirebaseConnectionTest };

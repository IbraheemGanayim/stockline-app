/**
 * YallaBit Mobile Application
 * A React Native + Expo app for sharing and discovering items
 * Built with Firebase Authentication and Firestore database
 * 
 * @author Ibraheem Ganayim
 * @version 1.0.0
 * 
 * Tech Stack:
 * - React Native + Expo
 * - Firebase Auth & Firestore
 * - React Navigation
 * - Custom UI Components
 */

import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthProvider';
import { RootNavigator } from './src/navigation';

// Override console methods to filter Firebase WebChannel warnings
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('WebChannelConnection RPC') ||
    message.includes('transport errored') ||
    message.includes('Could not reach Cloud Firestore backend')
  ) {
    return; // Suppress these specific warnings
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('Could not reach Cloud Firestore backend') ||
    message.includes('client is offline') ||
    message.includes('The operation could not be completed')
  ) {
    return; // Suppress these specific errors
  }
  originalError.apply(console, args);
};

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Warning: Failed prop type',
  'Warning: componentWillReceiveProps',
  'Setting a timer for a long period of time',
  // Suppress Firebase WebChannel transport warnings (these are non-critical)
  'WebChannelConnection RPC',
  'transport errored',
  'Could not reach Cloud Firestore backend',
  'The operation could not be completed',
  'client is offline',
  '@firebase/firestore: Firestore',
]);

/**
 * Main App component that sets up providers and navigation
 * @returns {JSX.Element} The complete app with all providers
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

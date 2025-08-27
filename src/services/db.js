/**
 * Firestore database service
 * Handles CRUD operations for items and user data
 * @author Ibraheem Ganayim
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Mock data for offline mode
const mockItems = [
  {
    id: 'mock-1',
    title: 'Sample Item 1',
    description: 'This is a sample item to show when Firebase is offline',
    price: 25.99,
    category: 'Electronics',
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-2',
    title: 'Sample Item 2',
    description: 'Another sample item for demonstration purposes',
    price: 15.50,
    category: 'Books',
    userId: 'demo-user',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Track if we're in offline mode
let isOfflineMode = false;

/**
 * Create a new item in Firestore
 * @param {Object} itemData - Item data to create
 * @param {string} userId - ID of the user creating the item
 * @returns {Promise<Object>} Created item with ID or error
 */
export const createItem = async (itemData, userId) => {
  try {
    const itemsRef = collection(db, 'items');
    const newItem = {
      ...itemData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(itemsRef, newItem);
    
    return {
      success: true,
      item: {
        id: docRef.id,
        ...newItem
      }
    };
  } catch (error) {
    console.error('Error creating item:', error);
    return {
      success: false,
      error: 'Failed to create item. Please try again.'
    };
  }
};

/**
 * Update an existing item
 * @param {string} itemId - ID of the item to update
 * @param {Object} updates - Updates to apply
 * @param {string} userId - ID of the user updating the item
 * @returns {Promise<Object>} Success status or error
 */
export const updateItem = async (itemId, updates, userId) => {
  try {
    const itemRef = doc(db, 'items', itemId);
    
    // First check if the item exists and user owns it
    const itemSnap = await getDoc(itemRef);
    if (!itemSnap.exists()) {
      return {
        success: false,
        error: 'Item not found.'
      };
    }

    if (itemSnap.data().userId !== userId) {
      return {
        success: false,
        error: 'You can only update your own items.'
      };
    }

    await updateDoc(itemRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      success: false,
      error: 'Failed to update item. Please try again.'
    };
  }
};

/**
 * Delete an item
 * @param {string} itemId - ID of the item to delete
 * @param {string} userId - ID of the user deleting the item
 * @returns {Promise<Object>} Success status or error
 */
export const deleteItem = async (itemId, userId) => {
  try {
    const itemRef = doc(db, 'items', itemId);
    
    // First check if the item exists and user owns it
    const itemSnap = await getDoc(itemRef);
    if (!itemSnap.exists()) {
      return {
        success: false,
        error: 'Item not found.'
      };
    }

    if (itemSnap.data().userId !== userId) {
      return {
        success: false,
        error: 'You can only delete your own items.'
      };
    }

    await deleteDoc(itemRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      success: false,
      error: 'Failed to delete item. Please try again.'
    };
  }
};

/**
 * Get a single item by ID
 * @param {string} itemId - ID of the item to fetch
 * @returns {Promise<Object>} Item data or null
 */
export const getItem = async (itemId) => {
  try {
    const itemRef = doc(db, 'items', itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (itemSnap.exists()) {
      return {
        id: itemSnap.id,
        ...itemSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

/**
 * Get all items for a specific user
 * @param {string} userId - ID of the user
 * @param {number} limitCount - Maximum number of items to fetch
 * @returns {Promise<Array>} Array of items
 */
export const getUserItems = async (userId, limitCount = 50) => {
  if (!db) {
    console.warn('Firestore not initialized, returning mock user data');
    return mockItems.filter(item => item.userId === userId || userId === 'demo-user').slice(0, limitCount);
  }
  
  try {
    const itemsRef = collection(db, 'items');
    const q = query(
      itemsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const items = [];
    
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });

    isOfflineMode = false;
    return items;
  } catch (error) {
    console.error('Error getting user items:', error);
    isOfflineMode = true;
    
    if (error.code === 'failed-precondition') {
      console.error('Missing Firestore index. Please create the index in Firebase Console.');
      console.log('Returning mock user items while index is being created...');
    } else if (error.code === 'unavailable') {
      console.warn('Firestore is currently unavailable. Showing mock data...');
    }
    
    // Return mock items for this user
    return mockItems.filter(item => item.userId === userId || userId === 'demo-user').slice(0, limitCount);
  }
};

/**
 * Get all items (public view)
 * @param {number} limitCount - Maximum number of items to fetch
 * @returns {Promise<Array>} Array of items
 */
export const getAllItems = async (limitCount = 50) => {
  if (!db) {
    console.warn('Firestore not initialized, returning mock data');
    return mockItems.slice(0, limitCount);
  }
  
  try {
    const itemsRef = collection(db, 'items');
    const q = query(
      itemsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const items = [];
    
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });

    isOfflineMode = false; // Successfully connected
    return items;
  } catch (error) {
    console.error('Error getting all items:', error);
    isOfflineMode = true;
    
    if (error.code === 'failed-precondition') {
      console.error('Missing Firestore index. Please create the index in Firebase Console.');
      console.log('Returning mock data while index is being created...');
    } else if (error.code === 'unavailable') {
      console.warn('Firestore is currently unavailable. Showing mock data...');
    }
    
    // Return mock data when Firebase is unavailable
    return mockItems.slice(0, limitCount);
  }
};

/**
 * Subscribe to real-time updates for user items
 * @param {string} userId - ID of the user
 * @param {Function} callback - Callback function to handle updates
 * @param {number} limitCount - Maximum number of items to fetch
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserItems = (userId, callback, limitCount = 50) => {
  if (!db) {
    console.warn('Firestore not initialized, providing mock user data via callback');
    const userMockData = mockItems.filter(item => item.userId === userId || userId === 'demo-user').slice(0, limitCount);
    setTimeout(() => callback(userMockData), 100);
    return () => {}; // Return empty unsubscribe function
  }
  
  try {
    const itemsRef = collection(db, 'items');
    const q = query(
      itemsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(items);
      },
      (error) => {
        console.error('Error in user items snapshot listener:', error);
        if (error.code === 'failed-precondition') {
          console.error('Missing Firestore index. Please create the index in Firebase Console.');
        } else if (error.code === 'unavailable') {
          console.warn('Firestore is currently unavailable. Check your internet connection.');
        }
        // Call callback with empty array on error
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error subscribing to user items:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Subscribe to real-time updates for all items
 * @param {Function} callback - Callback function to handle updates
 * @param {number} limitCount - Maximum number of items to fetch
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAllItems = (callback, limitCount = 50) => {
  if (!db) {
    console.warn('Firestore not initialized, providing mock data via callback');
    setTimeout(() => callback(mockItems.slice(0, limitCount)), 100);
    return () => {}; // Return empty unsubscribe function
  }
  
  try {
    const itemsRef = collection(db, 'items');
    const q = query(
      itemsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          });
        });
        isOfflineMode = false;
        callback(items);
      },
      (error) => {
        console.error('Error in all items snapshot listener:', error);
        isOfflineMode = true;
        
        if (error.code === 'failed-precondition') {
          console.error('Missing Firestore index. Please create the index in Firebase Console.');
          console.log('Showing mock data while index is being created...');
        } else if (error.code === 'unavailable') {
          console.warn('Firestore is currently unavailable. Showing mock data...');
        }
        
        // Return mock data when there's an error
        callback(mockItems.slice(0, limitCount));
      }
    );
  } catch (error) {
    console.error('Error subscribing to all items:', error);
    // Return mock data immediately if subscription fails
    setTimeout(() => callback(mockItems.slice(0, limitCount)), 100);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Update user profile data
 * @param {string} userId - ID of the user
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Success status or error
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: 'Failed to update profile. Please try again.'
    };
  }
};

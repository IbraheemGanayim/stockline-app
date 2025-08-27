/**
 * Watchlist service using Firestore
 * Handles user's stock watchlist and favorites
 * @author Ibraheem Ganayim
 */

import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Add a stock to user's watchlist
 * @param {Object} stockData - Stock details
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created watchlist item with ID or error
 */
export const addToWatchlist = async (stockData, userId) => {
  try {
    // Check if stock is already in watchlist
    const existing = await getWatchlistItem(userId, stockData.ticker);
    if (existing) {
      return {
        success: false,
        error: 'Stock is already in your watchlist.'
      };
    }

    const watchlistRef = collection(db, 'watchlist');
    const newWatchlistItem = {
      ...stockData,
      userId,
      addedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(watchlistRef, newWatchlistItem);
    
    return {
      success: true,
      watchlistItem: {
        id: docRef.id,
        ...newWatchlistItem
      }
    };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return {
      success: false,
      error: 'Failed to add stock to watchlist. Please try again.'
    };
  }
};

/**
 * Remove a stock from user's watchlist
 * @param {string} userId - User ID
 * @param {string} ticker - Stock ticker to remove
 * @returns {Promise<Object>} Success status or error
 */
export const removeFromWatchlist = async (userId, ticker) => {
  try {
    const watchlistItem = await getWatchlistItem(userId, ticker);
    if (!watchlistItem) {
      return {
        success: false,
        error: 'Stock not found in watchlist.'
      };
    }

    const watchlistRef = doc(db, 'watchlist', watchlistItem.id);
    await deleteDoc(watchlistRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return {
      success: false,
      error: 'Failed to remove stock from watchlist. Please try again.'
    };
  }
};

/**
 * Get a specific watchlist item
 * @param {string} userId - User ID
 * @param {string} ticker - Stock ticker
 * @returns {Promise<Object|null>} Watchlist item or null
 */
export const getWatchlistItem = async (userId, ticker) => {
  try {
    const watchlistRef = collection(db, 'watchlist');
    const q = query(
      watchlistRef,
      where('userId', '==', userId),
      where('ticker', '==', ticker)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting watchlist item:', error);
    return null;
  }
};

/**
 * Get user's complete watchlist
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of watchlist stocks
 */
export const getUserWatchlist = async (userId) => {
  if (!db) {
    console.warn('Firestore not initialized, returning mock watchlist data');
    return [
      { 
        id: 'mock-1', 
        ticker: 'ADBE', 
        companyName: 'Adobe, Inc', 
        price: 576.81, 
        change: 1.84, 
        changePercent: 0.32,
        addedAt: new Date()
      },
      { 
        id: 'mock-2', 
        ticker: 'FB', 
        companyName: 'Facebook, Inc', 
        price: 343.01, 
        change: 3.63, 
        changePercent: 1.07,
        addedAt: new Date()
      }
    ];
  }
  
  try {
    const watchlistRef = collection(db, 'watchlist');
    const q = query(
      watchlistRef,
      where('userId', '==', userId)
      // orderBy('addedAt', 'desc') // Temporarily removed while index builds
    );

    const querySnapshot = await getDocs(q);
    const watchlist = [];
    
    querySnapshot.forEach((doc) => {
      watchlist.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return watchlist;
  } catch (error) {
    console.error('Error getting user watchlist:', error);
    
    // Return mock data on error
    return [
      { 
        id: 'mock-1', 
        ticker: 'ADBE', 
        companyName: 'Adobe, Inc', 
        price: 576.81, 
        change: 1.84, 
        changePercent: 0.32,
        addedAt: new Date()
      },
      { 
        id: 'mock-2', 
        ticker: 'FB', 
        companyName: 'Facebook, Inc', 
        price: 343.01, 
        change: 3.63, 
        changePercent: 1.07,
        addedAt: new Date()
      }
    ];
  }
};

/**
 * Subscribe to real-time watchlist updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToWatchlist = (userId, callback) => {
  if (!db) {
    console.warn('Firestore not initialized, providing mock watchlist data via callback');
    const mockWatchlist = [
      { 
        ticker: 'ADBE', 
        companyName: 'Adobe, Inc', 
        price: 576.81, 
        change: 1.84, 
        changePercent: 0.32 
      },
      { 
        ticker: 'FB', 
        companyName: 'Facebook, Inc', 
        price: 343.01, 
        change: 3.63, 
        changePercent: 1.07 
      }
    ];
    setTimeout(() => callback(mockWatchlist), 100);
    return () => {};
  }
  
  try {
    const watchlistRef = collection(db, 'watchlist');
    const q = query(
      watchlistRef,
      where('userId', '==', userId)
      // orderBy('addedAt', 'desc') // Temporarily removed while index builds
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        const watchlist = [];
        querySnapshot.forEach((doc) => {
          watchlist.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(watchlist);
      },
      (error) => {
        console.error('Error in watchlist snapshot listener:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error subscribing to watchlist:', error);
    return () => {};
  }
};

/**
 * Check if a stock is in user's watchlist
 * @param {string} userId - User ID
 * @param {string} ticker - Stock ticker
 * @returns {Promise<boolean>} True if stock is in watchlist
 */
export const isInWatchlist = async (userId, ticker) => {
  try {
    const item = await getWatchlistItem(userId, ticker);
    return item !== null;
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
};

/**
 * Get trending stocks (mock data for now)
 * In a real app, this would come from a stock market API
 * @returns {Promise<Array>} Array of trending stocks
 */
export const getTrendingStocks = async () => {
  // Mock trending stocks data
  return [
    { ticker: 'AMZN', companyName: 'Amazon, Inc', price: 3283.26, change: -1.61, changePercent: -0.05 },
    { ticker: 'NFLX', companyName: 'Netflix, Inc', price: 88.91, change: 1.13, changePercent: 1.29 },
    { ticker: 'TSLA', companyName: 'Tesla, Inc', price: 245.60, change: -8.30, changePercent: -3.27 },
    { ticker: 'MSFT', companyName: 'Microsoft Corp', price: 330.45, change: 5.75, changePercent: 1.77 }
  ];
};

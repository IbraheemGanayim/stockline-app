/**
 * Watchlist hook for managing user's stock watchlist
 * @author Ibraheem Ganayim
 */

import { useState, useEffect } from 'react';
import { useAuthUser } from './useAuthUser';
import { 
  getUserWatchlist, 
  addToWatchlist, 
  removeFromWatchlist,
  subscribeToWatchlist,
  isInWatchlist
} from '../services/watchlist';

/**
 * Hook for managing watchlist data with real-time updates
 * @returns {Object} Watchlist data and methods
 */
export const useWatchlist = () => {
  const { user } = useAuthUser();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial watchlist data
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadWatchlistData = async () => {
      try {
        setLoading(true);
        setError(null);

        const watchlistData = await getUserWatchlist(user.uid);
        setWatchlist(watchlistData);
      } catch (err) {
        console.error('Error loading watchlist data:', err);
        setError('Failed to load watchlist data');
      } finally {
        setLoading(false);
      }
    };

    loadWatchlistData();
  }, [user?.uid]);

  // Subscribe to real-time watchlist updates
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToWatchlist(user.uid, (watchlistData) => {
      setWatchlist(watchlistData);
    });

    return unsubscribe;
  }, [user?.uid]);

  // Add stock to watchlist
  const addStock = async (stockData) => {
    if (!user?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await addToWatchlist(stockData, user.uid);
      return result;
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      return { 
        success: false, 
        error: 'Failed to add stock to watchlist. Please try again.' 
      };
    }
  };

  // Remove stock from watchlist
  const removeStock = async (ticker) => {
    if (!user?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await removeFromWatchlist(user.uid, ticker);
      return result;
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      return { 
        success: false, 
        error: 'Failed to remove stock from watchlist. Please try again.' 
      };
    }
  };

  // Check if stock is in watchlist
  const checkInWatchlist = async (ticker) => {
    if (!user?.uid) return false;
    
    try {
      return await isInWatchlist(user.uid, ticker);
    } catch (err) {
      console.error('Error checking watchlist:', err);
      return false;
    }
  };

  return {
    watchlist,
    loading,
    error,
    addStock,
    removeStock,
    checkInWatchlist,
    refresh: async () => {
      if (!user?.uid) return;
      
      try {
        setError(null);
        const watchlistData = await getUserWatchlist(user.uid);
        setWatchlist(watchlistData);
      } catch (err) {
        console.error('Error refreshing watchlist:', err);
        setError('Failed to refresh watchlist');
      }
    }
  };
};

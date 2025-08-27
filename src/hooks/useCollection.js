/**
 * Custom hook for Firestore collection operations
 * Provides real-time data fetching and CRUD operations for collections
 * @author Ibraheem Ganayim
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getAllItems, 
  getUserItems, 
  subscribeToAllItems, 
  subscribeToUserItems,
  createItem 
} from '../services/db';
import { useAuthUser } from './useAuthUser';

/**
 * Custom hook for managing Firestore collections with real-time updates
 * @param {string} collectionType - Type of collection ('all' or 'user')
 * @param {Object} options - Configuration options
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @param {number} options.limit - Maximum number of items to fetch (default: 50)
 * @param {boolean} options.autoFetch - Auto-fetch data on mount (default: true)
 * @returns {Object} Collection data and methods
 */
export const useCollection = (collectionType = 'all', options = {}) => {
  const {
    realtime = true,
    limit = 50,
    autoFetch = true
  } = options;

  const { userId, isAuthenticated } = useAuthUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch collection data (one-time fetch)
   */
  const fetchData = useCallback(async () => {
    if (collectionType === 'user' && !userId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let items = [];
      
      if (collectionType === 'user' && userId) {
        items = await getUserItems(userId, limit);
      } else if (collectionType === 'all') {
        items = await getAllItems(limit);
      }

      setData(items);
    } catch (err) {
      console.error('Error fetching collection data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [collectionType, userId, limit]);

  /**
   * Refresh collection data (for pull-to-refresh)
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      let items = [];
      
      if (collectionType === 'user' && userId) {
        items = await getUserItems(userId, limit);
      } else if (collectionType === 'all') {
        items = await getAllItems(limit);
      }

      setData(items);
    } catch (err) {
      console.error('Error refreshing collection data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [collectionType, userId, limit]);

  /**
   * Add new item to collection
   * @param {Object} itemData - Data for the new item
   * @returns {Promise<Object>} Result of create operation
   */
  const addItem = useCallback(async (itemData) => {
    if (!userId || !isAuthenticated) {
      return {
        success: false,
        error: 'You must be logged in to create items.'
      };
    }

    try {
      const result = await createItem(itemData, userId);
      
      if (result.success && !realtime) {
        // If not using realtime updates, manually update local state
        setData(prevData => [result.item, ...prevData]);
      }
      
      return result;
    } catch (error) {
      console.error('Error adding item:', error);
      return {
        success: false,
        error: 'Failed to create item. Please try again.'
      };
    }
  }, [userId, isAuthenticated, realtime]);

  /**
   * Set up real-time subscription
   */
  useEffect(() => {
    if (!realtime) return;

    let unsubscribe;

    const setupSubscription = () => {
      if (collectionType === 'user' && userId) {
        unsubscribe = subscribeToUserItems(userId, (items) => {
          setData(items);
          setLoading(false);
        }, limit);
      } else if (collectionType === 'all') {
        unsubscribe = subscribeToAllItems((items) => {
          setData(items);
          setLoading(false);
        }, limit);
      }
    };

    if (collectionType === 'user' && !userId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionType, userId, realtime, limit]);

  /**
   * Auto-fetch data on mount (if realtime is disabled)
   */
  useEffect(() => {
    if (!realtime && autoFetch) {
      fetchData();
    }
  }, [realtime, autoFetch, fetchData]);

  /**
   * Reset data when user changes
   */
  useEffect(() => {
    if (collectionType === 'user' && !userId) {
      setData([]);
      setError(null);
    }
  }, [collectionType, userId]);

  return {
    data,
    loading,
    error,
    refreshing,
    fetchData,
    refresh,
    addItem,
    // Computed properties
    isEmpty: data.length === 0,
    count: data.length
  };
};

export default useCollection;

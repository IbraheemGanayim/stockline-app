/**
 * Custom hook for Firestore document operations
 * Provides real-time document fetching and CRUD operations
 * @author Ibraheem Ganayim
 */

import { useState, useEffect, useCallback } from 'react';
import { getItem, updateItem, deleteItem } from '../services/db';
import { useAuthUser } from './useAuthUser';

/**
 * Custom hook for managing individual Firestore documents
 * @param {string} docId - Document ID to fetch
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Auto-fetch document on mount (default: true)
 * @returns {Object} Document data and methods
 */
export const useDoc = (docId, options = {}) => {
  const { autoFetch = true } = options;
  const { userId, isAuthenticated } = useAuthUser();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /**
   * Fetch document data
   */
  const fetchDoc = useCallback(async () => {
    if (!docId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const doc = await getItem(docId);
      setData(doc);
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load document. Please try again.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [docId]);

  /**
   * Update document
   * @param {Object} updates - Updates to apply to the document
   * @returns {Promise<Object>} Result of update operation
   */
  const updateDoc = useCallback(async (updates) => {
    if (!docId || !userId || !isAuthenticated) {
      return {
        success: false,
        error: 'You must be logged in to update this item.'
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Document not loaded. Please try again.'
      };
    }

    // Check ownership
    if (data.userId !== userId) {
      return {
        success: false,
        error: 'You can only update your own items.'
      };
    }

    setUpdating(true);
    setError(null);

    try {
      const result = await updateItem(docId, updates, userId);
      
      if (result.success) {
        // Update local state with the changes
        setData(prevData => ({
          ...prevData,
          ...updates,
          updatedAt: new Date().toISOString()
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Error updating document:', error);
      const errorResult = {
        success: false,
        error: 'Failed to update item. Please try again.'
      };
      setError(errorResult.error);
      return errorResult;
    } finally {
      setUpdating(false);
    }
  }, [docId, userId, isAuthenticated, data]);

  /**
   * Delete document
   * @returns {Promise<Object>} Result of delete operation
   */
  const deleteDoc = useCallback(async () => {
    if (!docId || !userId || !isAuthenticated) {
      return {
        success: false,
        error: 'You must be logged in to delete this item.'
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Document not loaded. Please try again.'
      };
    }

    // Check ownership
    if (data.userId !== userId) {
      return {
        success: false,
        error: 'You can only delete your own items.'
      };
    }

    setDeleting(true);
    setError(null);

    try {
      const result = await deleteItem(docId, userId);
      
      if (result.success) {
        // Clear local state since document is deleted
        setData(null);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting document:', error);
      const errorResult = {
        success: false,
        error: 'Failed to delete item. Please try again.'
      };
      setError(errorResult.error);
      return errorResult;
    } finally {
      setDeleting(false);
    }
  }, [docId, userId, isAuthenticated, data]);

  /**
   * Refresh document data
   */
  const refresh = useCallback(async () => {
    await fetchDoc();
  }, [fetchDoc]);

  /**
   * Check if current user owns the document
   * @returns {boolean} True if user owns the document
   */
  const isOwner = useCallback(() => {
    return data && userId && data.userId === userId;
  }, [data, userId]);

  /**
   * Auto-fetch document on mount or when docId changes
   */
  useEffect(() => {
    if (autoFetch && docId) {
      fetchDoc();
    }
  }, [autoFetch, docId, fetchDoc]);

  /**
   * Clear data when docId is removed
   */
  useEffect(() => {
    if (!docId) {
      setData(null);
      setError(null);
    }
  }, [docId]);

  return {
    data,
    loading,
    error,
    updating,
    deleting,
    fetchDoc,
    updateDoc,
    deleteDoc,
    refresh,
    isOwner: isOwner(),
    // Computed properties
    exists: !!data,
    isEmpty: !data
  };
};

export default useDoc;

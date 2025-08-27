/**
 * Transactions hook for managing transaction data and operations
 * @author Ibraheem Ganayim
 */

import { useState, useEffect } from 'react';
import { useAuthUser } from './useAuthUser';
import { 
  getUserTransactions, 
  addTransaction, 
  subscribeToUserTransactions,
  getTransactionStats
} from '../services/transactions';

/**
 * Hook for managing transaction data with real-time updates
 * @returns {Object} Transaction data and methods
 */
export const useTransactions = () => {
  const { user } = useAuthUser();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalBuys: 0,
    totalSells: 0,
    totalBuyValue: 0,
    totalSellValue: 0,
    mostTradedStock: null,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial transaction data
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadTransactionData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [transactionsData, statsData] = await Promise.all([
          getUserTransactions(user.uid),
          getTransactionStats(user.uid)
        ]);

        setTransactions(transactionsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading transaction data:', err);
        setError('Failed to load transaction data');
      } finally {
        setLoading(false);
      }
    };

    loadTransactionData();
  }, [user?.uid]);

  // Subscribe to real-time transaction updates
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserTransactions(user.uid, (transactionsData) => {
      setTransactions(transactionsData);
      // Update stats when transactions change
      getTransactionStats(user.uid).then(setStats);
    });

    return unsubscribe;
  }, [user?.uid]);

  // Add new transaction
  const createTransaction = async (transactionData) => {
    if (!user?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await addTransaction(transactionData, user.uid);
      
      if (result.success) {
        // Refresh stats after adding transaction
        const newStats = await getTransactionStats(user.uid);
        setStats(newStats);
      }
      
      return result;
    } catch (err) {
      console.error('Error creating transaction:', err);
      return { 
        success: false, 
        error: 'Failed to create transaction. Please try again.' 
      };
    }
  };

  return {
    transactions,
    stats,
    loading,
    error,
    createTransaction,
    refresh: async () => {
      if (!user?.uid) return;
      
      try {
        setError(null);
        const [transactionsData, statsData] = await Promise.all([
          getUserTransactions(user.uid),
          getTransactionStats(user.uid)
        ]);
        setTransactions(transactionsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error refreshing transactions:', err);
        setError('Failed to refresh transactions');
      }
    }
  };
};

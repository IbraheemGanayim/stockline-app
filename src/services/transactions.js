/**
 * Transactions service using Firestore
 * Handles buy/sell transactions and transaction history
 * @author Ibraheem Ganayim
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { updatePortfolioFromTransaction } from './portfolio';

/**
 * Execute a trade transaction (unified function)
 * @param {string} userId - User ID
 * @param {Object} transactionData - Transaction details
 * @returns {Promise<Object>} Result with success status
 */
export const executeTransaction = async (userId, transactionData) => {
  try {
    // Add the transaction to user's history
    const result = await addTransaction(transactionData, userId);
    return result;
  } catch (error) {
    console.error('Error executing transaction:', error);
    return {
      success: false,
      error: 'Failed to execute transaction. Please try again.'
    };
  }
};

/**
 * Add a new transaction
 * @param {Object} transactionData - Transaction details
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created transaction with ID or error
 */
export const addTransaction = async (transactionData, userId) => {
  try {
    const userTransactionsRef = collection(db, 'transactions', userId, 'userTransactions');
    const newTransaction = {
      ...transactionData,
      date: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    // Add transaction to Firestore
    const docRef = await addDoc(userTransactionsRef, newTransaction);
    
    // Update portfolio based on transaction
    const portfolioResult = await updatePortfolioFromTransaction(userId, transactionData);
    
    if (!portfolioResult.success) {
      console.warn('Portfolio update failed but transaction was saved:', portfolioResult.error);
    }
    
    return {
      success: true,
      transaction: {
        id: docRef.id,
        ...newTransaction
      }
    };
  } catch (error) {
    console.error('Error adding transaction:', error);
    return {
      success: false,
      error: 'Failed to add transaction. Please try again.'
    };
  }
};

/**
 * Get user's transaction history
 * @param {string} userId - User ID
 * @param {number} limitCount - Maximum number of transactions to fetch
 * @returns {Promise<Array>} Array of transactions
 */
export const getUserTransactions = async (userId, limitCount = 50) => {
  if (!db) {
    console.warn('Firestore not initialized, returning mock transaction data');
    return [
      {
        id: 'mock-1',
        type: 'buy',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        shares: 10,
        price: 148.50,
        total: 1485.00,
        date: new Date('2024-01-15'),
      },
      {
        id: 'mock-2',
        type: 'sell',
        ticker: 'TSLA',
        companyName: 'Tesla Inc.',
        shares: 2,
        price: 250.00,
        total: 500.00,
        date: new Date('2024-01-12'),
      }
    ];
  }
  
  try {
    const userTransactionsRef = collection(db, 'transactions', userId, 'userTransactions');
    const q = query(
      userTransactionsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return transactions;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    
    // Return mock data on error
    return [
      {
        id: 'mock-1',
        type: 'buy',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        shares: 10,
        price: 148.50,
        total: 1485.00,
        date: new Date('2024-01-15'),
      },
      {
        id: 'mock-2',
        type: 'sell',
        ticker: 'TSLA',
        companyName: 'Tesla Inc.',
        shares: 2,
        price: 250.00,
        total: 500.00,
        date: new Date('2024-01-12'),
      }
    ];
  }
};

/**
 * Subscribe to real-time transaction updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle updates
 * @param {number} limitCount - Maximum number of transactions to fetch
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserTransactions = (userId, callback, limitCount = 50) => {
  if (!db) {
    console.warn('Firestore not initialized, providing mock transaction data via callback');
    const mockTransactions = [
      {
        id: 'mock-1',
        type: 'buy',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        shares: 10,
        price: 148.50,
        total: 1485.00,
        date: new Date('2024-01-15'),
      },
      {
        id: 'mock-2',
        type: 'sell',
        ticker: 'TSLA',
        companyName: 'Tesla Inc.',
        shares: 2,
        price: 250.00,
        total: 500.00,
        date: new Date('2024-01-12'),
      }
    ];
    setTimeout(() => callback(mockTransactions), 100);
    return () => {};
  }
  
  try {
    const userTransactionsRef = collection(db, 'transactions', userId, 'userTransactions');
    const q = query(
      userTransactionsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        const transactions = [];
        querySnapshot.forEach((doc) => {
          transactions.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(transactions);
      },
      (error) => {
        console.error('Error in transactions snapshot listener:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error subscribing to user transactions:', error);
    return () => {};
  }
};

/**
 * Get transactions for a specific stock
 * @param {string} userId - User ID
 * @param {string} ticker - Stock ticker
 * @returns {Promise<Array>} Array of transactions for the stock
 */
export const getStockTransactions = async (userId, ticker) => {
  try {
    const userTransactionsRef = collection(db, 'transactions', userId, 'userTransactions');
    const q = query(
      userTransactionsRef,
      where('ticker', '==', ticker),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return transactions;
  } catch (error) {
    console.error('Error getting stock transactions:', error);
    return [];
  }
};

/**
 * Calculate transaction statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Transaction statistics
 */
export const getTransactionStats = async (userId) => {
  try {
    const transactions = await getUserTransactions(userId, 1000); // Get more for accurate stats
    
    const stats = {
      totalTransactions: transactions.length,
      totalBuys: 0,
      totalSells: 0,
      totalBuyValue: 0,
      totalSellValue: 0,
      mostTradedStock: null,
      recentActivity: transactions.slice(0, 5)
    };

    // Count stocks
    const stockCounts = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'buy') {
        stats.totalBuys++;
        stats.totalBuyValue += transaction.total;
      } else if (transaction.type === 'sell') {
        stats.totalSells++;
        stats.totalSellValue += transaction.total;
      }
      
      // Count stock frequency
      stockCounts[transaction.ticker] = (stockCounts[transaction.ticker] || 0) + 1;
    });

    // Find most traded stock
    if (Object.keys(stockCounts).length > 0) {
      stats.mostTradedStock = Object.keys(stockCounts).reduce((a, b) => 
        stockCounts[a] > stockCounts[b] ? a : b
      );
    }

    return stats;
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    return {
      totalTransactions: 0,
      totalBuys: 0,
      totalSells: 0,
      totalBuyValue: 0,
      totalSellValue: 0,
      mostTradedStock: null,
      recentActivity: []
    };
  }
};

/**
 * Portfolio service using Firestore
 * Handles portfolio data, holdings, and performance tracking
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
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get user's portfolio summary
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Portfolio summary or default values
 */
export const getPortfolioSummary = async (userId) => {
  try {
    const portfolioRef = doc(db, 'portfolios', userId);
    const portfolioSnap = await getDoc(portfolioRef);
    
    if (portfolioSnap.exists()) {
      return portfolioSnap.data();
    } else {
      // Create default portfolio if it doesn't exist
      const defaultPortfolio = {
        totalValue: 0,
        totalInvestment: 0,
        dailyChange: 0,
        dailyChangePercent: 0,
        gainAmount: 0,
        lossAmount: 0,
        holdings: {},
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      await setDoc(portfolioRef, defaultPortfolio);
      return defaultPortfolio;
    }
  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    // Return default values on error
    return {
      totalValue: 0,
      totalInvestment: 0,
      dailyChange: 0,
      dailyChangePercent: 0,
      gainAmount: 0,
      lossAmount: 0,
      holdings: {},
      lastUpdated: new Date(),
      createdAt: new Date()
    };
  }
};

/**
 * Get user's stock holdings
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of stock holdings
 */
export const getStockHoldings = async (userId) => {
  try {
    const holdingsRef = collection(db, 'holdings');
    const q = query(
      holdingsRef,
      where('userId', '==', userId)
      // orderBy('createdAt', 'desc') // Temporarily removed while index builds
    );

    const querySnapshot = await getDocs(q);
    const holdings = [];
    
    querySnapshot.forEach((doc) => {
      holdings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return holdings;
  } catch (error) {
    console.error('Error getting stock holdings:', error);
    // Return mock holdings on error
    return [
      { 
        id: 'mock-1', 
        ticker: 'AAPL', 
        companyName: 'Apple Inc.', 
        shares: 10, 
        avgPrice: 148.50, 
        currentPrice: 150.20, 
        totalValue: 1502.00,
        gain: 17.00,
        gainPercent: 1.14
      },
      { 
        id: 'mock-2', 
        ticker: 'GOOGL', 
        companyName: 'Alphabet Inc.', 
        shares: 2, 
        avgPrice: 2745.20, 
        currentPrice: 2750.80, 
        totalValue: 5501.60,
        gain: 11.20,
        gainPercent: 0.20
      }
    ];
  }
};

/**
 * Update portfolio after a transaction
 * @param {string} userId - User ID
 * @param {Object} transactionData - Transaction details
 * @returns {Promise<Object>} Success status or error
 */
export const updatePortfolioFromTransaction = async (userId, transactionData) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const portfolioRef = doc(db, 'portfolios', userId);
      const holdingsRef = collection(db, 'holdings');
      
      // Get existing portfolio
      const portfolioSnap = await transaction.get(portfolioRef);
      let portfolio = portfolioSnap.exists() ? portfolioSnap.data() : {
        totalValue: 0,
        totalInvestment: 0,
        holdings: {}
      };

      // Find or create holding for this stock
      const holdingQuery = query(
        holdingsRef,
        where('userId', '==', userId),
        where('ticker', '==', transactionData.ticker)
      );
      
      const holdingSnap = await getDocs(holdingQuery);
      let holdingRef;
      let holding;

      if (!holdingSnap.empty) {
        // Update existing holding
        holdingRef = holdingSnap.docs[0].ref;
        holding = holdingSnap.docs[0].data();
      } else {
        // Create new holding
        holdingRef = doc(holdingsRef);
        holding = {
          userId,
          ticker: transactionData.ticker,
          companyName: transactionData.companyName,
          shares: 0,
          totalInvestment: 0,
          avgPrice: 0,
          createdAt: serverTimestamp()
        };
      }

      // Update holding based on transaction type
      if (transactionData.type === 'buy') {
        const newTotalShares = holding.shares + transactionData.shares;
        const newTotalInvestment = holding.totalInvestment + transactionData.total;
        const newAvgPrice = newTotalInvestment / newTotalShares;

        holding.shares = newTotalShares;
        holding.totalInvestment = newTotalInvestment;
        holding.avgPrice = newAvgPrice;
        
        portfolio.totalInvestment += transactionData.total;
      } else if (transactionData.type === 'sell') {
        holding.shares -= transactionData.shares;
        const soldInvestment = (transactionData.shares * holding.avgPrice);
        holding.totalInvestment -= soldInvestment;
        
        portfolio.totalInvestment -= soldInvestment;
        
        // If all shares sold, delete the holding
        if (holding.shares <= 0) {
          transaction.delete(holdingRef);
        }
      }

      // Update holding if not deleted
      if (holding.shares > 0) {
        holding.updatedAt = serverTimestamp();
        transaction.set(holdingRef, holding, { merge: true });
      }

      // Update portfolio
      portfolio.lastUpdated = serverTimestamp();
      transaction.set(portfolioRef, portfolio, { merge: true });

      return { success: true };
    });
  } catch (error) {
    console.error('Error updating portfolio from transaction:', error);
    return {
      success: false,
      error: 'Failed to update portfolio. Please try again.'
    };
  }
};

/**
 * Subscribe to real-time portfolio updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToPortfolio = (userId, callback) => {
  if (!db) {
    // Return mock data if Firebase not available
    setTimeout(() => callback({
      totalValue: 13240.11,
      totalInvestment: 12006.00,
      dailyChange: 1.74,
      gainAmount: 234.11,
      lossAmount: 34.11
    }), 100);
    return () => {};
  }

  try {
    const portfolioRef = doc(db, 'portfolios', userId);
    
    return onSnapshot(portfolioRef, 
      (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        } else {
          // Return default portfolio data
          callback({
            totalValue: 0,
            totalInvestment: 0,
            dailyChange: 0,
            gainAmount: 0,
            lossAmount: 0
          });
        }
      },
      (error) => {
        console.error('Error in portfolio snapshot listener:', error);
        callback({
          totalValue: 0,
          totalInvestment: 0,
          dailyChange: 0,
          gainAmount: 0,
          lossAmount: 0
        });
      }
    );
  } catch (error) {
    console.error('Error subscribing to portfolio:', error);
    return () => {};
  }
};

/**
 * Subscribe to real-time holdings updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToHoldings = (userId, callback) => {
  if (!db) {
    // Return mock data if Firebase not available
    setTimeout(() => callback([
      { ticker: 'AAPL', companyName: 'Apple Inc.', shares: 10, avgPrice: 148.50, currentPrice: 150.20 },
      { ticker: 'GOOGL', companyName: 'Alphabet Inc.', shares: 2, avgPrice: 2745.20, currentPrice: 2750.80 }
    ]), 100);
    return () => {};
  }

  try {
    const holdingsRef = collection(db, 'holdings');
    const q = query(
      holdingsRef,
      where('userId', '==', userId)
      // orderBy('createdAt', 'desc') // Temporarily removed while index builds
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        const holdings = [];
        querySnapshot.forEach((doc) => {
          holdings.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(holdings);
      },
      (error) => {
        console.error('Error in holdings snapshot listener:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error subscribing to holdings:', error);
    return () => {};
  }
};

/**
 * Portfolio hook for managing portfolio data and real-time updates
 * @author Ibraheem Ganayim
 */

import { useState, useEffect } from 'react';
import { useAuthUser } from './useAuthUser';
import { 
  getPortfolioSummary, 
  getStockHoldings, 
  subscribeToPortfolio, 
  subscribeToHoldings 
} from '../services/portfolio';

/**
 * Hook for managing portfolio data with real-time updates
 * @returns {Object} Portfolio data and methods
 */
export const usePortfolio = () => {
  const { user } = useAuthUser();
  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    totalInvestment: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    gainAmount: 0,
    lossAmount: 0
  });
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial portfolio data
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadPortfolioData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [portfolioData, holdingsData] = await Promise.all([
          getPortfolioSummary(user.uid),
          getStockHoldings(user.uid)
        ]);

        setPortfolio(portfolioData);
        setHoldings(holdingsData);
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, [user?.uid]);

  // Subscribe to real-time portfolio updates
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribePortfolio = subscribeToPortfolio(user.uid, (portfolioData) => {
      setPortfolio(portfolioData);
    });

    const unsubscribeHoldings = subscribeToHoldings(user.uid, (holdingsData) => {
      setHoldings(holdingsData);
    });

    return () => {
      unsubscribePortfolio();
      unsubscribeHoldings();
    };
  }, [user?.uid]);

  return {
    portfolio,
    holdings,
    loading,
    error,
    refresh: async () => {
      if (!user?.uid) return;
      
      try {
        setError(null);
        const [portfolioData, holdingsData] = await Promise.all([
          getPortfolioSummary(user.uid),
          getStockHoldings(user.uid)
        ]);
        setPortfolio(portfolioData);
        setHoldings(holdingsData);
      } catch (err) {
        console.error('Error refreshing portfolio:', err);
        setError('Failed to refresh portfolio');
      }
    }
  };
};

/**
 * Modern Portfolio hook with real-time updates and caching
 * @author Ibraheem Ganayim
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    totalValue: 13240.11,
    totalInvestment: 12500.00,
    dailyChange: 1.74,
    dailyChangePercent: 1.74,
    gainAmount: 234.11,
    lossAmount: 34.11
  });
  const [holdings, setHoldings] = useState([
    {
      id: 'nflx-1',
      ticker: 'NFLX',
      companyName: 'Netflix, Inc',
      currentPrice: 88.91,
      gain: 1.13,
      gainPercent: 1.29,
      shares: 10
    },
    {
      id: 'aapl-1',
      ticker: 'AAPL',
      companyName: 'Apple, Inc',
      currentPrice: 142.65,
      gain: 1.14,
      gainPercent: 0.81,
      shares: 25
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Cache management
  const CACHE_KEY = 'portfolio_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Load cached data
  const loadCachedData = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isValid = Date.now() - timestamp < CACHE_DURATION;
        
        if (isValid) {
          setPortfolio(data.portfolio);
          setHoldings(data.holdings);
          setLastUpdated(new Date(timestamp));
          return true;
        }
      }
    } catch (error) {
      console.warn('Cache load error:', error);
    }
    return false;
  }, []);

  // Save data to cache
  const cacheData = useCallback(async (portfolioData, holdingsData) => {
    try {
      const cacheObject = {
        data: {
          portfolio: portfolioData,
          holdings: holdingsData
        },
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Cache save error:', error);
    }
  }, []);

  // Real-time portfolio value simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio(prev => ({
        ...prev,
        totalValue: prev.totalValue + (Math.random() - 0.5) * 50,
        dailyChangePercent: prev.dailyChangePercent + (Math.random() - 0.5) * 0.1,
      }));
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh functionality
  const refreshPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate new realistic data
      const newPortfolio = {
        totalValue: 13240.11 + (Math.random() - 0.5) * 2000,
        totalInvestment: 12500.00,
        dailyChange: 1.74 + (Math.random() - 0.5) * 2,
        dailyChangePercent: 1.74 + (Math.random() - 0.5) * 2,
        gainAmount: 234.11 + (Math.random() - 0.5) * 100,
        lossAmount: 34.11 + (Math.random() - 0.5) * 20
      };

      const newHoldings = holdings.map(holding => ({
        ...holding,
        currentPrice: holding.currentPrice + (Math.random() - 0.5) * 5,
        gain: holding.gain + (Math.random() - 0.5) * 2,
        gainPercent: holding.gainPercent + (Math.random() - 0.5) * 1,
      }));

      setPortfolio(newPortfolio);
      setHoldings(newHoldings);
      setLastUpdated(new Date());
      
      // Cache the new data
      await cacheData(newPortfolio, newHoldings);
      
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh portfolio data');
    } finally {
      setLoading(false);
    }
  }, [holdings, cacheData]);

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
    refreshPortfolio,
    lastUpdated,
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

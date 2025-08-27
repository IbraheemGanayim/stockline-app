/**
 * Home Screen - Main Stockline dashboard
 * Shows portfolio summary, trending stocks, and watchlist
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, PortfolioCard, StockCard, SectionHeader } from '../components';
import { usePortfolio, useWatchlist } from '../hooks';
import { getTrendingStocks } from '../services/watchlist';
import { theme } from '../theme';

/**
 * HomeScreen component displaying Stockline dashboard
 * @param {Object} navigation - React Navigation object
 */
const HomeScreen = ({ navigation }) => {
  // Use Firebase hooks for real-time data
  const { portfolio, loading: portfolioLoading } = usePortfolio();
  const { watchlist, addStock: addToWatchlist, removeStock: removeFromWatchlist } = useWatchlist();
  const [trendingStocks, setTrendingStocks] = useState([]);

  // Load trending stocks on component mount
  useEffect(() => {
    const loadTrendingStocks = async () => {
      try {
        const trending = await getTrendingStocks();
        setTrendingStocks(trending.slice(0, 2)); // Show only first 2
      } catch (error) {
        console.error('Error loading trending stocks:', error);
      }
    };

    loadTrendingStocks();
  }, []);

  /**
   * Navigate to stock details
   * @param {Object} stock - Stock to view
   */
  const handleStockPress = (stock) => {
    navigation.navigate('StockDetails', { stock });
  };

  /**
   * Navigate to portfolio screen
   */
  const handleViewPortfolio = () => {
    navigation.navigate('Portfolio');
  };

  /**
   * Navigate to all trending stocks
   */
  const handleViewAllTrending = () => {
    navigation.navigate('TrendingStocks');
  };

  /**
   * Add stock to watchlist
   */
  const handleAddToWatchlist = async () => {
    // For demo purposes, add a popular stock
    const newStock = {
      ticker: 'AAPL',
      companyName: 'Apple Inc.',
      price: 150.20,
      change: 2.50,
      changePercent: 1.69
    };

    try {
      const result = await addToWatchlist(newStock);
      if (result.success) {
        Alert.alert('Success', 'Stock added to watchlist');
      } else {
        Alert.alert('Error', result.error || 'Failed to add stock to watchlist');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      Alert.alert('Error', 'Failed to add stock to watchlist');
    }
  };

  /**
   * Remove stock from watchlist
   */
  const handleRemoveFromWatchlist = async (ticker) => {
    try {
      const result = await removeFromWatchlist(ticker);
      if (result.success) {
        Alert.alert('Success', 'Stock removed from watchlist');
      } else {
        Alert.alert('Error', result.error || 'Failed to remove stock from watchlist');
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      Alert.alert('Error', 'Failed to remove stock from watchlist');
    }
  };

  return (
    <Screen padding={false} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Portfolio Value Card */}
        <PortfolioCard 
          totalValue={portfolio.totalValue}
          dailyChange={portfolio.dailyChangePercent}
          gainAmount={portfolio.gainAmount}
          lossAmount={portfolio.lossAmount}
        />
        
        {/* Trending Stocks Section */}
        <SectionHeader 
          title="Trending" 
          showIndicator={true}
          style={styles.sectionHeader}
        />
        
        <View style={styles.trendingContainer}>
          {trendingStocks.map((stock, index) => (
            <StockCard
              key={index}
              ticker={stock.ticker}
              companyName={stock.companyName}
              price={stock.price}
              change={stock.change}
              changePercent={stock.changePercent}
              onPress={() => handleStockPress(stock)}
              showChart={true}
            />
          ))}
        </View>
        
        {/* Watchlist Section */}
        <View style={styles.wishlistHeader}>
          <SectionHeader 
            title="Watchlist" 
            showIndicator={true}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddToWatchlist}>
            <Ionicons name="add" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.wishlistContainer}>
          {watchlist.map((stock, index) => (
            <TouchableOpacity 
              key={stock.id || index}
              onLongPress={() => handleRemoveFromWatchlist(stock.ticker)}
            >
              <StockCard
                ticker={stock.ticker}
                companyName={stock.companyName}
                price={stock.price}
                change={stock.change}
                changePercent={stock.changePercent}
                onPress={() => handleStockPress(stock)}
                showChart={true}
              />
            </TouchableOpacity>
          ))}
          
          {watchlist.length === 0 && (
            <View style={styles.emptyWatchlist}>
              <Text style={styles.emptyText}>No stocks in your watchlist yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add stocks</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
  },
  sectionHeader: {
    marginTop: 8,
  },
  trendingContainer: {
    marginBottom: 20,
  },
  wishlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wishlistContainer: {
    paddingBottom: 20,
  },
  emptyWatchlist: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});

export default HomeScreen;

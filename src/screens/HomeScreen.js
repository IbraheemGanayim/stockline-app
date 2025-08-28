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
  Alert,
  Image,
  Platform
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, PortfolioCard, StockCard, SectionHeader, StockSearchModal } from '../components';
import { usePortfolio, useWatchlist } from '../hooks';
import { useTheme } from '../contexts/ThemeProvider';
import { getTrendingStocks } from '../services/watchlist';
import { theme } from '../theme';
import { lightColors, darkColors } from '../theme/colors';

/**
 * Company icons mapping with multiple fallback options
 */
const COMPANY_ICONS = {
  AAPL: {
    type: 'image',
    source: 'https://logo.clearbit.com/apple.com',
    fallback: { type: 'icon', name: 'apple', library: 'FontAwesome5' },
    color: '#000000',
    backgroundColor: '#F5F5F7'
  },
  MSFT: {
    type: 'image',
    source: 'https://logo.clearbit.com/microsoft.com',
    fallback: { type: 'icon', name: 'microsoft', library: 'FontAwesome5' },
    color: '#00A1F1',
    backgroundColor: '#F3F2F1'
  },
  GOOGL: {
    type: 'image',
    source: 'https://logo.clearbit.com/google.com',
    fallback: { type: 'icon', name: 'google', library: 'FontAwesome5' },
    color: '#4285F4',
    backgroundColor: '#F8F9FA'
  },
  AMZN: {
    type: 'image',
    source: 'https://logo.clearbit.com/amazon.com',
    fallback: { type: 'icon', name: 'amazon', library: 'FontAwesome5' },
    color: '#FF9900',
    backgroundColor: '#232F3E'
  },
  TSLA: {
    type: 'image',
    source: 'https://logo.clearbit.com/tesla.com',
    fallback: { type: 'text', text: 'T', font: 'bold' },
    color: '#CC0000',
    backgroundColor: '#FFFFFF'
  },
  NVDA: {
    type: 'image',
    source: 'https://logo.clearbit.com/nvidia.com',
    fallback: { type: 'text', text: 'N', font: 'bold' },
    color: '#76B900',
    backgroundColor: '#000000'
  },
  NFLX: {
    type: 'image',
    source: 'https://logo.clearbit.com/netflix.com',
    fallback: { type: 'text', text: 'N', font: 'bold' },
    color: '#E50914',
    backgroundColor: '#000000'
  },
  META: {
    type: 'image',
    source: 'https://logo.clearbit.com/meta.com',
    fallback: { type: 'icon', name: 'facebook', library: 'FontAwesome5' },
    color: '#1877F2',
    backgroundColor: '#F0F2F5'
  },
  DIS: {
    type: 'image',
    source: 'https://logo.clearbit.com/disney.com',
    fallback: { type: 'text', text: 'D', font: 'bold' },
    color: '#003087',
    backgroundColor: '#F0F0F0'
  },
  BABA: {
    type: 'image',
    source: 'https://logo.clearbit.com/alibaba.com',
    fallback: { type: 'text', text: 'A', font: 'bold' },
    color: '#FF6A00',
    backgroundColor: '#FFFFFF'
  }
};

/**
 * HomeScreen component displaying Stockline dashboard
 * @param {Object} navigation - React Navigation object
 */
const HomeScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  // Use Firebase hooks for real-time data
  const { portfolio, loading: portfolioLoading } = usePortfolio();
  const { watchlist, addStock: addToWatchlist, removeStock: removeFromWatchlist } = useWatchlist();
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [showStockSearchModal, setShowStockSearchModal] = useState(false);

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
   * Add stock to watchlist - opens stock search modal
   */
  const handleAddToWatchlist = () => {
    setShowStockSearchModal(true);
  };

  /**
   * Handle stock selection from search modal
   * @param {Object} stock - Selected stock to add to watchlist
   */
  const handleStockSelect = async (stock) => {
    try {
      const result = await addToWatchlist(stock);
      if (result.success) {
        Alert.alert('Success', `${stock.ticker} added to your watchlist!`);
      } else {
        Alert.alert('Error', result.error || 'Failed to add stock to watchlist');
      }
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
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

  // Company Icon component with fallback support
  const CompanyIcon = ({ ticker, size = 40 }) => {
    const [imageError, setImageError] = useState(false);
    const iconConfig = COMPANY_ICONS[ticker];
    
    if (!iconConfig || imageError) {
      // Fallback to default icon
      const fallback = iconConfig?.fallback || { type: 'text', text: ticker[0] };
      
      return (
        <View style={[
          styles.companyIcon,
          { 
            width: size, 
            height: size,
            backgroundColor: iconConfig?.backgroundColor || theme.colors.primary.light 
          }
        ]}>
          {fallback.type === 'icon' ? (
            fallback.library === 'FontAwesome5' ? (
              <FontAwesome5 
                name={fallback.name} 
                size={size * 0.5} 
                color={iconConfig?.color || theme.colors.primary.main} 
              />
            ) : (
              <MaterialCommunityIcons 
                name={fallback.name} 
                size={size * 0.5} 
                color={iconConfig?.color || theme.colors.primary.main} 
              />
            )
          ) : (
            <Text style={[
              styles.companyIconText,
              { 
                fontSize: size * 0.4,
                color: iconConfig?.color || theme.colors.primary.main,
                fontWeight: fallback.font === 'bold' ? '700' : '600'
              }
            ]}>
              {fallback.text || ticker[0]}
            </Text>
          )}
        </View>
      );
    }

    // Try to load company logo image
    return (
      <View style={[
        styles.companyIcon,
        { 
          width: size, 
          height: size,
          backgroundColor: iconConfig.backgroundColor 
        }
      ]}>
        <Image
          source={{ uri: iconConfig.source }}
          style={[styles.companyIconImage, { width: size * 0.7, height: size * 0.7 }]}
          onError={() => setImageError(true)}
          resizeMode="contain"
        />
      </View>
    );
  };

  return (
    <Screen 
      padding={false} 
      scrollable={true} 
      backgroundColor={colors.background}
      statusBarStyle={isDark ? 'light-content' : 'dark-content'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Portfolio Summary Card */}
        <View style={[styles.portfolioSummaryContainer, { backgroundColor: colors.cardBackground }]}>
          <PortfolioCard 
            totalValue={portfolio.totalValue}
            dailyChange={portfolio.dailyChangePercent}
            gainAmount={portfolio.gainAmount}
            lossAmount={portfolio.lossAmount}
            onPress={handleViewPortfolio}
          />
          
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Transactions')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.buttonPrimary + '20' }]}>
                <Ionicons name="swap-horizontal" size={24} color={colors.buttonPrimary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Trade</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Market')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.buttonPrimary + '20' }]}>
                <Ionicons name="trending-up" size={24} color={colors.buttonPrimary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Market</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Portfolio')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.buttonPrimary + '20' }]}>
                <Ionicons name="pie-chart" size={24} color={colors.buttonPrimary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Portfolio</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Trending Stocks Section */}
        <SectionHeader 
          title="Trending" 
          showIndicator={true}
          style={styles.sectionHeader}
        />
        
        <View style={styles.trendingContainer}>
          {trendingStocks.map((stock, index) => {
            const iconConfig = COMPANY_ICONS[stock.ticker];
            return (
              <StockCard
                key={index}
                ticker={stock.ticker}
                companyName={stock.companyName}
                price={stock.price}
                change={stock.change}
                changePercent={stock.changePercent}
                onPress={() => handleStockPress(stock)}
                showChart={true}
                customIcon={<CompanyIcon ticker={stock.ticker} size={32} />}
                iconBackgroundColor={iconConfig?.backgroundColor}
              />
            );
          })}
        </View>
        
        {/* Watchlist Section */}
        <View style={styles.wishlistHeader}>
          <SectionHeader 
            title="Watchlist" 
            showIndicator={true}
          />
          <TouchableOpacity 
            style={[
              styles.addButton, 
              { 
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.3 : 0.1,
              }
            ]} 
            onPress={handleAddToWatchlist}
          >
            <Ionicons name="add" size={24} color={colors.buttonPrimary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.wishlistContainer}>
          {watchlist.map((stock, index) => {
            const iconConfig = COMPANY_ICONS[stock.ticker];
            return (
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
                  customIcon={<CompanyIcon ticker={stock.ticker} size={32} />}
                  iconBackgroundColor={iconConfig?.backgroundColor}
                />
              </TouchableOpacity>
            );
          })}
          
          {watchlist.length === 0 && (
            <View style={[
              styles.emptyWatchlist, 
              { 
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.2 : 0.05,
              }
            ]}>
              <Ionicons name="trending-up-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No stocks in your watchlist yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tap the + button to add stocks</Text>
            </View>
          )}
        </View>
      
      {/* Stock Search Modal */}
      <StockSearchModal
        visible={showStockSearchModal}
        onClose={() => setShowStockSearchModal(false)}
        onSelectStock={handleStockSelect}
        existingWatchlist={watchlist}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor is now dynamic from theme
  },
  portfolioSummaryContainer: {
    // backgroundColor is now dynamic from theme
    paddingBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
    // backgroundColor is now dynamic from theme
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600'
    // color is now dynamic from theme
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
    // backgroundColor is now dynamic from theme
  },
  wishlistContainer: {
    paddingBottom: 20,
  },
  emptyWatchlist: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
    // backgroundColor is now dynamic from theme
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
    // color is now dynamic from theme
  },
  emptySubtext: {
    fontSize: 14
    // color is now dynamic from theme
  },
  companyIcon: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  companyIconImage: {
    borderRadius: 6,
  },
  companyIconText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;

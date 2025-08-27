/**
 * Market Screen - Stock exploration and discovery
 * Features: Stock list, search, filtering, and watchlist management
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Image
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen, SectionHeader } from '../components';
import { useWatchlist } from '../hooks';
import { theme } from '../theme';

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
 * Enhanced stock data with real company information
 */
const MARKET_STOCKS = [
  {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    price: 175.84,
    change: 2.14,
    changePercent: 1.23,
    sector: 'Technology',
    marketCap: '2.75T',
    volume: '58.2M'
  },
  {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    price: 335.76,
    change: -1.45,
    changePercent: -0.43,
    sector: 'Technology',
    marketCap: '2.49T',
    volume: '32.8M'
  },
  {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    price: 127.48,
    change: 0.89,
    changePercent: 0.70,
    sector: 'Technology',
    marketCap: '1.61T',
    volume: '24.1M'
  },
  {
    ticker: 'AMZN',
    companyName: 'Amazon.com Inc.',
    price: 145.32,
    change: 3.21,
    changePercent: 2.26,
    sector: 'Consumer Discretionary',
    marketCap: '1.51T',
    volume: '41.7M'
  },
  {
    ticker: 'TSLA',
    companyName: 'Tesla Inc.',
    price: 248.50,
    change: -5.67,
    changePercent: -2.23,
    sector: 'Consumer Discretionary',
    marketCap: '789B',
    volume: '95.2M'
  },
  {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    price: 875.28,
    change: 12.45,
    changePercent: 1.44,
    sector: 'Technology',
    marketCap: '2.16T',
    volume: '28.9M'
  },
  {
    ticker: 'NFLX',
    companyName: 'Netflix Inc.',
    price: 445.23,
    change: -2.87,
    changePercent: -0.64,
    sector: 'Communication Services',
    marketCap: '198B',
    volume: '12.4M'
  },
  {
    ticker: 'META',
    companyName: 'Meta Platforms Inc.',
    price: 312.67,
    change: 4.89,
    changePercent: 1.59,
    sector: 'Communication Services',
    marketCap: '792B',
    volume: '19.8M'
  },
  {
    ticker: 'DIS',
    companyName: 'The Walt Disney Company',
    price: 96.78,
    change: 1.23,
    changePercent: 1.29,
    sector: 'Communication Services',
    marketCap: '177B',
    volume: '8.9M'
  },
  {
    ticker: 'BABA',
    companyName: 'Alibaba Group Holding Limited',
    price: 78.45,
    change: -1.67,
    changePercent: -2.09,
    sector: 'Consumer Discretionary',
    marketCap: '189B',
    volume: '15.2M'
  }
];

const SECTORS = ['All', 'Technology', 'Consumer Discretionary', 'Communication Services'];

/**
 * MarketScreen component for stock exploration
 */
const MarketScreen = ({ navigation }) => {
  console.log('MarketScreen rendering...');
  
  const { watchlist = [], addStock, removeStock } = useWatchlist();
  const [stocks, setStocks] = useState(MARKET_STOCKS);
  const [filteredStocks, setFilteredStocks] = useState(MARKET_STOCKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  console.log('State initialized, watchlist length:', watchlist?.length);

  // Filter and sort stocks
  useEffect(() => {
    let filtered = stocks;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(stock =>
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sector filter
    if (selectedSector !== 'All') {
      filtered = filtered.filter(stock => stock.sector === selectedSector);
    }

    setFilteredStocks(filtered);
  }, [stocks, searchQuery, selectedSector]);

  // Handle stock selection
  const handleStockPress = useCallback(async (stock) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptic feedback not available
    }
    
    navigation.navigate('StockDetails', { stock });
  }, [navigation]);

  // Handle watchlist toggle
  const handleWatchlistToggle = useCallback(async (stock) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptic feedback not available
    }

    const isInWatchlist = watchlist.some(item => item.ticker === stock.ticker);
    
    if (isInWatchlist) {
      const result = await removeStock(stock.ticker);
      if (result.success) {
        Alert.alert('Removed', `${stock.ticker} removed from watchlist`);
      }
    } else {
      const result = await addStock(stock);
      if (result.success) {
        Alert.alert('Added', `${stock.ticker} added to watchlist`);
      }
    }
  }, [watchlist, addStock, removeStock]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptic feedback not available
    }

    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Company Icon component with fallback support
  const CompanyIcon = ({ ticker, size = 48 }) => {
    const [imageError, setImageError] = useState(false);
    const iconConfig = COMPANY_ICONS[ticker];
    
    if (!iconConfig || imageError) {
      // Fallback to default icon
      const fallback = iconConfig?.fallback || { type: 'text', text: ticker[0] };
      
      return (
        <View style={[
          styles.stockLogo,
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
              styles.stockLogoText,
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
        styles.stockLogo,
        { 
          width: size, 
          height: size,
          backgroundColor: iconConfig.backgroundColor 
        }
      ]}>
        <Image
          source={{ uri: iconConfig.source }}
          style={[styles.stockLogoImage, { width: size * 0.7, height: size * 0.7 }]}
          onError={() => setImageError(true)}
          resizeMode="contain"
        />
      </View>
    );
  };

  // Stock card component
  const StockCard = ({ stock, isInWatchlist }) => (
    <TouchableOpacity
      style={styles.stockCard}
      onPress={() => handleStockPress(stock)}
      activeOpacity={0.7}
    >
      <View style={styles.stockLeft}>
        <CompanyIcon ticker={stock.ticker} size={48} />
        <View style={styles.stockInfo}>
          <Text style={styles.stockTicker}>{stock.ticker}</Text>
          <Text style={styles.stockName} numberOfLines={1}>{stock.companyName}</Text>
          <Text style={styles.stockSector}>{stock.sector}</Text>
        </View>
      </View>

      <View style={styles.stockCenter}>
        <Text style={styles.stockPrice}>${stock.price.toFixed(2)}</Text>
        <View style={[
          styles.changeContainer,
          { backgroundColor: stock.changePercent >= 0 ? theme.colors.stock.gainLight : theme.colors.stock.lossLight }
        ]}>
          <Text style={[
            styles.stockChange,
            { color: stock.changePercent >= 0 ? theme.colors.stock.gain : theme.colors.stock.loss }
          ]}>
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.watchlistButton}
        onPress={() => handleWatchlistToggle(stock)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isInWatchlist ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={isInWatchlist ? theme.colors.primary.main : theme.colors.text.secondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Screen 
      padding={false} 
      scrollable={true}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary.main}
          colors={[theme.colors.primary.main]}
        />
      }
    >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stocks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.text.secondary}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sector Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectorScroll}>
            {SECTORS.map((sector) => (
              <TouchableOpacity
                key={sector}
                style={[
                  styles.sectorButton,
                  selectedSector === sector && styles.sectorButtonActive
                ]}
                onPress={() => setSelectedSector(sector)}
              >
                <Text style={[
                  styles.sectorText,
                  selectedSector === sector && styles.sectorTextActive
                ]}>
                  {sector}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Market Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={[theme.colors.primary.light, theme.colors.primary.main]}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredStocks.length}</Text>
              <Text style={styles.statLabel}>Stocks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {filteredStocks.filter(s => s.changePercent > 0).length}
              </Text>
              <Text style={styles.statLabel}>Gainers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {filteredStocks.filter(s => s.changePercent < 0).length}
              </Text>
              <Text style={styles.statLabel}>Losers</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stock List */}
        <SectionHeader 
          title="Stocks" 
          showIndicator={true}
          style={styles.sectionHeader}
        />

        <View style={styles.stocksList}>
          {filteredStocks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={48} color={theme.colors.text.secondary} />
              <Text style={styles.emptyText}>No stocks found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          ) : (
            filteredStocks.map((stock) => {
              const isInWatchlist = watchlist.some(item => item.ticker === stock.ticker);
              return (
                <StockCard
                  key={stock.ticker}
                  stock={stock}
                  isInWatchlist={isInWatchlist}
                />
              );
            })
          )}
        </View>

    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: theme.colors.background.primary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    backgroundColor: theme.colors.background.primary,
    paddingBottom: 16,
  },
  sectorScroll: {
    paddingHorizontal: 16,
  },
  sectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  sectorButtonActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  sectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  sectorTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    marginHorizontal: 16,
  },
  sectionHeader: {
    marginTop: 8,
  },
  stocksList: {
    paddingHorizontal: 16,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  stockLogoImage: {
    borderRadius: 8,
  },
  stockLogoText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  stockInfo: {
    flex: 1,
  },
  stockTicker: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  stockName: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  stockSector: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
  stockCenter: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  watchlistButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

});

export default MarketScreen;
/**
 * Stock Search Modal Component
 * Interactive modal for searching and selecting stocks to add to watchlist
 * Matches Figma design with search, company logos, mini charts, and real-time data
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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
  F: {
    type: 'image',
    source: 'https://logo.clearbit.com/ford.com',
    fallback: { type: 'text', text: 'F', font: 'bold' },
    color: '#003478',
    backgroundColor: '#FFFFFF'
  },
  FB: {
    type: 'image',
    source: 'https://logo.clearbit.com/meta.com',
    fallback: { type: 'icon', name: 'facebook', library: 'FontAwesome5' },
    color: '#1877F2',
    backgroundColor: '#F0F2F5'
  },
  AMD: {
    type: 'image',
    source: 'https://logo.clearbit.com/amd.com',
    fallback: { type: 'text', text: 'A', font: 'bold' },
    color: '#ED1C24',
    backgroundColor: '#000000'
  },
  ABSCI: {
    type: 'image',
    source: 'https://logo.clearbit.com/absci.com',
    fallback: { type: 'text', text: 'A', font: 'bold' },
    color: '#4CAF50',
    backgroundColor: '#FFFFFF'
  },
  BAC: {
    type: 'image',
    source: 'https://logo.clearbit.com/bankofamerica.com',
    fallback: { type: 'text', text: 'B', font: 'bold' },
    color: '#E31837',
    backgroundColor: '#FFFFFF'
  }
};

/**
 * Comprehensive stock data for search and selection
 */
const ALL_STOCKS = [
  {
    ticker: 'AAPL',
    companyName: 'Apple, Inc',
    sector: 'Technology',
    price: 142.65,
    change: 1.14,
    changePercent: 0.81,
    sparklineData: [140, 141, 142, 143, 142, 141, 142, 143]
  },
  {
    ticker: 'NFLX',
    companyName: 'Netflix, Inc',
    sector: 'Entertainment',
    price: 88.91,
    change: 1.13,
    changePercent: 1.29,
    sparklineData: [87, 88, 89, 88, 87, 88, 89, 90]
  },
  {
    ticker: 'AMZN',
    companyName: 'Amazon, Inc',
    sector: 'E-commerce',
    price: 3283.26,
    change: -1.64,
    changePercent: -0.05,
    sparklineData: [3290, 3285, 3280, 3275, 3280, 3285, 3280, 3283]
  },
  {
    ticker: 'MSFT',
    companyName: 'Microsoft, Corp',
    sector: 'Technology',
    price: 188.09,
    change: 4.21,
    changePercent: 2.29,
    sparklineData: [184, 185, 187, 186, 187, 188, 189, 188]
  },
  {
    ticker: 'F',
    companyName: 'Ford Motor',
    sector: 'Automotive',
    price: 14.06,
    change: -0.045,
    changePercent: -0.32,
    sparklineData: [14.2, 14.1, 14.0, 13.9, 14.0, 14.1, 14.0, 14.06]
  },
  {
    ticker: 'FB',
    companyName: 'Facebook, Inc',
    sector: 'Technology',
    price: 343.01,
    change: 3.64,
    changePercent: 1.07,
    sparklineData: [340, 341, 342, 343, 342, 341, 342, 343]
  },
  {
    ticker: 'AMD',
    companyName: 'Advanced Micro Devices',
    sector: 'Technology',
    price: 100.41,
    change: 1.96,
    changePercent: 1.99,
    sparklineData: [98, 99, 100, 101, 100, 99, 100, 100.4]
  },
  {
    ticker: 'ABSCI',
    companyName: 'ABSCI Corp',
    sector: 'Biotechnology',
    price: 11.82,
    change: -0.595,
    changePercent: -4.83,
    sparklineData: [12.5, 12.3, 12.0, 11.8, 11.9, 12.0, 11.9, 11.82]
  },
  {
    ticker: 'BAC',
    companyName: 'Bank of America',
    sector: 'Banking',
    price: 43.08,
    change: 0.129,
    changePercent: 0.30,
    sparklineData: [42.8, 42.9, 43.0, 43.1, 43.0, 42.9, 43.0, 43.08]
  },
  {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc',
    sector: 'Automotive',
    price: 234.50,
    change: 2.85,
    changePercent: 1.23,
    sparklineData: [230, 232, 233, 235, 234, 233, 234, 234.5]
  },
  {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc',
    sector: 'Technology',
    price: 2789.12,
    change: 15.67,
    changePercent: 0.56,
    sparklineData: [2770, 2775, 2780, 2785, 2790, 2788, 2789, 2789]
  },
  {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    sector: 'Technology',
    price: 421.33,
    change: 8.92,
    changePercent: 2.16,
    sparklineData: [410, 415, 418, 420, 422, 421, 420, 421.3]
  }
];

/**
 * Company Icon component with fallback support
 */
const CompanyIcon = ({ ticker, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  const iconConfig = COMPANY_ICONS[ticker];
  
  if (!iconConfig || imageError) {
    const fallback = iconConfig?.fallback || { type: 'text', text: ticker[0] };
    
    return (
      <View style={[
        styles.stockIcon,
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
            styles.stockIconText,
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

  return (
    <View style={[
      styles.stockIcon,
      { 
        width: size, 
        height: size,
        backgroundColor: iconConfig.backgroundColor 
      }
    ]}>
      <Image
        source={{ uri: iconConfig.source }}
        style={[styles.stockIconImage, { width: size * 0.7, height: size * 0.7 }]}
        onError={() => setImageError(true)}
        resizeMode="contain"
      />
    </View>
  );
};

/**
 * Mini Chart component for sparkline visualization using simple bars
 */
const MiniChart = ({ data, isPositive, width = 60, height = 30 }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const barWidth = width / data.length;
  
  return (
    <View style={[styles.miniChart, { width, height }]}>
      {data.map((value, index) => {
        const barHeight = ((value - min) / range) * height * 0.8;
        const marginTop = height - barHeight;
        
        return (
          <View
            key={index}
            style={[
              styles.chartBar,
              {
                width: barWidth * 0.7,
                height: barHeight,
                marginTop,
                backgroundColor: isPositive ? '#22C55E' : '#EF4444',
                opacity: 0.3 + (index / data.length) * 0.7, // Gradient effect
              }
            ]}
          />
        );
      })}
    </View>
  );
};

/**
 * Stock Search Modal Component
 */
const StockSearchModal = ({ visible, onClose, onSelectStock, existingWatchlist = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState(ALL_STOCKS);
  const [selectedStocks, setSelectedStocks] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Filter stocks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStocks(ALL_STOCKS);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = ALL_STOCKS.filter(stock => 
        stock.ticker.toLowerCase().includes(query) ||
        stock.companyName.toLowerCase().includes(query) ||
        stock.sector.toLowerCase().includes(query)
      );
      setFilteredStocks(filtered);
    }
  }, [searchQuery]);

  /**
   * Handle stock selection/deselection
   */
  const handleStockToggle = (stock) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newSelected = new Set(selectedStocks);
    if (newSelected.has(stock.ticker)) {
      newSelected.delete(stock.ticker);
    } else {
      newSelected.add(stock.ticker);
    }
    setSelectedStocks(newSelected);
  };

  /**
   * Handle adding selected stocks to watchlist
   */
  const handleAddStocks = async () => {
    if (selectedStocks.size === 0) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Get selected stock objects
      const stocksToAdd = filteredStocks.filter(stock => 
        selectedStocks.has(stock.ticker)
      );

      // Add each stock to watchlist
      for (const stock of stocksToAdd) {
        await onSelectStock(stock);
      }

      // Reset and close
      setSelectedStocks(new Set());
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Error adding stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if stock is already in watchlist
   */
  const isInWatchlist = (ticker) => {
    return existingWatchlist.some(stock => stock.ticker === ticker);
  };

  /**
   * Stock Item Component
   */
  const StockItem = ({ stock }) => {
    const isPositive = stock.change >= 0;
    const isSelected = selectedStocks.has(stock.ticker);
    const inWatchlist = isInWatchlist(stock.ticker);

    return (
      <TouchableOpacity
        style={[
          styles.stockItem,
          isSelected && styles.stockItemSelected,
          inWatchlist && styles.stockItemInWatchlist
        ]}
        onPress={() => !inWatchlist && handleStockToggle(stock)}
        disabled={inWatchlist}
        activeOpacity={0.7}
      >
        <View style={styles.stockLeft}>
          <CompanyIcon ticker={stock.ticker} size={40} />
          <View style={styles.stockInfo}>
            <Text style={styles.stockTicker}>{stock.ticker}</Text>
            <Text style={styles.stockName} numberOfLines={1}>{stock.companyName}</Text>
          </View>
        </View>

        <View style={styles.stockCenter}>
          <MiniChart 
            data={stock.sparklineData} 
            isPositive={isPositive}
            width={60}
            height={30}
          />
        </View>

        <View style={styles.stockRight}>
          <Text style={styles.stockPrice}>${stock.price.toFixed(2)}</Text>
          <Text style={[
            styles.stockChange,
            isPositive ? styles.positiveChange : styles.negativeChange
          ]}>
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </Text>
        </View>

        {inWatchlist && (
          <View style={styles.watchlistBadge}>
            <Ionicons name="checkmark" size={16} color="#22C55E" />
          </View>
        )}

        {isSelected && !inWatchlist && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary.main} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Select Stocks</Text>
          
          {selectedStocks.size > 0 && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddStocks}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary.main} />
              ) : (
                <Text style={styles.addButtonText}>
                  Add ({selectedStocks.size})
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Symbol or company..."
              placeholderTextColor={theme.colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="characters"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stock List */}
        <ScrollView 
          style={styles.stockList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredStocks.map((stock) => (
            <StockItem key={stock.ticker} stock={stock} />
          ))}
          
          {filteredStocks.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={theme.colors.text.secondary} />
              <Text style={styles.emptyTitle}>No stocks found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with a different symbol or company name
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  clearButton: {
    marginLeft: 8,
  },
  stockList: {
    flex: 1,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  stockItemSelected: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary.main,
  },
  stockItemInWatchlist: {
    backgroundColor: '#F0FDF4',
    opacity: 0.6,
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockIcon: {
    borderRadius: 8,
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
  stockIconImage: {
    borderRadius: 6,
  },
  stockIconText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  stockInfo: {
    flex: 1,
  },
  stockTicker: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  stockName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  stockCenter: {
    marginHorizontal: 16,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chartBar: {
    marginHorizontal: 0.5,
    borderRadius: 1,
  },
  stockRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  stockChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#22C55E',
  },
  negativeChange: {
    color: '#EF4444',
  },
  watchlistBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 4,
  },
  selectedBadge: {
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StockSearchModal;

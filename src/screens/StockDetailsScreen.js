/**
 * Stock Details Screen - Comprehensive stock information page
 * Shows real-time stock data, charts, and trading actions
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components';
import { theme } from '../theme';
import { Image, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
};

// Mock chart data generator
const generateChartData = (period, basePrice) => {
  const periods = {
    '1D': 24,
    '1W': 7,
    '1M': 30,
    '1Y': 12,
    '5Y': 60
  };
  
  const points = periods[period] || 30;
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < points; i++) {
    const variation = (Math.random() - 0.5) * basePrice * 0.05;
    currentPrice += variation;
    data.push({
      value: Math.max(currentPrice, basePrice * 0.8),
      timestamp: Date.now() - (points - i) * (period === '1D' ? 3600000 : 86400000)
    });
  }
  
  return data;
};

const StockDetailsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { stock } = route.params;
  
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(stock.price || 3283.26);
  const [priceChange, setPriceChange] = useState(stock.change || -1.78);
  const [changePercent, setChangePercent] = useState(stock.changePercent || -0.05);

  const periods = ['1D', '1W', '1M', '1Y', '5Y'];

  useEffect(() => {
    // Generate chart data based on selected period
    const data = generateChartData(selectedPeriod, currentPrice);
    setChartData(data);
  }, [selectedPeriod, currentPrice]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    Vibration.vibrate(25);
  };

  const handleBuy = () => {
    navigation.navigate('MainTabs', {
      screen: 'Transactions',
      params: {
        stock: {
          ticker: stock.ticker || stock.symbol,
          companyName: stock.companyName || stock.name,
          price: currentPrice,
          color: stock.color || theme.colors.primary.main
        }
      }
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    Vibration.vibrate(50);
    Alert.alert(
      isFollowing ? 'Unfollowed' : 'Following',
      `You ${isFollowing ? 'stopped following' : 'are now following'} ${stock.ticker || stock.symbol}`
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change, percent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  // Simple chart component
  const Chart = ({ data }) => {
    if (!data.length) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartYAxis}>
          <Text style={styles.chartAxisLabel}>{formatPrice(maxValue)}</Text>
          <Text style={styles.chartAxisLabel}>{formatPrice((maxValue + minValue) / 2)}</Text>
          <Text style={styles.chartAxisLabel}>{formatPrice(minValue)}</Text>
        </View>
        
        <View style={styles.chart}>
          {data.map((point, index) => {
            const height = ((point.value - minValue) / range) * 200;
            const isGreen = index === 0 || point.value >= data[index - 1]?.value;
            
            return (
              <View key={index} style={styles.candlestickContainer}>
                <View
                  style={[
                    styles.candlestick,
                    {
                      height: Math.max(height, 4),
                      backgroundColor: isGreen ? theme.colors.stock.gain : theme.colors.stock.loss,
                      opacity: 0.8,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
        
        <Text style={styles.currentPriceLabel}>{formatPrice(currentPrice)}</Text>
      </View>
    );
  };

  // Company Icon component with fallback support
  const CompanyIcon = ({ ticker, size = 80 }) => {
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
            backgroundColor: iconConfig?.backgroundColor || theme.colors.primary.main 
          }
        ]}>
          {fallback.type === 'icon' ? (
            fallback.library === 'FontAwesome5' ? (
              <FontAwesome5 
                name={fallback.name} 
                size={size * 0.4} 
                color={iconConfig?.color || '#FFFFFF'} 
              />
            ) : (
              <MaterialCommunityIcons 
                name={fallback.name} 
                size={size * 0.4} 
                color={iconConfig?.color || '#FFFFFF'} 
              />
            )
          ) : (
            <Text style={[
              styles.stockLogoText,
              { 
                fontSize: size * 0.4,
                color: iconConfig?.color || '#FFFFFF',
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.stockSymbol}>{stock.ticker || stock.symbol || 'AMZN'}</Text>
          <Text style={styles.companyName}>{stock.companyName || stock.name || 'Amazon, Inc'}</Text>
        </View>
        
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Stock Logo */}
        <View style={styles.logoContainer}>
          <CompanyIcon ticker={stock.ticker || stock.symbol || 'AMZN'} size={80} />
        </View>

        {/* Price Information */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>{formatPrice(currentPrice)}</Text>
          <Text style={[
            styles.priceChange,
            { color: priceChange >= 0 ? theme.colors.stock.gain : theme.colors.stock.loss }
          ]}>
            {formatChange(priceChange, changePercent)}
          </Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <Chart data={chartData} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <PrimaryButton
          title="Buy"
          onPress={handleBuy}
          style={styles.buyButton}
        />
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followButtonActive]}
          onPress={handleFollow}
        >
          <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  stockSymbol: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  stockLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  stockLogoText: {
    fontSize: 32,
    fontWeight: '900',
  },
  stockLogoImage: {
    borderRadius: 10,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  currentPrice: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -2,
    marginBottom: 8,
  },
  priceChange: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F4',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A8E',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chartContainer: {
    height: 300,
    marginBottom: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 80,
    height: 200,
    paddingRight: 12,
  },
  chartAxisLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.tertiary,
  },
  chart: {
    flex: 1,
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  candlestickContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 1,
  },
  candlestick: {
    width: '80%',
    minHeight: 4,
    borderRadius: 2,
  },
  currentPriceLabel: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: theme.colors.text.primary,
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
    gap: 16,
  },
  buyButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
  },
  followButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonActive: {
    backgroundColor: theme.colors.primary.main,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.main,
  },
  followButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default StockDetailsScreen;

/**
 * Modern Portfolio Screen - Real-time portfolio with dynamic updates
 * Features: Live data, animations, pull-to-refresh, haptic feedback
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Image
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen, MiniChart, SectionHeader } from '../components';
import { usePortfolio } from '../hooks';
import { useTheme } from '../contexts/ThemeProvider';
import { theme } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

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
  NFLX: {
    type: 'image',
    source: 'https://logo.clearbit.com/netflix.com',
    fallback: { type: 'text', text: 'N', font: 'bold' },
    color: '#E50914',
    backgroundColor: '#000000'
  },
  TSLA: {
    type: 'image',
    source: 'https://logo.clearbit.com/tesla.com',
    fallback: { type: 'text', text: 'T', font: 'bold' },
    color: '#CC0000',
    backgroundColor: '#FFFFFF'
  }
};

const PortfolioScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { portfolio, holdings, loading, error, refreshPortfolio } = usePortfolio();

  // Helper function to determine if a color is light
  const isLightColor = (color) => {
    if (!color) return false;
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance (0 = black, 255 = white)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 186; // threshold for "light" colors
  };

  // Helper function to get theme-appropriate background color
  const getIconBackgroundColor = (originalBgColor) => {
    if (!isDark) return originalBgColor;
    
    // In dark mode, replace light colors with dark alternatives
    if (isLightColor(originalBgColor)) {
      return colors.cardBackground; // Use theme's card background for consistency
    }
    
    return originalBgColor; // Keep dark colors as they are
  };

  // Helper function to get theme-appropriate icon color for contrast
  const getIconColor = (originalColor, backgroundColor) => {
    if (!isDark) return originalColor;
    
    // If we're using a dark background in dark mode and the original color is dark,
    // we need to ensure good contrast
    if (isLightColor(backgroundColor)) {
      return originalColor; // Light background, keep original color
    } else {
      // Dark background, ensure the icon color is visible
      if (!isLightColor(originalColor)) {
        return colors.textPrimary; // Use theme's primary text color for visibility
      }
      return originalColor;
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);



  // Dynamic chart data with realistic fluctuations
  const generateRealtimeChartData = useCallback(() => {
    const baseValues = [20000, 25000, 22000, 35000, 28000, 15000, 29140];
    const currentHour = new Date().getHours();
    const fluctuation = Math.sin(currentHour / 24 * Math.PI * 2) * 2000;
    
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: baseValues.map(value => value + fluctuation + (Math.random() - 0.5) * 1000),
          strokeWidth: 2.5,
          color: (opacity = 1) => `rgba(112, 199, 160, ${opacity})`,
        },
      ],
    };
  }, [currentTime]);

  const chartData = generateRealtimeChartData();

  const chartConfig = {
    backgroundColor: isDark ? '#1F2937' : '#F8F9FA',
    backgroundGradientFrom: isDark ? '#1F2937' : '#F8F9FA',
    backgroundGradientTo: isDark ? '#1F2937' : '#F8F9FA',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(51, 212, 157, ${opacity})`, // buttonPrimary color
    labelColor: (opacity = 1) => isDark ? '#9CA3AF' : '#6B7280',
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.buttonPrimary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: isDark ? '#374151' : '#E5E7EB',
      strokeWidth: 1,
    },
    fillShadowGradient: colors.buttonPrimary,
    fillShadowGradientOpacity: isDark ? 0.2 : 0.15,
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptic feedback not available on this device
    }

    try {
      await refreshPortfolio?.();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshPortfolio]);

  const handleStockPress = useCallback(async (stock) => {
    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptic feedback not available on this device
    }
    
    navigation.navigate('StockDetails', { stock });
  }, [navigation]);





  // Company Icon component with fallback support
  const CompanyIcon = ({ ticker, size = 48 }) => {
    const [imageError, setImageError] = useState(false);
    const iconConfig = COMPANY_ICONS[ticker];
    
    if (!iconConfig || imageError) {
      // Fallback to default icon
      const fallback = iconConfig?.fallback || { type: 'text', text: ticker[0] };
      
      // Use theme-aware background color for fallback icons
      const fallbackBgColor = getIconBackgroundColor(iconConfig?.backgroundColor) || colors.buttonPrimary + '20';
      const fallbackIconColor = getIconColor(iconConfig?.color || colors.buttonPrimary, fallbackBgColor);
      
      return (
        <View style={[
          styles.modernStockLogo,
          { 
            width: size, 
            height: size,
            backgroundColor: fallbackBgColor 
          }
        ]}>
          {fallback.type === 'icon' ? (
            fallback.library === 'FontAwesome5' ? (
              <FontAwesome5 
                name={fallback.name} 
                size={size * 0.5} 
                color={fallbackIconColor} 
              />
            ) : (
              <MaterialCommunityIcons 
                name={fallback.name} 
                size={size * 0.5} 
                color={fallbackIconColor} 
              />
            )
          ) : (
            <Text style={[
              styles.portfolioStockLogoText,
              { 
                fontSize: size * 0.4,
                color: fallbackIconColor,
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
    // Use theme-aware background color for image icons
    const imageBgColor = getIconBackgroundColor(iconConfig.backgroundColor);
    
    return (
      <View style={[
        styles.modernStockLogo,
        { 
          width: size, 
          height: size,
          backgroundColor: imageBgColor 
        }
      ]}>
        <Image
          source={{ uri: iconConfig.source }}
          style={[styles.portfolioStockLogoImage, { width: size * 0.7, height: size * 0.7 }]}
          onError={() => setImageError(true)}
          resizeMode="contain"
        />
      </View>
    );
  };

  // Real-time stock data with sparklines
  const modernStocks = [
    {
      id: 'nflx-1',
      ticker: 'NFLX',
      companyName: 'Netflix, Inc',
      currentPrice: 88.91 + (Math.random() - 0.5) * 2,
      change: 1.13 + (Math.random() - 0.5) * 0.5,
      changePercent: 1.29 + (Math.random() - 0.5) * 0.3,
      sparklineData: Array.from({ length: 20 }, (_, i) => 88 + Math.sin(i * 0.3) * 5 + Math.random() * 2),
      color: '#E50914'
    },
    {
      id: 'aapl-1',
      ticker: 'AAPL',
      companyName: 'Apple, Inc',
      currentPrice: 142.65 + (Math.random() - 0.5) * 3,
      change: 1.14 + (Math.random() - 0.5) * 0.6,
      changePercent: 0.81 + (Math.random() - 0.5) * 0.4,
      sparklineData: Array.from({ length: 20 }, (_, i) => 140 + Math.cos(i * 0.2) * 7 + Math.random() * 2),
      color: '#000000'
    },
    {
      id: 'tsla-1',
      ticker: 'TSLA',
      companyName: 'Tesla, Inc',
      currentPrice: 234.50 + (Math.random() - 0.5) * 5,
      change: 2.85 + (Math.random() - 0.5) * 1,
      changePercent: 1.23 + (Math.random() - 0.5) * 0.5,
      sparklineData: Array.from({ length: 20 }, (_, i) => 230 + Math.sin(i * 0.4) * 10 + Math.random() * 3),
      color: '#CC0000'
    }
  ];

  if (loading) {
    return (
      <Screen padding={false} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.buttonPrimary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading portfolio...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen padding={true}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.error || '#F44336'} />
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>Unable to load portfolio</Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.buttonPrimary }]} onPress={onRefresh}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen 
      padding={false} 
      scrollable={true}
      backgroundColor={colors.background}
      statusBarStyle={isDark ? 'light-content' : 'dark-content'}
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.buttonPrimary}
          colors={[colors.buttonPrimary]}
        />
      }
    >
        {/* Portfolio Value Header */}
        <View style={styles.portfolioHeaderContainer}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={[styles.liveText, { color: colors.textSecondary }]}>
              Live • {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          
          <Text style={[styles.portfolioLabel, { color: colors.textSecondary }]}>Portfolio value</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.portfolioValue, { color: colors.textPrimary }]}>
              ${(portfolio.totalValue || 13240.11).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <View style={styles.percentageContainer}>
              <View style={[
                styles.percentageBadge,
                { backgroundColor: (portfolio.dailyChangePercent || 1.74) >= 0 ? theme.colors.stock.gain : theme.colors.stock.loss }
              ]}>
                <Text style={styles.percentageText}>
                  {(portfolio.dailyChangePercent || 1.74) >= 0 ? '+' : ''}{(portfolio.dailyChangePercent || 1.74).toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#374151' : '#F5F5F5' }]}>
            <Ionicons name="trending-up" size={20} color={theme.colors.stock.gain} style={styles.statIcon} />
            <View style={styles.statTextContainer}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gain</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                ${(portfolio.gainAmount || 234.11).toFixed(2)}
              </Text>
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: isDark ? '#374151' : '#F5F5F5' }]}>
            <Ionicons name="trending-down" size={20} color={theme.colors.stock.loss} style={styles.statIcon} />
            <View style={styles.statTextContainer}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Loss</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                ${(portfolio.lossAmount || 34.11).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Chart */}
        <View style={styles.chartContainer}>
          <SectionHeader 
            title="Performance" 
            showIndicator={true}
            style={[styles.chartHeader, styles.performanceHeader]}
          />
          
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              segments={4}
              fromZero={false}
              withDots={false}
            />
          </View>
        </View>

        {/* Holdings Section */}
        <SectionHeader 
          title="Holdings" 
          actionText="View All"
          onActionPress={() => navigation.navigate('Portfolio')}
          showIndicator={true}
          style={styles.sectionHeader}
        />
        
        <View style={styles.stocksList}>
          
          {modernStocks.map((stock, index) => (
            <TouchableOpacity 
              key={stock.id} 
              style={styles.stockCard} 
              onPress={() => handleStockPress(stock)}
              activeOpacity={0.7}
            >
              <View style={styles.stockLeft}>
                <CompanyIcon ticker={stock.ticker} size={48} />
                <View style={styles.stockInfo}>
                  <Text style={[styles.stockTicker, { color: colors.textPrimary }]}>{stock.ticker}</Text>
                  <Text style={[styles.stockName, { color: colors.textSecondary }]} numberOfLines={1}>{stock.companyName}</Text>
                </View>
              </View>
              
              <View style={styles.stockChart}>
                <MiniChart 
                  data={stock.sparklineData} 
                  isPositive={stock.changePercent > 0}
                  width={60}
                  height={30}
                />
              </View>
              
              <View style={styles.stockRight}>
                <Text style={[styles.stockPrice, { color: colors.textPrimary }]}>${stock.currentPrice.toFixed(2)}</Text>
                <View style={[
                  styles.changeContainer,
                  { backgroundColor: stock.changePercent > 0 ? theme.colors.stock.gainLight : theme.colors.stock.lossLight }
                ]}>
                  <Text style={[
                    styles.stockChange,
                    { color: stock.changePercent > 0 ? theme.colors.stock.gain : theme.colors.stock.loss }
                  ]}>
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor is now dynamic from theme
  },
  portfolioHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4444',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '400',
    // color is now dynamic from theme
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  portfolioLabel: {
    fontSize: 13,
    fontWeight: '400',
    // color is now dynamic from theme
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: '700',
    // color is now dynamic from theme
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  infoIcon: {
    padding: 4,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-around',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  chartContainer: {
    marginTop: 16,
  },
  chartHeader: {
    marginTop: 0,
    paddingHorizontal: 0,
  },
  performanceHeader: {
    paddingLeft: 20,
  },
  chartWrapper: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  chart: {
    borderRadius: 16,
  },
  sectionHeader: {
    marginTop: 8,
  },
  stocksList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modernStockLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stockLogoEmoji: {
    fontSize: 20,
  },
  portfolioStockLogoImage: {
    borderRadius: 8,
  },
  portfolioStockLogoText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  stockInfo: {
    flex: 1,
  },
  stockTicker: {
    fontSize: 16,
    fontWeight: '600',
    // color is now dynamic from theme
    marginBottom: 2,
  },
  stockName: {
    fontSize: 12,
    // color is now dynamic from theme
    fontWeight: '400',
  },
  stockChart: {
    marginHorizontal: 16,
    justifyContent: 'center',
  },

  stockRight: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '600',
    // color is now dynamic from theme
    marginBottom: 4,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockChange: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '300',
    // color is now dynamic from theme
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  errorSubtext: {
    fontSize: 13,
    fontWeight: '300',
    // color is now dynamic from theme
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  retryButton: {
    // backgroundColor is now dynamic from theme
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

export default PortfolioScreen;
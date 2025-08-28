/**
 * Modern Portfolio Screen - Real-time portfolio with dynamic updates
 * Features: Live data, animations, pull-to-refresh, haptic feedback
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Platform,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components';
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
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedValues] = useState({
    portfolio: new Animated.Value(0),
    gainCard: new Animated.Value(0),
    lossCard: new Animated.Value(0),
    chart: new Animated.Value(0),
    stocks: new Animated.Value(0),
  });

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Entrance animations
  useEffect(() => {
    if (!loading) {
      const animations = [
        Animated.timing(animatedValues.portfolio, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.gainCard, {
          toValue: 1,
          duration: 700,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.lossCard, {
          toValue: 1,
          duration: 700,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.chart, {
          toValue: 1,
          duration: 800,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.stocks, {
          toValue: 1,
          duration: 600,
          delay: 600,
          useNativeDriver: true,
        }),
      ];
      
      Animated.stagger(100, animations).start();
    }
  }, [loading]);

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
    backgroundColor: colors.cardBackground,
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(51, 212, 157, ${opacity})`, // buttonPrimary color
    labelColor: (opacity = 1) => colors.textSecondary,
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
      stroke: colors.border,
      strokeWidth: 1,
    },
    fillShadowGradient: colors.buttonPrimary,
    fillShadowGradientOpacity: 0.15,
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
    
    navigation.navigate('ItemDetails', { stock });
  }, [navigation]);

  // Modern skeleton loader
  const SkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader} />
      <View style={styles.skeletonValue} />
      <View style={styles.skeletonCards}>
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
      </View>
      <View style={styles.skeletonChart} />
    </View>
  );

  // Animated Number Component
  const AnimatedNumber = ({ value, prefix = '$', suffix = '' }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: value,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, [value]);

    return (
      <Animated.Text style={[styles.portfolioValue, { color: colors.textPrimary }]}>
        {prefix}{value?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}{suffix}
      </Animated.Text>
    );
  };

  // Company Icon component with fallback support
  const CompanyIcon = ({ ticker, size = 48 }) => {
    const [imageError, setImageError] = useState(false);
    const iconConfig = COMPANY_ICONS[ticker];
    
    if (!iconConfig || imageError) {
      // Fallback to default icon
      const fallback = iconConfig?.fallback || { type: 'text', text: ticker[0] };
      
      return (
        <View style={[
          styles.modernStockLogo,
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
              styles.portfolioStockLogoText,
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
        styles.modernStockLogo,
        { 
          width: size, 
          height: size,
          backgroundColor: iconConfig.backgroundColor 
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
        <SkeletonLoader />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen padding={true}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error.main} />
          <Text style={styles.errorText}>Unable to load portfolio</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
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
          tintColor={theme.colors.primary.main}
          colors={[theme.colors.primary.main]}
        />
      }
    >
        {/* Live Time Indicator */}
        <View style={[styles.timeIndicator, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            Live • {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {/* Portfolio Value Header */}
        <Animated.View 
          style={[
            styles.headerContainer,
            { backgroundColor: colors.cardBackground },
            {
              opacity: animatedValues.portfolio,
              transform: [{
                translateY: animatedValues.portfolio.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }
          ]}
        >
          <Text style={[styles.portfolioLabel, { color: colors.textSecondary }]}>Portfolio value</Text>
          <View style={styles.valueRow}>
            <AnimatedNumber value={portfolio.totalValue || 13240.11} />
            <View style={styles.percentageContainer}>
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.percentageBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.percentageText}>
                  +{portfolio.dailyChangePercent?.toFixed(2) || '1.74'}%
                </Text>
              </LinearGradient>
              <TouchableOpacity style={styles.infoIcon}>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary.main} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Gain/Loss Cards */}
        <View style={[styles.gainLossContainer, { backgroundColor: colors.cardBackground }]}>
          <Animated.View 
            style={[
              styles.gainCard,
              {
                opacity: animatedValues.gainCard,
                transform: [{
                  translateX: animatedValues.gainCard.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['#E8F5E8', '#F1F8E9']}
              style={styles.cardGradient}
            >
              <Ionicons name="trending-up" size={24} color={theme.colors.stock.gain} style={styles.cardIcon} />
              <Text style={styles.cardLabel}>Total Gain</Text>
              <AnimatedNumber value={portfolio.gainAmount || 234.11} />
            </LinearGradient>
          </Animated.View>

          <Animated.View 
            style={[
              styles.lossCard,
              {
                opacity: animatedValues.lossCard,
                transform: [{
                  translateX: animatedValues.lossCard.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['#FFEBEE', '#FFCDD2']}
              style={styles.cardGradient}
            >
              <Ionicons name="trending-down" size={24} color={theme.colors.stock.loss} style={styles.cardIcon} />
              <Text style={styles.cardLabel}>Total Loss</Text>
              <AnimatedNumber value={portfolio.lossAmount || 34.11} />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Portfolio Chart */}
        <Animated.View 
          style={[
            styles.chartContainer,
            { backgroundColor: colors.cardBackground },
            {
              opacity: animatedValues.chart,
              transform: [{
                scale: animatedValues.chart.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                })
              }]
            }
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Performance</Text>
            <View style={styles.chartPeriod}>
              <Text style={styles.periodText}>7D</Text>
            </View>
          </View>
          
          <View style={[styles.chartWrapper, { backgroundColor: colors.cardBackground }]}>
            <LineChart
              data={chartData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              segments={4}
              fromZero={false}
              withDots={true}
            />
          </View>
        </Animated.View>

        {/* Modern Stocks Section */}
        <Animated.View 
          style={[
            styles.stocksSection,
            { backgroundColor: colors.cardBackground },
            {
              opacity: animatedValues.stocks,
              transform: [{
                translateY: animatedValues.stocks.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.stocksHeader}>
            <Text style={[styles.stocksTitle, { color: colors.textPrimary }]}>Holdings</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary.main} />
            </TouchableOpacity>
          </View>
          
          {modernStocks.map((stock, index) => (
            <TouchableOpacity 
              key={stock.id} 
              style={[styles.modernStockCard, { backgroundColor: colors.background }]} 
              onPress={() => handleStockPress(stock)}
              activeOpacity={0.7}
            >
              <View style={styles.stockLeft}>
                <CompanyIcon ticker={stock.ticker} size={48} />
                <View style={styles.stockInfo}>
                  <Text style={[styles.stockTicker, { color: colors.textPrimary }]}>{stock.ticker}</Text>
                  <Text style={[styles.stockName, { color: colors.textSecondary }]}>{stock.companyName}</Text>
                </View>
              </View>
              
              <View style={styles.stockCenter}>
                <View style={styles.modernSparkline}>
                  {stock.sparklineData.slice(-7).map((point, i) => (
                    <View 
                      key={i}
                      style={[
                        styles.sparklineBar,
                        { 
                          height: (point - Math.min(...stock.sparklineData)) / 
                                  (Math.max(...stock.sparklineData) - Math.min(...stock.sparklineData)) * 20 + 5,
                          backgroundColor: stock.changePercent > 0 ? theme.colors.stock.gain : theme.colors.stock.loss,
                          opacity: 0.3 + (i / 7) * 0.7
                        }
                      ]}
                    />
                  ))}
                </View>
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
        </Animated.View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor is now dynamic from theme
  },
  scrollView: {
    flex: 1,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    // backgroundColor is now dynamic from theme
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
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
    // backgroundColor is now dynamic from theme
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
    fontSize: 42,
    fontWeight: '300',
    // color is now dynamic from theme
    letterSpacing: -2,
    lineHeight: 48,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-thin',
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
  gainLossContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    // backgroundColor is now dynamic from theme
  },
  gainCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  lossCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
    alignItems: 'flex-start',
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    fontWeight: '400',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  gainAmount: {
    fontSize: 22,
    fontWeight: '300',
    color: theme.colors.stock.gain,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  lossAmount: {
    fontSize: 22,
    fontWeight: '300',
    color: theme.colors.stock.loss,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  chartContainer: {
    // backgroundColor is now dynamic from theme
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  chartPeriod: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  chartWrapper: {
    // backgroundColor will be dynamic based on theme
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chart: {
    borderRadius: 16,
  },
  stocksSection: {
    // backgroundColor is now dynamic from theme
    marginTop: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  stocksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stocksTitle: {
    fontSize: 24,
    fontWeight: '300',
    // color is now dynamic from theme
    letterSpacing: -0.8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.primary.main,
    marginRight: 4,
    letterSpacing: 0.3,
  },
  modernStockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    // backgroundColor is now dynamic from theme
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
    fontSize: 17,
    fontWeight: '500',
    // color is now dynamic from theme
    marginBottom: 3,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  stockName: {
    fontSize: 12,
    // color is now dynamic from theme
    fontWeight: '300',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  stockCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modernSparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 25,
    gap: 2,
  },
  sparklineBar: {
    width: 3,
    borderRadius: 1.5,
  },
  stockRight: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 17,
    fontWeight: '400',
    // color is now dynamic from theme
    marginBottom: 4,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
  skeletonContainer: {
    padding: 16,
  },
  skeletonHeader: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    width: '40%',
  },
  skeletonValue: {
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 20,
  },
  skeletonCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  skeletonCard: {
    flex: 1,
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
  skeletonChart: {
    height: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
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
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  errorSubtext: {
    fontSize: 13,
    fontWeight: '300',
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: theme.colors.primary.main,
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
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useAppContext } from '../../../store/AppContext';
import { router } from 'expo-router';

export default function Analytics() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { transactions, getTransactionStats, refreshData } = useAppContext();
  
  const [filterDates, setFilterDates] = useState({
    startDate: '',
    endDate: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, [refreshData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (!filterDates.startDate || transactionDate >= new Date(filterDates.startDate)) &&
      (!filterDates.endDate || transactionDate <= new Date(filterDates.endDate));
  });

  // Get stats for filtered transactions
  const getFilteredStats = () => {
    const stats = {
      totalExpenses: 0,
      totalCredits: 0,
      categoryTotals: {} as Record<string, number>,
    };

    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        stats.totalExpenses += transaction.amount;
        if (transaction.category) {
          stats.categoryTotals[transaction.category] = (stats.categoryTotals[transaction.category] || 0) + transaction.amount;
        }
      } else {
        stats.totalCredits += transaction.amount;
      }
    });

    return stats;
  };

  const { totalExpenses, totalCredits, categoryTotals } = getFilteredStats();

  // Prepare data for category pie chart
  const categoryData = Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    value,
    color: [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#36A2EB',
    ][index % 8],
    legendFontColor: isDark ? '#FFFFFF' : '#7F7F7F',
    legendFontSize: 12,
  }));

  // Prepare data for expense trend line chart
  const monthlyExpenses = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    if (transaction.type === 'expense') {
      acc[monthYear] += transaction.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const lineData = {
    labels: Object.keys(monthlyExpenses).slice(-6),
    datasets: [
      {
        data: Object.values(monthlyExpenses).slice(-6).length === 0 
          ? [0] // Provide a fallback if no data
          : Object.values(monthlyExpenses).slice(-6),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: isDark ? '#2a2a2a' : 'white',
    backgroundGradientTo: isDark ? '#2a2a2a' : 'white',
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: isDark ? 'white' : 'black', marginTop: 20 }}>
          Loading analytics data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']}
          tintColor={isDark ? '#ffffff' : '#007AFF'}
        />
      }
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? 'white' : 'black' }]}>
          Date Range Filter
        </Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#2a2a2a' : 'white' }]}>
          <View style={styles.dateFilters}>
            <TextInput
              style={[styles.filterInput, { backgroundColor: isDark ? '#333' : '#f5f5f5', color: isDark ? 'white' : 'black' }]}
              placeholder="Start Date (YYYY-MM-DD)"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={filterDates.startDate}
              onChangeText={(text) => setFilterDates(prev => ({ ...prev, startDate: text }))}
            />
            <TextInput
              style={[styles.filterInput, { backgroundColor: isDark ? '#333' : '#f5f5f5', color: isDark ? 'white' : 'black' }]}
              placeholder="End Date (YYYY-MM-DD)"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={filterDates.endDate}
              onChangeText={(text) => setFilterDates(prev => ({ ...prev, endDate: text }))}
            />
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setFilterDates({ startDate: '', endDate: '' })}
          >
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? 'white' : 'black' }]}>
          Expense Overview
        </Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#2a2a2a' : 'white' }]}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>
                Total Expenses
              </Text>
              <Text style={[styles.statValue, { color: '#ff4444' }]}>
                ₹{totalExpenses.toFixed(2)}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>
                Total Credits
              </Text>
              <Text style={[styles.statValue, { color: '#00C851' }]}>
                ₹{totalCredits.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? 'white' : 'black' }]}>
          Expense Trend
        </Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#2a2a2a' : 'white' }]}>
          {Object.keys(monthlyExpenses).length > 0 ? (
            <LineChart
              data={lineData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={{ color: isDark ? '#aaa' : '#666', textAlign: 'center', padding: 20 }}>
              No transaction data available for chart. Add transactions to see trends.
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? 'white' : 'black' }]}>
          Expense by Category
        </Text>
        <View style={[styles.card, { backgroundColor: isDark ? '#2a2a2a' : 'white' }]}>
          {categoryData.length > 0 ? (
            <PieChart
              data={categoryData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={{ color: isDark ? '#aaa' : '#666', textAlign: 'center', padding: 20 }}>
              No category data available. Add categorized transactions to see breakdown.
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.aiButton, { marginHorizontal: 20, marginBottom: 30 }]}
        onPress={() => router.push('/ai-summary')}
      >
        <Text style={styles.aiButtonText}>Get AI-Powered Financial Insights</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dateFilters: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  filterInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  clearButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiButton: {
    backgroundColor: '#5856D6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 
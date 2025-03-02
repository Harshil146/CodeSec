import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { supabase } from '../../../../lib/supabase';
import { Dimensions } from 'react-native';

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Bills',
  'Others',
];

const CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
];

interface CategoryTotal {
  name: string;
  amount: number;
}

interface ChartData {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
}

export default function GroupAnalytics() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const screenWidth = Dimensions.get('window').width;

  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [memberSpending, setMemberSpending] = useState<any[]>([]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadAnalyticsData();
    }
  }, [id]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchGroupDetails(),
        fetchGroupExpenses()
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async () => {
    const { data: group, error } = await supabase
      .from('groups')
      .select(`
        *,
        group_members(
          user_id,
          profiles(
            name,
            email
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    setGroupData(group);
  };

  const fetchGroupExpenses = async () => {
    const { data: expensesData, error } = await supabase
      .from('group_expenses')
      .select(`
        *,
        paid_by_user:profiles!paid_by(name)
      `)
      .eq('group_id', id)
      .order('date', { ascending: false });

    if (error) throw error;
    setExpenses(expensesData || []);

    // Process data for charts
    processExpenseData(expensesData || []);
  };

  const processExpenseData = (expensesData: any[]) => {
    // Category-wise expenses
    const categoryTotals = EXPENSE_CATEGORIES.reduce<CategoryTotal[]>((acc, category) => {
      const total = expensesData
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
      return [...acc, { name: category, amount: total }];
    }, []);

    const categoryChartData = categoryTotals
      .filter((cat: CategoryTotal) => cat.amount > 0)
      .map((cat: CategoryTotal, index: number) => ({
        name: cat.name,
        amount: cat.amount,
        color: CHART_COLORS[index % CHART_COLORS.length],
        legendFontColor: isDark ? '#fff' : '#000',
      }));
    setCategoryData(categoryChartData);

    // Monthly expenses
    const monthlyTotals = expensesData.reduce((acc: any, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'long' });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {});

    const monthlyChartData = Object.entries(monthlyTotals)
      .map(([month, amount], index) => ({
        name: month,
        amount: amount as number,
        color: CHART_COLORS[index % CHART_COLORS.length],
        legendFontColor: isDark ? '#fff' : '#000',
      }));
    setMonthlyData(monthlyChartData);

    // Member-wise spending
    const memberTotals = expensesData.reduce((acc: any, expense) => {
      const name = expense.paid_by_user?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + expense.amount;
      return acc;
    }, {});

    const memberChartData = Object.entries(memberTotals)
      .map(([name, amount], index) => ({
        name,
        amount: amount as number,
        color: CHART_COLORS[index % CHART_COLORS.length],
        legendFontColor: isDark ? '#fff' : '#000',
      }));
    setMemberSpending(memberChartData);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    },
    content: {
      padding: 20,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#aaaaaa' : '#666666',
    },
    section: {
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 15,
    },
    chartContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    detailsContainer: {
      marginTop: 20,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333333' : '#eeeeee',
    },
    detailName: {
      fontSize: 14,
      color: isDark ? '#ffffff' : '#000000',
    },
    detailAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#4ADE80' : '#16A34A',
    },
    noDataText: {
      textAlign: 'center',
      fontSize: 16,
      color: isDark ? '#aaaaaa' : '#666666',
      marginVertical: 20,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ color: isDark ? 'white' : 'black', marginTop: 10 }}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{groupData?.name} Analytics</Text>
          <Text style={styles.subtitle}>Track your group's spending patterns</Text>
        </View>

        {/* Category-wise Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category-wise Expenses</Text>
          {categoryData.length > 0 ? (
            <>
              <View style={styles.chartContainer}>
                <PieChart
                  data={categoryData}
                  width={screenWidth - 60}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                />
              </View>
              <View style={styles.detailsContainer}>
                {categoryData.map((category, index) => (
                  <View key={index} style={styles.detailRow}>
                    <Text style={styles.detailName}>{category.name}</Text>
                    <Text style={styles.detailAmount}>₹{category.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>No expense data available</Text>
          )}
        </View>

        {/* Monthly Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Distribution</Text>
          {monthlyData.length > 0 ? (
            <>
              <View style={styles.chartContainer}>
                <PieChart
                  data={monthlyData}
                  width={screenWidth - 60}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                />
              </View>
              <View style={styles.detailsContainer}>
                {monthlyData.map((month, index) => (
                  <View key={index} style={styles.detailRow}>
                    <Text style={styles.detailName}>{month.name}</Text>
                    <Text style={styles.detailAmount}>₹{month.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>No monthly data available</Text>
          )}
        </View>

        {/* Member-wise Spending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member-wise Spending</Text>
          {memberSpending.length > 0 ? (
            <>
              <View style={styles.chartContainer}>
                <PieChart
                  data={memberSpending}
                  width={screenWidth - 60}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                />
              </View>
              <View style={styles.detailsContainer}>
                {memberSpending.map((member, index) => (
                  <View key={index} style={styles.detailRow}>
                    <Text style={styles.detailName}>{member.name}</Text>
                    <Text style={styles.detailAmount}>₹{member.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>No member spending data available</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
} 
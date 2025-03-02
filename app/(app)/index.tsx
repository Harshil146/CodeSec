import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  useColorScheme,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useAppContext } from '../../store/AppContext';
import type { Transaction } from '../../lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Education',
  'Others',
];

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    user,
    profile,
    transactions,
    transactionsLoading,
    addTransaction,
    getTransactionStats,
    refreshData,
  } = useAppContext();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Others');
  const [newTransaction, setNewTransaction] = useState({
    name: '',
    amount: '',
    type: 'expense' as 'expense' | 'credit',
  });
  const [refreshing, setRefreshing] = useState(false);

  const { totalExpenses, totalCredits } = getTransactionStats();

  const [filterDates, setFilterDates] = useState({
    startDate: '',
    endDate: '',
  });
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Load data when component mounts
  useEffect(() => {
    refreshData();
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

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const matchesDate = (!filterDates.startDate || transactionDate >= new Date(filterDates.startDate)) &&
      (!filterDates.endDate || transactionDate <= new Date(filterDates.endDate));
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesDate && matchesCategory && matchesType;
  });

  const handleAddTransaction = async () => {
    if (!newTransaction.name || !newTransaction.amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await addTransaction({
        name: newTransaction.name,
        amount,
        type: newTransaction.type,
        category: newTransaction.type === 'expense' ? selectedCategory : undefined,
        date: new Date().toISOString(),
        user_id: user?.id || '',
        updated_at: new Date().toISOString(),
      });

      setIsModalVisible(false);
      setNewTransaction({
        name: '',
        amount: '',
        type: 'expense',
      });
      setSelectedCategory('Others');
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    }
  };

  const generateExcelSummary = async () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        transactions.map(t => ({
          Date: new Date(t.date).toLocaleDateString(),
          Description: t.name,
          Amount: t.amount,
          Type: t.type,
          Category: t.category || '-',
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      const wbout = XLSX.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
      });

      const fileName = FileSystem.documentDirectory + 'transactions.xlsx';
      await FileSystem.writeAsStringAsync(fileName, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileName, {
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Share transactions',
        UTI: 'com.microsoft.excel.xlsx',
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      Alert.alert('Error', 'Failed to generate Excel summary');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor={isDark ? '#ffffff' : '#007AFF'}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: isDark ? '#ffffff' : '#000000' }]}>
            Welcome back, {profile?.username || 'User'}!
          </Text>
          <Text style={[styles.dateText, { color: isDark ? '#aaaaaa' : '#666666' }]}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#ff3b30' }]}>
              <Ionicons name="arrow-down" size={24} color="#ffffff" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={[styles.summaryLabel, { color: isDark ? '#aaaaaa' : '#666666' }]}>
                Total Expenses
              </Text>
              <Text style={[styles.summaryValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                ₹{totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#34c759' }]}>
              <Ionicons name="arrow-up" size={24} color="#ffffff" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={[styles.summaryLabel, { color: isDark ? '#aaaaaa' : '#666666' }]}>
                Total Credits
              </Text>
              <Text style={[styles.summaryValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                ₹{totalCredits.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: totalCredits - totalExpenses >= 0 ? '#5856d6' : '#ff9500' },
              ]}
            >
              <Ionicons name="wallet" size={24} color="#ffffff" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={[styles.summaryLabel, { color: isDark ? '#aaaaaa' : '#666666' }]}>
                Balance
              </Text>
              <Text style={[styles.summaryValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                ₹{(totalCredits - totalExpenses).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              Recent Transactions
            </Text>
            <Link href="/individual-finance" asChild>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {transactionsLoading ? (
            <Text style={{ color: isDark ? '#aaaaaa' : '#666666', textAlign: 'center', padding: 20 }}>
              Loading transactions...
            </Text>
          ) : filteredTransactions.length === 0 ? (
            <Text style={{ color: isDark ? '#aaaaaa' : '#666666', textAlign: 'center', padding: 20 }}>
              No transactions found. Add a new transaction to get started!
            </Text>
          ) : (
            filteredTransactions.slice(0, 5).map(transaction => (
              <View
                key={transaction.id}
                style={[styles.transactionItem, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor:
                        transaction.type === 'expense'
                          ? '#ff3b30'
                          : '#34c759',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      transaction.type === 'expense'
                        ? 'arrow-down'
                        : 'arrow-up'
                    }
                    size={16}
                    color="#ffffff"
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionName, { color: isDark ? '#ffffff' : '#000000' }]}>
                    {transaction.name}
                  </Text>
                  <Text style={[styles.transactionCategory, { color: isDark ? '#aaaaaa' : '#666666' }]}>
                    {transaction.category || 'No category'} • {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: transaction.type === 'expense' ? '#ff3b30' : '#34c759',
                    },
                  ]}
                >
                  {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Add buttons and other sections from the existing code */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}
            onPress={() => {
              setNewTransaction({
                ...newTransaction,
                type: 'expense',
              });
              setIsModalVisible(true);
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#ff3b30' }]}>
              <Ionicons name="arrow-down" size={24} color="#ffffff" />
            </View>
            <Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#000000' }]}>
              Add Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}
            onPress={() => {
              setNewTransaction({
                ...newTransaction,
                type: 'credit',
              });
              setIsModalVisible(true);
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#34c759' }]}>
              <Ionicons name="arrow-up" size={24} color="#ffffff" />
            </View>
            <Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#000000' }]}>
              Add Credit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Transaction Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
              <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                Add {newTransaction.type === 'expense' ? 'Expense' : 'Credit'}
              </Text>

              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? '#2c2c2c' : '#f5f5f5', color: isDark ? '#ffffff' : '#000000' },
                ]}
                placeholder="Name"
                placeholderTextColor={isDark ? '#aaaaaa' : '#666666'}
                value={newTransaction.name}
                onChangeText={text => setNewTransaction({ ...newTransaction, name: text })}
              />

              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? '#2c2c2c' : '#f5f5f5', color: isDark ? '#ffffff' : '#000000' },
                ]}
                placeholder="Amount"
                placeholderTextColor={isDark ? '#aaaaaa' : '#666666'}
                keyboardType="numeric"
                value={newTransaction.amount}
                onChangeText={text => setNewTransaction({ ...newTransaction, amount: text })}
              />

              {newTransaction.type === 'expense' && (
                <View style={styles.categoryContainer}>
                  <Text style={[styles.categoryTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Category
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScrollContent}
                  >
                    {EXPENSE_CATEGORIES.map(category => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryItem,
                          {
                            backgroundColor:
                              selectedCategory === category
                                ? '#007AFF'
                                : isDark
                                ? '#2c2c2c'
                                : '#f0f0f0',
                          },
                        ]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text
                          style={[
                            styles.categoryItemText,
                            {
                              color:
                                selectedCategory === category
                                  ? '#ffffff'
                                  : isDark
                                  ? '#aaaaaa'
                                  : '#666666',
                            },
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.addButton]}
                  onPress={handleAddTransaction}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTextContainer: {
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoriesScrollContent: {
    paddingBottom: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryItemText: {
    fontSize: 14,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#34c759',
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 
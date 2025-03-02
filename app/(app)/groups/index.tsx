import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { router, Link } from 'expo-router';
import useStore from '../../../store/useStore';
import { useAppContext } from '../../../store/AppContext';

type Member = {
  id: string;
  name: string;
  email: string;
  upiId: string;
  totalExpense: number;
  totalPaid: number;
};

type Settlement = {
  from: string;
  to: string;
  amount: number;
  toUpiId: string;
};

type Group = {
  id: string;
  name: string;
  icon: string;
  members: Member[];
  totalExpense: number;
  totalCredits: number;
  balance: number;
  description: string;
  memberCount: number;
};

type GroupExpense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  paidBy: string;
  paidFor: string[];
  date: string;
};

type PaymentMethod = 'upi' | 'cash';

const expenseCategories = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Bills',
  'Others',
];

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Weekend Trip',
    icon: '🏖️',
    members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        upiId: 'john@upi',
        totalExpense: 1500,
        totalPaid: 2000,
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        upiId: 'jane@upi',
        totalExpense: 1500,
        totalPaid: 1000,
      },
    ],
    totalExpense: 3000,
    totalCredits: 5000,
    balance: 0,
    description: 'Expenses for our weekend getaway',
    memberCount: 4,
  },
  {
    id: '2',
    name: 'Roommates',
    icon: '🏠',
    members: [
      {
        id: '1',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        upiId: 'mike@upi',
        totalExpense: 2000,
        totalPaid: 2500,
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        upiId: 'sarah@upi',
        totalExpense: 2000,
        totalPaid: 1500,
      },
    ],
    totalExpense: 4000,
    totalCredits: 7500,
    balance: 0,
    description: 'Monthly household expenses',
    memberCount: 3,
  },
  {
    id: '3',
    name: 'Office Lunch',
    icon: '🍴',
    members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        upiId: 'john@upi',
        totalExpense: 1000,
        totalPaid: 1000,
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        upiId: 'jane@upi',
        totalExpense: 1000,
        totalPaid: 1000,
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        upiId: 'mike@upi',
        totalExpense: 1000,
        totalPaid: 1000,
      },
    ],
    totalExpense: 3000,
    totalCredits: 2500,
    balance: 0,
    description: 'Team lunch expenses',
    memberCount: 5,
  },
];

export default function GroupsList() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { groups } = useAppContext();

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    category: expenseCategories[0],
    paidBy: '',
    paidFor: [] as string[],
    type: 'expense' as 'expense' | 'credit',
  });

  const calculateSettlements = (group: Group) => {
    const balances = group.members.map(member => ({
      id: member.id,
      name: member.name,
      upiId: member.upiId,
      balance: member.totalPaid - member.totalExpense,
    }));

    const debtors = balances.filter(b => b.balance < 0);
    const creditors = balances.filter(b => b.balance > 0);
    const newSettlements: Settlement[] = [];

    debtors.forEach(debtor => {
      let remainingDebt = Math.abs(debtor.balance);
      creditors.forEach(creditor => {
        if (remainingDebt > 0 && creditor.balance > 0) {
          const amount = Math.min(remainingDebt, creditor.balance);
          if (amount > 0) {
            newSettlements.push({
              from: debtor.name,
              to: creditor.name,
              amount,
              toUpiId: creditor.upiId,
            });
            remainingDebt -= amount;
            creditor.balance -= amount;
          }
        }
      });
    });

    setSettlements(newSettlements);
  };

  const handleAddExpense = () => {
    if (!selectedGroup || !user) return;
    if (!newExpense.name || !newExpense.amount || !newExpense.paidBy) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const updatedGroup = { ...selectedGroup };
    const paidByMember = updatedGroup.members.find(m => m.id === newExpense.paidBy);
    
    if (!paidByMember) return;

    if (newExpense.type === 'expense') {
      updatedGroup.totalExpense += amount;
      paidByMember.totalPaid += amount;
      
      const splitAmount = amount / newExpense.paidFor.length;
      newExpense.paidFor.forEach(memberId => {
        const member = updatedGroup.members.find(m => m.id === memberId);
        if (member) {
          member.totalExpense += splitAmount;
        }
      });
    } else {
      updatedGroup.totalCredits += amount;
      paidByMember.totalExpense += amount;
    }

    updatedGroup.balance = updatedGroup.totalCredits - updatedGroup.totalExpense;
    updateGroup(updatedGroup.id, updatedGroup);

    setIsExpenseModalVisible(false);
    setNewExpense({
      name: '',
      amount: '',
      category: expenseCategories[0],
      paidBy: '',
      paidFor: [],
      type: 'expense',
    });
  };

  const handlePayment = async (settlement: Settlement) => {
    const upiUrl = `upi://pay?pa=${settlement.toUpiId}&pn=${settlement.to}&am=${settlement.amount}&cu=INR`;
    const canOpen = await Linking.canOpenURL(upiUrl);
    
    if (canOpen) {
      await Linking.openURL(upiUrl);
    } else {
      Alert.alert('Error', 'No UPI app found on your device');
    }
  };

  const generateExcelSummary = async (group: Group) => {
    try {
      const data = group.members.map(member => ({
        Name: member.name,
        Email: member.email,
        'Total Expense': member.totalExpense,
        'Total Paid': member.totalPaid,
        Balance: member.totalPaid - member.totalExpense,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Group Summary');

      const wbout = XLSX.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
      });

      const fileName = FileSystem.documentDirectory + 'group_summary.xlsx';
      await FileSystem.writeAsStringAsync(fileName, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileName, {
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Group Expense Summary',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate summary');
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'upi' && selectedSettlement) {
      handlePayment(selectedSettlement);
    }
    setIsPaymentModalVisible(false);
  };

  const showPaymentOptions = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setIsPaymentModalVisible(true);
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? 'white' : 'black',
    },
    createButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 8,
    },
    createButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    groupCard: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    groupIcon: {
      fontSize: 24,
      marginBottom: 5,
    },
    groupName: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? 'white' : 'black',
      marginBottom: 5,
    },
    groupDescription: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#666',
      marginBottom: 10,
    },
    groupStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#333' : '#eee',
      paddingTop: 10,
      marginTop: 5,
    },
    statItem: {
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? '#888' : '#999',
      marginBottom: 2,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? 'white' : 'black',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: isDark ? '#888' : '#666',
      marginBottom: 15,
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Groups</Text>
          <Link href="/groups/create" asChild>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Group</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You haven't created or joined any groups yet
            </Text>
            <Link href="/groups/create" asChild>
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>Create Your First Group</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => router.push(`/groups/${group.id}`)}
            >
              <Text style={styles.groupIcon}>{group.icon}</Text>
              <Text style={styles.groupName}>{group.name}</Text>
              {group.description && (
                <Text style={styles.groupDescription} numberOfLines={2}>
                  {group.description}
                </Text>
              )}
              <View style={styles.groupStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Members</Text>
                  <Text style={styles.statValue}>{group.memberCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Expense</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(group.totalExpense)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Balance</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(group.balance)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
} 
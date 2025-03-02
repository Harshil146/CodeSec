import React, { useState, useEffect } from 'react';
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
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppContext } from '../../../../store/AppContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { supabase } from '../../../../lib/supabase';
import * as Checkbox from 'expo-checkbox';
import { GroupData, GroupMember, Expense, ExpenseShare, DBSettlement, Settlement, PaymentMethod } from '../../../../types/group';

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Bills',
  'Others',
];

export default function GroupDetails() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { user } = useAppContext();
  
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<DBSettlement[]>([]);
  const [calculatedSettlements, setCalculatedSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseModalVisible, setIsAddExpenseModalVisible] = useState(false);
  const [isSettlementModalVisible, setIsSettlementModalVisible] = useState(false);
  const [isManageGroupModalVisible, setIsManageGroupModalVisible] = useState(false);
  
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    paid_by: user?.id || '',
    shares: [] as {user_id: string, amount: number}[],
    selected_members: [] as string[],
    split_equally: true
  });

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
      color: isDark ? '#ffffff' : '#000000',
    },
    noDataText: {
      textAlign: 'center',
      fontSize: 16,
      color: isDark ? '#aaa' : '#666',
      marginVertical: 20,
  },
  groupInfo: {
    backgroundColor: isDark ? '#2a2a2a' : 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: isDark ? '#aaa' : '#666',
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: isDark ? '#888' : '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? 'white' : 'black',
  },
  section: {
    backgroundColor: isDark ? '#2a2a2a' : 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? 'white' : 'black',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  secondaryButton: {
    backgroundColor: isDark ? '#3a3a3a' : '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: isDark ? 'white' : 'black',
    fontWeight: '500',
    fontSize: 14,
  },
  expense: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? 'white' : 'black',
    marginBottom: 4,
  },
  expenseDetails: {
    fontSize: 14,
    color: isDark ? '#aaa' : '#666',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#4ADE80' : '#16A34A',
  },
  expenseAmountNegative: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F87171' : '#DC2626',
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
  },
  settlementInfo: {
    flex: 1,
  },
  settlementTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? 'white' : 'black',
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#4ADE80' : '#16A34A',
    marginLeft: 10,
  },
  settlementButtons: {
    flexDirection: 'row',
  },
  payButton: {
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  payButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#eee',
  },
  memberInfo: {
    flex: 1,
  },
  memberBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberPositiveBalance: {
    color: isDark ? '#4ADE80' : '#16A34A',
  },
  memberNegativeBalance: {
    color: isDark ? '#F87171' : '#DC2626',
  },
  memberNeutralBalance: {
    color: isDark ? '#aaa' : '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    borderRadius: 12,
    padding: 20,
      maxHeight: '80%',
  },
  modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
    marginBottom: 20,
      color: isDark ? '#ffffff' : '#000000',
  },
  formGroup: {
      marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
      color: isDark ? '#ffffff' : '#000000',
  },
  input: {
      backgroundColor: isDark ? '#333333' : '#f5f5f5',
      padding: 12,
    borderRadius: 8,
      color: isDark ? '#ffffff' : '#000000',
    },
    categoryContainer: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: isDark ? '#333333' : '#f5f5f5',
    },
    categoryButtonActive: {
      backgroundColor: '#2563EB',
    },
    categoryButtonText: {
      color: isDark ? '#ffffff' : '#000000',
    },
    categoryButtonTextActive: {
      color: '#ffffff',
    },
    memberContainer: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    memberButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: isDark ? '#333333' : '#f5f5f5',
    },
    memberButtonActive: {
      backgroundColor: '#2563EB',
    },
    memberButtonText: {
      color: isDark ? '#ffffff' : '#000000',
    },
    memberButtonTextActive: {
      color: '#ffffff',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    checkboxLabel: {
      marginLeft: 8,
      fontSize: 16,
      color: isDark ? '#ffffff' : '#000000',
    },
    memberList: {
      maxHeight: 150,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    memberName: {
      marginLeft: 8,
      fontSize: 16,
      color: isDark ? '#ffffff' : '#000000',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    cancelButton: {
      flex: 1,
    padding: 12,
      borderRadius: 8,
      backgroundColor: isDark ? '#333333' : '#f5f5f5',
      marginRight: 10,
  },
    saveButton: {
      flex: 1,
      padding: 12,
    borderRadius: 8,
      backgroundColor: '#2563EB',
  },
    cancelButtonText: {
      color: isDark ? '#ffffff' : '#000000',
    textAlign: 'center',
    fontSize: 16,
      fontWeight: '600',
    },
    saveButtonText: {
      color: '#ffffff',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
    },
    settleUpButton: {
      backgroundColor: '#2563EB',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    settleUpButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
    },
    settlementCard: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderRadius: 12,
      padding: 15,
      marginBottom: 12,
    },
    settlementHeader: {
    flexDirection: 'row',
      justifyContent: 'space-between',
    alignItems: 'center',
      marginBottom: 12,
    },
    settlementActions: {
      flexDirection: 'column',
      gap: 8,
      marginTop: 12,
    },
    settlementButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
    },
    upiButton: {
      backgroundColor: '#2563EB',
    },
    cashButton: {
      backgroundColor: '#16A34A',
    },
    settlementButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
    },
    noUpiText: {
      color: isDark ? '#aaa' : '#666',
      fontSize: 14,
      textAlign: 'center',
    marginBottom: 8,
  },
    noSettlementsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    analyticsCard: {
      backgroundColor: isDark ? '#333' : '#f8f9fa',
      borderRadius: 8,
      padding: 15,
    },
    analyticsTitle: {
    fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 15,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    categoryInfo: {
      width: 120,
    },
    categoryName: {
      fontSize: 14,
      color: isDark ? '#fff' : '#000',
    },
    categoryAmount: {
      fontSize: 12,
      color: isDark ? '#aaa' : '#666',
    },
    percentageBar: {
      flex: 1,
      height: 8,
      backgroundColor: isDark ? '#444' : '#e9ecef',
      borderRadius: 4,
      marginHorizontal: 10,
      overflow: 'hidden',
    },
    percentageFill: {
      height: '100%',
      backgroundColor: '#2563EB',
      borderRadius: 4,
    },
    percentageText: {
      width: 50,
      fontSize: 12,
      color: isDark ? '#aaa' : '#666',
      textAlign: 'right',
    },
    spenderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    spenderRank: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: isDark ? '#444' : '#e9ecef',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    rankText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    spenderInfo: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    spenderName: {
      fontSize: 14,
      color: isDark ? '#fff' : '#000',
    },
    spenderAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#4ADE80' : '#16A34A',
    },
    monthRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    monthName: {
      fontSize: 14,
      color: isDark ? '#fff' : '#000',
    },
    monthAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#4ADE80' : '#16A34A',
    },
    analyticsButton: {
      backgroundColor: isDark ? '#3a3a3a' : '#e5e5e5',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    analyticsButtonText: {
      color: isDark ? '#ffffff' : '#000000',
      fontWeight: '600',
      fontSize: 16,
    },
  });

  // Update useEffect to handle initial data loading
  useEffect(() => {
    if (id && typeof id === 'string') {
      const loadData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            fetchGroupDetails(),
            fetchGroupExpenses(),
            fetchSettlements()
          ]);
        } catch (error) {
          console.error('Error loading data:', error);
          Alert.alert('Error', 'Failed to load group data');
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      // First fetch the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(
            user_id,
            role
          ),
          group_expenses(
            amount
          )
        `)
        .eq('id', id)
        .single();

      if (groupError) throw groupError;
      
      if (group) {
        // Calculate total expense from group_expenses
        const totalExpense = group.group_expenses?.reduce((sum: number, expense: { amount: number }) => 
          sum + (expense.amount || 0), 0) || 0;
        
        // Then fetch the members separately with their profiles and calculate their balances
        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select(`
            user_id,
            role,
            profiles:user_id(
              id,
              name,
              email,
              upi_id
            )
          `)
          .eq('group_id', id);
          
        if (membersError) throw membersError;
        
        // Calculate member balances
        const balances = await calculateMemberBalances();
        
        // Combine the data with balances
        const membersWithBalances = members?.map(member => {
          const balance = balances.find(b => b.id === member.user_id);
            return {
              ...member,
            total_expense: balance ? balance.balance : 0,
            total_paid: balance ? balance.paid : 0,
            profiles: member.profiles || { name: 'Unknown', email: '', upi_id: '' }
            };
        }) || [];
          
          setGroupData({
            ...group,
          total_expense: totalExpense,
          members: membersWithBalances
        });
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      Alert.alert('Error', 'Failed to load group details');
    }
  };

  const fetchGroupExpenses = async () => {
    try {
      const { data: expensesData, error: expensesError } = await supabase
        .from('group_expenses')
        .select(`
          id,
          name,
          amount,
          category,
          type,
          paid_by,
          date,
          created_at,
          paid_by_user:profiles!paid_by(name, email),
          shares:expense_shares(
            id,
            user_id,
            amount,
            user:profiles!user_id(name, email)
          )
        `)
        .eq('group_id', id)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;
      // Cast to unknown first to avoid type mismatch
      setExpenses((expensesData as unknown) as Expense[] || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Error', 'Failed to fetch expenses');
    }
  };

  const fetchSettlements = async () => {
    try {
      // First fetch settlements
      const { data: dbSettlements, error } = await supabase
        .from('settlements')
        .select('*')
        .eq('group_id', id)
        .eq('status', 'pending');

      if (error) throw error;

      // Then fetch profiles for all users involved in settlements
      const userIds = dbSettlements?.reduce((ids: string[], settlement) => {
        if (!ids.includes(settlement.from_user_id)) ids.push(settlement.from_user_id);
        if (!ids.includes(settlement.to_user_id)) ids.push(settlement.to_user_id);
        return ids;
      }, []) || [];

      const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, upi_id')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
      // Create a map of profiles for easy lookup
      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]));

      // Combine settlements with profile data
      const settlementsWithProfiles = dbSettlements?.map(settlement => ({
          ...settlement,
        from_user: profileMap.get(settlement.from_user_id),
        to_user: profileMap.get(settlement.to_user_id)
      })) || [];

      setSettlements(settlementsWithProfiles);
    } catch (error) {
      console.error('Error fetching settlements:', error);
      Alert.alert('Error', 'Failed to fetch settlements');
    }
  };

  // Handle adding a new expense
  const handleAddExpense = async () => {
    if (!newExpense.name || !newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      Alert.alert('Error', 'Please provide a valid expense name and amount');
      return;
    }

    try {
      // Calculate shares
      let shares: {user_id: string, amount: number}[] = [];
      const amount = parseFloat(newExpense.amount);
      
      if (newExpense.split_equally && newExpense.selected_members.length > 0) {
        const shareAmount = amount / newExpense.selected_members.length;
        shares = newExpense.selected_members.map(userId => ({
          user_id: userId,
          amount: shareAmount
        }));
      } else if (!newExpense.split_equally) {
        shares = newExpense.shares;
      } else {
        // If no members selected, share with all group members
        const shareAmount = amount / (groupData?.members?.length || 1);
        shares = (groupData?.members || []).map(member => ({
          user_id: member.user_id,
          amount: shareAmount
        }));
      }

      // Create expense
      const { data: expenseData, error: expenseError } = await supabase
        .from('group_expenses')
        .insert({
          group_id: id,
          name: newExpense.name,
          amount,
          category: newExpense.category,
          paid_by: newExpense.paid_by,
          type: 'expense',
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create expense shares
      const shareInserts = shares.map(share => ({
        expense_id: expenseData.id,
        user_id: share.user_id,
        amount: share.amount
      }));

      const { error: sharesError } = await supabase
        .from('expense_shares')
        .insert(shareInserts);

      if (sharesError) throw sharesError;

      // Update member totals
      await Promise.all(shares.map(async (share) => {
        const { error } = await supabase
          .from('group_members')
          .update({
            total_expense: supabase.rpc('increment', { x: share.amount })
          })
          .eq('group_id', id)
          .eq('user_id', share.user_id);
          
        if (error) console.error('Error updating member expense:', error);
      }));

      // Update payer's total_paid
      const { error: payerError } = await supabase
        .from('group_members')
        .update({
          total_paid: supabase.rpc('increment', { x: amount })
        })
        .eq('group_id', id)
        .eq('user_id', newExpense.paid_by);
        
      if (payerError) console.error('Error updating payer total:', payerError);

      // Update group total
      const { error: groupError } = await supabase
        .from('groups')
        .update({
          total_expense: supabase.rpc('increment', { x: amount })
        })
        .eq('id', id);
        
      if (groupError) console.error('Error updating group total:', groupError);

      // Refresh data
      fetchGroupDetails();
      fetchGroupExpenses();
      fetchSettlements();
      resetExpenseForm();
      setIsAddExpenseModalVisible(false);
      
      Alert.alert('Success', 'Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  // Reset expense form
  const resetExpenseForm = () => {
    setNewExpense({
      name: '',
      amount: '',
      category: EXPENSE_CATEGORIES[0],
      paid_by: user?.id || '',
      shares: [],
      selected_members: [],
      split_equally: true
    });
  };

  // Handle payment via UPI
  const handleUpiPayment = (toUpiId: string | undefined, amount: number, toUserId: string) => {
    if (!toUpiId) {
      Alert.alert('Error', 'Recipient does not have a UPI ID');
      return;
    }

    // Create UPI URL
    const upiUrl = `upi://pay?pa=${toUpiId}&am=${amount}&cu=INR&tn=Group Payment`;
    
    // Open UPI app
    Linking.canOpenURL(upiUrl).then(supported => {
      if (supported) {
        Linking.openURL(upiUrl);
        // Ask user if payment was successful
        setTimeout(() => {
          Alert.alert(
            'Payment Status',
            'Was your payment successful?',
            [
              {
                text: 'No',
                style: 'cancel'
              },
              {
                text: 'Yes',
                onPress: () => handlePaymentComplete(toUserId, 'completed')
              }
            ]
          );
        }, 5000);
      } else {
        Alert.alert('Error', 'UPI payment not supported on this device');
      }
    });
  };

  // Handle cash payment
  const handleCashPayment = (toUserId: string) => {
    handlePaymentComplete(toUserId, 'completed');
  };

  // Complete payment and update settlement
  const handlePaymentComplete = async (toUserId: string, status: 'pending' | 'completed') => {
    try {
      if (!user) return;
      
      // Find the settlement to update
      const settlementToUpdate = settlements.find(
        s => s.from_user_id === user.id && s.to_user_id === toUserId && s.status === 'pending'
      );
      
      if (settlementToUpdate) {
        // Update settlement status
        const { error: updateError } = await supabase
          .from('settlements')
          .update({ 
            status,
            settled_at: status === 'completed' ? new Date().toISOString() : null
          })
          .eq('id', settlementToUpdate.id);
          
        if (updateError) throw updateError;

        // If payment is completed, update member balances
        if (status === 'completed') {
          // Update from_user balance
          const { error: fromUserError } = await supabase
            .from('group_members')
            .update({
              total_expense: supabase.rpc('increment', { x: settlementToUpdate.amount })
            })
            .eq('group_id', id)
            .eq('user_id', user.id);
            
          if (fromUserError) throw fromUserError;

          // Update to_user balance
          const { error: toUserError } = await supabase
            .from('group_members')
            .update({
              total_expense: supabase.rpc('increment', { x: -settlementToUpdate.amount })
            })
            .eq('group_id', id)
            .eq('user_id', toUserId);
            
          if (toUserError) throw toUserError;
      }
      
      // Refresh data
        await Promise.all([
          fetchGroupDetails(),
          fetchSettlements()
        ]);
      
      Alert.alert('Success', 'Payment recorded successfully');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  // Generate and share Excel export of transaction history
  const generateExcelSummary = async () => {
    try {
      // Prepare data for export
      const expenseData = expenses.map(expense => ({
        'Expense Name': expense.name,
        'Amount': expense.amount,
        'Category': expense.category,
        'Paid By': expense.paid_by_user?.name || 'Unknown',
        'Date': new Date(expense.date).toLocaleDateString(),
        'Type': expense.type
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(expenseData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

      // Convert to binary string
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // Create temporary file
      const fileName = `${groupData?.name || 'Group'}_Expenses_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Share file
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Share Expense Summary',
        UTI: 'com.microsoft.excel.xlsx'
      });
    } catch (error) {
      console.error('Error generating Excel summary:', error);
      Alert.alert('Error', 'Failed to generate Excel summary');
    }
  };

  // Update the Settle Up button click handler
  const handleSettleUp = async () => {
    setLoading(true);
    try {
      // Get the latest group data with members
      await fetchGroupDetails();
      
      // Get all expenses with their shares
      const { data: groupExpenses, error: expensesError } = await supabase
        .from('group_expenses')
        .select(`
          id,
          amount,
          paid_by,
          expense_shares (
            user_id,
            amount
          )
        `)
        .eq('group_id', id);
        
      if (expensesError) throw expensesError;
      
      // Verify user IDs exist in users table before creating settlements
      const memberIds = groupData?.members?.map(m => m.user_id) || [];
      const { data: validUsers, error: userError } = await supabase
        .from('users')
        .select('id')
        .in('id', memberIds);
        
      if (userError) throw userError;
      
      // Create a set of valid user IDs for fast lookup
      const validUserIds = new Set(validUsers?.map(user => user.id) || []);
      
      // Delete previous pending settlements
      await supabase
        .from('settlements')
        .delete()
        .eq('group_id', id)
        .eq('status', 'pending');
      
      // Calculate who owes whom
      const newSettlements = [];
      
      // Get members who owe money (negative balance)
      const debtors = groupData?.members
        ?.filter(m => validUserIds.has(m.user_id) && (m.total_paid - m.total_expense) < 0)
        .sort((a, b) => (a.total_paid - a.total_expense) - (b.total_paid - b.total_expense));
      
      // Get members who are owed money (positive balance)
      const creditors = groupData?.members
        ?.filter(m => validUserIds.has(m.user_id) && (m.total_paid - m.total_expense) > 0)
        .sort((a, b) => (b.total_paid - b.total_expense) - (a.total_paid - a.total_expense));
      
      if (!debtors?.length || !creditors?.length) {
        Alert.alert('No Settlements Needed', 'All balances are already settled!');
        setLoading(false);
        return;
      }
      
      // Match debtors with creditors
      let i = 0, j = 0;
      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        
        const debtorBalance = debtor.total_paid - debtor.total_expense;
        const creditorBalance = creditor.total_paid - creditor.total_expense;
        
        const amount = Math.min(Math.abs(debtorBalance), creditorBalance);
        
        if (amount > 0) {
          // Create settlement record
          const { data: settlement, error } = await supabase
            .from('settlements')
            .insert({
              group_id: id,
              from_user_id: debtor.user_id,
              to_user_id: creditor.user_id,
              amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
              status: 'pending',
              created_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (error) throw error;
          
          // Add to settlements list for display
          newSettlements.push({
            id: settlement.id,
            from: debtor.user_id,
            to: creditor.user_id,
            fromName: debtor.profiles?.name || 'Unknown',
            toName: creditor.profiles?.name || 'Unknown',
            amount: Math.round(amount * 100) / 100,
            toUpiId: creditor.profiles?.upi_id || ''
          });
          
          // Update balances virtually for next iteration
          debtor.total_expense -= amount;
          creditor.total_expense += amount;
        }
        
        // Move to next member if balance is close to settled
        if (Math.abs(debtor.total_paid - debtor.total_expense) < 0.01) i++;
        if (Math.abs(creditor.total_paid - creditor.total_expense) < 0.01) j++;
      }
      
      if (newSettlements.length === 0) {
        Alert.alert('No Settlements Needed', 'All balances are already settled!');
      } else {
        setCalculatedSettlements(newSettlements);
        setIsSettlementModalVisible(true);
      }
      
      // Refresh data
      await fetchSettlements();
      
    } catch (error) {
      console.error('Error calculating settlements:', error);
      Alert.alert('Error', 'Failed to calculate settlements');
    } finally {
      setLoading(false);
    }
  };

  // Calculate member balances with proper types
  const calculateMemberBalances = async () => {
    if (!groupData?.members) return [];
    
    try {
      // Fetch all group expenses with their shares
      const { data: expenses, error: expensesError } = await supabase
        .from('group_expenses')
        .select(`
          id,
          amount,
          paid_by,
          expense_shares (
            user_id,
            amount
          )
        `)
        .eq('group_id', id);
        
      if (expensesError) throw expensesError;

      // Fetch completed settlements
      const { data: completedSettlements, error: settlementsError } = await supabase
        .from('settlements')
        .select('*')
        .eq('group_id', id)
        .eq('status', 'completed');
      
      if (settlementsError) throw settlementsError;

      // Initialize balances for all members
      const balances = new Map(
        groupData.members.map(member => [
          member.user_id,
          {
            id: member.user_id,
            name: member.profiles.name || member.profiles.email,
            email: member.profiles.email,
            upi_id: member.profiles.upi_id,
            paid: 0,
            owes: 0,
            balance: 0
          }
        ])
      );

      // Calculate balances from expenses
      expenses?.forEach(expense => {
        // Add amount to payer's paid total
        const payer = balances.get(expense.paid_by);
        if (payer) {
          payer.paid += expense.amount;
        }

        // Add shares to each member's owed total
        expense.expense_shares?.forEach((share) => {
          const member = balances.get(share.user_id);
          if (member) {
            member.owes += share.amount;
          }
        });
      });

      // Adjust for completed settlements
      completedSettlements?.forEach(settlement => {
        const fromUser = balances.get(settlement.from_user_id);
        const toUser = balances.get(settlement.to_user_id);
        
        if (fromUser && toUser) {
          // When a settlement is completed, it's as if the debtor paid more (reducing their debt)
          // and the creditor received what they were owed
          fromUser.paid += settlement.amount;
          toUser.owes += settlement.amount;
        }
      });

      // Calculate final balance for each member
      balances.forEach(member => {
        member.balance = member.paid - member.owes;
      });

      return Array.from(balances.values());
    } catch (error) {
      console.error('Error calculating balances:', error);
      Alert.alert('Error', 'Failed to calculate balances');
      return [];
    }
  };

  // Add new function for deleting group
  const handleDeleteGroup = async () => {
    try {
      Alert.alert(
        'Delete Group',
        'Are you sure you want to delete this group? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              // Delete all related data
              await Promise.all([
                supabase.from('expense_shares').delete().eq('expense_id', supabase.from('group_expenses').select('id').eq('group_id', id)),
                supabase.from('group_expenses').delete().eq('group_id', id),
                supabase.from('settlements').delete().eq('group_id', id),
                supabase.from('group_members').delete().eq('group_id', id),
                supabase.from('groups').delete().eq('id', id),
              ]);
              
              router.replace('/groups');
              Alert.alert('Success', 'Group deleted successfully');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting group:', error);
      Alert.alert('Error', 'Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  // Add new function for removing member
  const handleRemoveMember = async (memberId: string) => {
    try {
      // Check if member has any pending settlements
      const { data: pendingSettlements } = await supabase
        .from('settlements')
        .select('*')
        .eq('status', 'pending')
        .or(`from_user_id.eq.${memberId},to_user_id.eq.${memberId}`);

      if (pendingSettlements && pendingSettlements.length > 0) {
        Alert.alert('Error', 'Cannot remove member with pending settlements');
        return;
      }

      Alert.alert(
        'Remove Member',
        'Are you sure you want to remove this member?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              await supabase
                .from('group_members')
                .delete()
                .eq('group_id', id)
                .eq('user_id', memberId);

              fetchGroupDetails();
              Alert.alert('Success', 'Member removed successfully');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error removing member:', error);
      Alert.alert('Error', 'Failed to remove member');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ color: isDark ? 'white' : 'black', marginTop: 10 }}>Loading group details...</Text>
        </View>
      ) : !groupData ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: isDark ? 'white' : 'black' }}>Group not found</Text>
        </View>
      ) : (
        <>
        {/* Group Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{groupData.name}</Text>
        </View>

        {/* Group Info */}
        <View style={styles.groupInfo}>
          {groupData.description && (
            <Text style={styles.description}>{groupData.description}</Text>
          )}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Expense</Text>
              <Text style={styles.statValue}>₹{groupData.total_expense || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Members</Text>
              <Text style={styles.statValue}>{groupData.members?.length || 0}</Text>
            </View>
          </View>
            <TouchableOpacity
              style={[styles.settleUpButton, { marginTop: 15 }]}
              onPress={handleSettleUp}
            >
              <Text style={styles.settleUpButtonText}>Settle Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.analyticsButton, { marginTop: 10 }]}
              onPress={() => router.push(`/groups/${id}/analytics`)}
            >
              <Text style={styles.analyticsButtonText}>View Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.analyticsButton, { marginTop: 10, backgroundColor: isDark ? '#444' : '#ddd' }]}
              onPress={() => setIsManageGroupModalVisible(true)}
            >
              <Text style={styles.analyticsButtonText}>Manage Group</Text>
            </TouchableOpacity>
        </View>

        {/* Transaction History Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <TouchableOpacity onPress={generateExcelSummary} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Export to Excel</Text>
            </TouchableOpacity>
          </View>
          
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <View key={expense.id} style={styles.expense}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseName}>{expense.name}</Text>
                  <Text style={styles.expenseDetails}>
                    {expense.category} • Paid by {expense.paid_by_user?.name || 'Unknown'} • 
                    {new Date(expense.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={
                    expense.type === 'expense'
                      ? styles.expenseAmountNegative
                      : styles.expenseAmount
                  }
                >
                  {expense.type === 'expense' ? '-' : '+'}₹{expense.amount}
                </Text>
              </View>
            ))
          ) : (
              <Text style={styles.noDataText}>No transactions yet</Text>
          )}
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsAddExpenseModalVisible(true)}
          >
            <Text style={styles.buttonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Settlements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settlement Summary</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" />
          ) : settlements.length > 0 ? (
            settlements.map((settlement) => (
              <View key={settlement.id} style={styles.settlementCard}>
                <View style={styles.settlementHeader}>
                  <View>
                    <Text style={styles.settlementTitle}>
                      {settlement.from_user?.name || 'User'} needs to pay {settlement.to_user?.name || 'User'}:
                    </Text>
                    <Text style={styles.settlementAmount}>₹{settlement.amount.toFixed(2)}</Text>
                  </View>
                </View>
                
                {user && settlement.from_user_id === user.id && (
                  <View style={styles.settlementActions}>
                    {settlement.to_user?.upi_id ? (
                      <TouchableOpacity
                        style={[styles.settlementButton, styles.upiButton]}
                        onPress={() => handleUpiPayment(settlement.to_user.upi_id, settlement.amount, settlement.to_user_id)}
                      >
                        <Ionicons name="phone-portrait-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.settlementButtonText}>Pay via UPI</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.noUpiText}>UPI ID not available</Text>
                    )}
                    
                    <TouchableOpacity
                      style={[styles.settlementButton, styles.cashButton]}
                      onPress={() => handleCashPayment(settlement.to_user_id)}
                    >
                      <Ionicons name="cash-outline" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.settlementButtonText}>Mark as Paid (Cash)</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.noSettlementsContainer}>
              <Text style={styles.noDataText}>No pending settlements found</Text>
              <TouchableOpacity 
                style={[styles.button, { marginTop: 15 }]}
                onPress={handleSettleUp}
              >
                <Text style={styles.buttonText}>Calculate Settlements</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Members List Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          
            {groupData?.members?.map((member) => (
              <View key={member.user_id} style={styles.memberItem}>
              <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.profiles?.name || member.profiles?.email}</Text>
                  <Text style={styles.expenseDetails}>{member.profiles?.email}</Text>
              </View>
                <View>
                  <Text style={[
                  styles.memberBalance,
                    member.total_paid > member.total_expense
                    ? styles.memberPositiveBalance
                      : member.total_paid < member.total_expense
                    ? styles.memberNegativeBalance
                      : styles.memberNeutralBalance
                  ]}>
                    {member.total_paid > member.total_expense ? '+' : ''}
                    ₹{(member.total_paid - member.total_expense).toFixed(2)}
                  </Text>
                  <Text style={styles.expenseDetails}>
                    Paid: ₹{member.total_paid.toFixed(2)}
              </Text>
                </View>
            </View>
          ))}
        </View>
        </>
      )}

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddExpenseModalVisible}
        onRequestClose={() => setIsAddExpenseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Expense Name</Text>
              <TextInput
                style={styles.input}
                value={newExpense.name}
                onChangeText={(text) => setNewExpense({ ...newExpense, name: text })}
                placeholder="e.g. Dinner"
                placeholderTextColor={isDark ? '#777' : '#aaa'}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                placeholder="0.00"
                placeholderTextColor={isDark ? '#777' : '#aaa'}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                {EXPENSE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      newExpense.category === category && styles.categoryButtonActive
                    ]}
                    onPress={() => setNewExpense({ ...newExpense, category })}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      newExpense.category === category && styles.categoryButtonTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Paid By</Text>
              {groupData?.members && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberContainer}>
                {groupData.members.map((member) => (
                  <TouchableOpacity
                    key={member.user_id}
                      style={[
                        styles.memberButton,
                        newExpense.paid_by === member.user_id && styles.memberButtonActive
                      ]}
                    onPress={() => setNewExpense({ ...newExpense, paid_by: member.user_id })}
                  >
                      <Text style={[
                        styles.memberButtonText,
                        newExpense.paid_by === member.user_id && styles.memberButtonTextActive
                      ]}>
                        {member.profiles?.name || member.profiles?.email}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Split Among</Text>
              <View style={styles.checkboxContainer}>
                <Checkbox.Checkbox
                  value={newExpense.split_equally}
                  onValueChange={(value) => setNewExpense({ ...newExpense, split_equally: value })}
                  color={newExpense.split_equally ? '#2563EB' : undefined}
                />
                <Text style={styles.checkboxLabel}>Split equally</Text>
              </View>
              
              {groupData?.members && (
                <ScrollView style={styles.memberList}>
                {groupData.members.map((member) => (
                    <View key={member.user_id} style={styles.memberRow}>
                    <Checkbox.Checkbox
                      value={newExpense.selected_members.includes(member.user_id)}
                        onValueChange={(value) => {
                          const updated = value
                            ? [...newExpense.selected_members, member.user_id]
                            : newExpense.selected_members.filter(id => id !== member.user_id);
                        setNewExpense({ ...newExpense, selected_members: updated });
                      }}
                      color={newExpense.selected_members.includes(member.user_id) ? '#2563EB' : undefined}
                    />
                      <Text style={styles.memberName}>{member.profiles?.name || member.profiles?.email}</Text>
                  </View>
                ))}
              </ScrollView>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsAddExpenseModalVisible(false);
                  resetExpenseForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddExpense}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settlements Modal */}
      <Modal
        visible={isSettlementModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsSettlementModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Who Needs to Pay</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <ScrollView style={{ maxHeight: '80%' }}>
                {calculatedSettlements.length > 0 ? (
                  calculatedSettlements.map((settlement, index) => (
                    <View key={index} style={styles.settlementCard}>
                      <View style={styles.settlementHeader}>
                        <View>
                          <Text style={styles.settlementTitle}>
                            {settlement.fromName} owes {settlement.toName}:
                          </Text>
                          <Text style={styles.settlementAmount}>₹{settlement.amount.toFixed(2)}</Text>
                        </View>
                      </View>
                      
                      {user && settlement.from === user.id && (
                        <View style={styles.settlementActions}>
                          {settlement.toUpiId ? (
                            <TouchableOpacity
                              style={[styles.settlementButton, styles.upiButton]}
                              onPress={() => handleUpiPayment(settlement.toUpiId, settlement.amount, settlement.to)}
                            >
                              <Ionicons name="phone-portrait-outline" size={20} color="white" style={{ marginRight: 8 }} />
                              <Text style={styles.settlementButtonText}>Pay via UPI</Text>
                            </TouchableOpacity>
                          ) : (
                            <Text style={styles.noUpiText}>UPI ID not available</Text>
                          )}
                          
                          <TouchableOpacity
                            style={[styles.settlementButton, styles.cashButton]}
                            onPress={() => handleCashPayment(settlement.to)}
                          >
                            <Ionicons name="cash-outline" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.settlementButtonText}>Mark as Paid (Cash)</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>All balances are settled!</Text>
                )}
              </ScrollView>
            )}
            
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => setIsSettlementModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add new Manage Group Modal */}
      <Modal
        visible={isManageGroupModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsManageGroupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Group</Text>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#F87171' : '#DC2626' }]}>Danger Zone</Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: isDark ? '#F87171' : '#DC2626', marginTop: 10 }]}
                onPress={handleDeleteGroup}
              >
                <Text style={styles.buttonText}>Delete Group</Text>
              </TouchableOpacity>
            </View>

            {groupData && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Members</Text>
                {groupData.members?.map((member) => (
                  <View key={member.user_id} style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.profiles?.name || member.profiles?.email}</Text>
                      <Text style={styles.expenseDetails}>{member.profiles?.email}</Text>
                    </View>
                    {member.user_id !== user?.id && (
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: isDark ? '#F87171' : '#DC2626', padding: 8 }]}
                        onPress={() => handleRemoveMember(member.user_id)}
                      >
                        <Text style={styles.buttonText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => setIsManageGroupModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
} 
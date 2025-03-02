import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  useColorScheme,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Member = {
  id: string;
  name: string;
  avatar: string | null;
  totalContribution: number;
};

type GroupExpense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  splitBetween: string[];
};

export default function GroupFinance() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [members] = useState<Member[]>([
    {
      id: '1',
      name: 'John Doe',
      avatar: null,
      totalContribution: 150.00,
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: null,
      totalContribution: 200.00,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      avatar: null,
      totalContribution: 100.00,
    },
  ]);

  const [expenses] = useState<GroupExpense[]>([
    {
      id: '1',
      description: 'Dinner',
      amount: 150.00,
      paidBy: '1',
      date: '2024-02-28',
      splitBetween: ['1', '2', '3'],
    },
    {
      id: '2',
      description: 'Movie tickets',
      amount: 60.00,
      paidBy: '2',
      date: '2024-02-27',
      splitBetween: ['1', '2'],
    },
  ]);

  const [isAddExpenseModalVisible, setIsAddExpenseModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'expenses' | 'settle'>('expenses');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    },
    header: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#eee',
    },
    tabs: {
      flexDirection: 'row',
      padding: 10,
    },
    tab: {
      flex: 1,
      padding: 15,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: isDark ? '#333' : '#e5e5e5',
    },
    tabText: {
      fontSize: 16,
      color: isDark ? '#aaa' : '#666',
    },
    activeTabText: {
      color: isDark ? 'white' : 'black',
      fontWeight: '600',
    },
    memberList: {
      padding: 20,
    },
    memberCard: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? '#333' : '#eee',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: 16,
      color: isDark ? 'white' : 'black',
      marginBottom: 5,
    },
    memberContribution: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#666',
    },
    addButton: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      margin: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    expenseList: {
      padding: 20,
    },
    expense: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    expenseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    expenseDescription: {
      fontSize: 16,
      color: isDark ? 'white' : 'black',
    },
    expenseAmount: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#00C851' : '#00994D',
    },
    expenseMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    expensePaidBy: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#666',
    },
    expenseDate: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#666',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      borderRadius: 12,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? 'white' : 'black',
      marginBottom: 20,
    },
    input: {
      backgroundColor: isDark ? '#333' : '#f5f5f5',
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      color: isDark ? 'white' : 'black',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: isDark ? '#444' : '#eee',
    },
    saveButton: {
      backgroundColor: '#007AFF',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: isDark ? 'white' : 'black',
    },
    saveButtonText: {
      color: 'white',
    },
    settleUpContainer: {
      padding: 20,
    },
    settlementCard: {
      backgroundColor: isDark ? '#2a2a2a' : 'white',
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    settlementText: {
      fontSize: 16,
      color: isDark ? 'white' : 'black',
      marginBottom: 5,
    },
    settlementAmount: {
      fontSize: 16,
      fontWeight: '500',
      color: '#007AFF',
    },
  });

  const renderExpenseTab = () => (
    <>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddExpenseModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Group Expense</Text>
      </TouchableOpacity>

      <ScrollView style={styles.expenseList}>
        {expenses.map(expense => (
          <View key={expense.id} style={styles.expense}>
            <View style={styles.expenseHeader}>
              <Text style={styles.expenseDescription}>{expense.description}</Text>
              <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.expenseMeta}>
              <Text style={styles.expensePaidBy}>
                Paid by {members.find(m => m.id === expense.paidBy)?.name}
              </Text>
              <Text style={styles.expenseDate}>{expense.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );

  const renderSettleTab = () => (
    <ScrollView style={styles.settleUpContainer}>
      {members.map(member => (
        <View key={member.id} style={styles.settlementCard}>
          <Text style={styles.settlementText}>
            {member.name} needs to pay:
          </Text>
          <Text style={styles.settlementAmount}>
            ${Math.abs(
              member.totalContribution -
                expenses.reduce(
                  (sum, expense) =>
                    sum +
                    (expense.splitBetween.includes(member.id)
                      ? expense.amount / expense.splitBetween.length
                      : 0),
                  0
                )
            ).toFixed(2)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScrollView horizontal style={styles.memberList}>
          {members.map(member => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.avatar}>
                {member.avatar ? (
                  <Image
                    source={{ uri: member.avatar }}
                    style={{ width: 50, height: 50, borderRadius: 25 }}
                  />
                ) : (
                  <Ionicons name="person" size={30} color={isDark ? '#666' : '#999'} />
                )}
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberContribution}>
                  ${member.totalContribution.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'expenses' && styles.activeTab]}
            onPress={() => setSelectedTab('expenses')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'expenses' && styles.activeTabText,
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'settle' && styles.activeTab]}
            onPress={() => setSelectedTab('settle')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'settle' && styles.activeTabText,
              ]}
            >
              Settle Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedTab === 'expenses' ? renderExpenseTab() : renderSettleTab()}

      <Modal
        visible={isAddExpenseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddExpenseModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Group Expense</Text>

            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />

            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={isDark ? '#666' : '#999'}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddExpenseModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setIsAddExpenseModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 
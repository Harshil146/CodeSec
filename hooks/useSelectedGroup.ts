import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Group, GroupMember, GroupExpense } from '../lib/supabase';

export function useSelectedGroup(groupId?: string) {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch group details
  const fetchGroupDetails = async () => {
    if (!groupId || !user) return;

    try {
      setLoading(true);

      // Fetch group data
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Fetch group members with their profiles
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles:users (
            id,
            username,
            email,
            upi_id
          )
        `)
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // Fetch group expenses with payer details
      const { data: expensesData, error: expensesError } = await supabase
        .from('group_expenses')
        .select(`
          *,
          paid_by_user:users (
            id,
            username,
            email
          ),
          shares:expense_shares (
            id,
            user_id,
            amount,
            user:users (
              id,
              username,
              email
            )
          )
        `)
        .eq('group_id', groupId)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      setGroup(groupData);
      setMembers(membersData || []);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add expense
  const addExpense = async (expenseData: Partial<GroupExpense>) => {
    try {
      const { data: expense, error: expenseError } = await supabase
        .from('group_expenses')
        .insert([{
          ...expenseData,
          group_id: groupId,
          paid_by: user?.id
        }])
        .select(`
          *,
          paid_by_user:users (
            id,
            username,
            email
          )
        `)
        .single();

      if (expenseError) throw expenseError;

      // Add expense shares
      if (expense && expenseData.shares) {
        const { error: sharesError } = await supabase
          .from('expense_shares')
          .insert(
            expenseData.shares.map(share => ({
              expense_id: expense.id,
              ...share
            }))
          );

        if (sharesError) throw sharesError;
      }

      // Refresh group details
      await fetchGroupDetails();
      return expense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  // Delete expense
  const deleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('group_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      await fetchGroupDetails();
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  // Calculate member balances
  const calculateBalances = () => {
    const balances: { [key: string]: number } = {};

    // Initialize balances for all members
    members.forEach(member => {
      balances[member.user_id] = 0;
    });

    // Calculate based on expenses and shares
    expenses.forEach(expense => {
      // Add amount to payer's balance
      balances[expense.paid_by] = (balances[expense.paid_by] || 0) + expense.amount;

      // Subtract shares from each member's balance
      expense.shares.forEach(share => {
        balances[share.user_id] = (balances[share.user_id] || 0) - share.amount;
      });
    });

    return balances;
  };

  // Fetch group details when groupId changes
  useEffect(() => {
    fetchGroupDetails();
  }, [groupId, user]);

  return {
    group,
    members,
    expenses,
    loading,
    addExpense,
    deleteExpense,
    calculateBalances,
    refreshGroup: fetchGroupDetails,
  };
} 
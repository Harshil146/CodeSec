import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Transaction } from '../lib/supabase';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          ...transaction,
          user_id: user.id,
          date: transaction.date || new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    setTransactions(prev => [data, ...prev]);
    return data;
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    setTransactions(prev => prev.map(t => t.id === id ? data : t));
    return data;
  }, [user]);

  const getTransactionStats = useCallback(() => {
    const stats = {
      totalExpenses: 0,
      totalCredits: 0,
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        stats.totalExpenses += transaction.amount;
      } else {
        stats.totalCredits += transaction.amount;
      }
    });

    return stats;
  }, [transactions]);

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getTransactionStats,
    refreshTransactions,
  };
} 
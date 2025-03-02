import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create a custom storage implementation that works in both environments
const customStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof window === 'undefined') {
        // Node.js environment
        return null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') {
        // Node.js environment
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') {
        // Node.js environment
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type definitions
export type User = {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  upi_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  type: 'expense' | 'credit';
  category?: string;
  date: string;
  created_at: string;
  updated_at?: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_by: string;
  total_expense: number;
  total_credits: number;
  balance: number;
  member_count: number;
  created_at: string;
  updated_at?: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
};

export type GroupExpense = {
  id: string;
  group_id: string;
  name: string;
  amount: number;
  paid_by: string;
  category?: string;
  date: string;
  created_at: string;
  updated_at?: string;
};

export type ExpenseShare = {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
  updated_at?: string;
};

export type Settlement = {
  id: string;
  group_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at?: string;
}; 
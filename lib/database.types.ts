export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          name: string | null
          upi_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          name?: string | null
          upi_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          name?: string | null
          upi_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          type: 'expense' | 'credit'
          category: string | null
          date: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          type: 'expense' | 'credit'
          category?: string | null
          date?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          type?: 'expense' | 'credit'
          category?: string | null
          date?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_by: string
          total_expense: number
          total_credits: number
          balance: number
          member_count: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          created_by: string
          total_expense?: number
          total_credits?: number
          balance?: number
          member_count?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_by?: string
          total_expense?: number
          total_credits?: number
          balance?: number
          member_count?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          created_at?: string
        }
      }
      group_expenses: {
        Row: {
          id: string
          group_id: string
          name: string
          amount: number
          paid_by: string
          category: string | null
          date: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          amount: number
          paid_by: string
          category?: string | null
          date?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          name?: string
          amount?: number
          paid_by?: string
          category?: string | null
          date?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      expense_shares: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          amount: number
          status: 'pending' | 'paid'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          expense_id: string
          user_id: string
          amount: number
          status?: 'pending' | 'paid'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          expense_id?: string
          user_id?: string
          amount?: number
          status?: 'pending' | 'paid'
          created_at?: string
          updated_at?: string | null
        }
      }
      settlements: {
        Row: {
          id: string
          group_id: string
          from_user: string
          to_user: string
          amount: number
          status: 'pending' | 'completed'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          group_id: string
          from_user: string
          to_user: string
          amount: number
          status?: 'pending' | 'completed'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          from_user?: string
          to_user?: string
          amount?: number
          status?: 'pending' | 'completed'
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
export interface GroupData {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  members: GroupMember[];
  total_expense: number;
}

export interface GroupMember {
  user_id: string;
  role: string;
  total_expense: number;
  total_paid: number;
  profiles: {
    id: string;
    name: string;
    email: string;
    upi_id: string;
  };
}

export interface ExpenseShare {
  id: string;
  user_id: string;
  amount: number;
  user: {
    name: string;
    email: string;
  };
}

export interface DBSettlement {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  status: string;
  from_user: {
    name: string;
    email: string;
    upi_id?: string;
  };
  to_user: {
    name: string;
    email: string;
    upi_id?: string;
  };
}

export interface Settlement {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  amount: number;
  toUpiId: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'expense' | 'credit';
  paid_by: string;
  date: string;
  created_at: string;
  paid_by_user: {
    name: string;
    email: string;
  };
  shares: ExpenseShare[];
}

export type PaymentMethod = 'upi' | 'cash'; 
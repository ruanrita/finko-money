/**
 * Database table types
 * Generated from Supabase migrations
 */

// Enum types
export type TransactionType = 'income' | 'expense';
export type RecurrenceType = 'monthly' | 'weekly' | 'yearly';
export type GoalType = 'emergency_fund' | 'savings' | 'debt_payoff' | 'purchase';
export type GoalPriority = 'critical' | 'high' | 'medium' | 'low';
export type BranchRole = 'owner' | 'member';

// User table
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Branch table
export interface Branch {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Branch member table
export interface BranchMember {
  id: string;
  branch_id: string;
  user_id: string;
  role: BranchRole;
  joined_at: string;
  invited_by: string | null;
}

// Category table
export interface Category {
  id: string;
  user_id: string;
  branch_id: string | null;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

// Transaction table
export interface Transaction {
  id: string;
  user_id: string;
  branch_id: string | null;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  due_date: string;
  paid_at: string | null;
  is_recurring: boolean;
  recurrence_type: RecurrenceType | null;
  parent_transaction_id: string | null;
  tags: string[];
  payment_method: string | null;
  installment_number: number | null;
  total_installments: number | null;
  installment_type: 'a_vista' | 'parcelado';
  created_at: string;
  updated_at: string;
}

// Goal table
export interface Goal {
  id: string;
  user_id: string;
  branch_id: string;
  name: string;
  description: string | null;
  icon: string;
  goal_type: GoalType;
  priority: GoalPriority;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  achieved_at: string | null;
  is_active: boolean;
  auto_contribute: boolean;
  monthly_target: number | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

// Goal contribution table
export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  description: string | null;
  contributed_at: string;
  created_at: string;
}

// Budget table
export interface Budget {
  id: string;
  user_id: string;
  branch_id: string | null;
  category_id: string | null;
  amount: number;
  month: string;
  created_at: string;
  updated_at: string;
}

// Reminder table
export interface Reminder {
  id: string;
  user_id: string;
  transaction_id: string;
  days_before: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

// Joined types (with relations)
export interface BranchWithMembers extends Branch {
  branch_members: BranchMember[];
}

export interface TransactionWithCategory extends Transaction {
  categories: Category | null;
}

export interface GoalWithContributions extends Goal {
  goal_contributions: GoalContribution[];
}

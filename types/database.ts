export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          branch_id: string | null;
          name: string;
          color: string;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          branch_id?: string | null;
          name: string;
          color: string;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          branch_id?: string | null;
          name?: string;
          color?: string;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          branch_id: string | null;
          category_id: string | null;
          type: "income" | "expense";
          amount: number;
          description: string;
          due_date: string;
          paid_at: string | null;
          is_recurring: boolean;
          recurrence_type: "monthly" | "weekly" | "yearly" | null;
          parent_transaction_id: string | null;
          tags: string[] | null;
          payment_method: string | null;
          installment_type: "a_vista" | "parcelado";
          installments_count: number | null;
          current_installment: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          branch_id?: string | null;
          category_id?: string | null;
          type: "income" | "expense";
          amount: number;
          description: string;
          due_date: string;
          paid_at?: string | null;
          is_recurring?: boolean;
          recurrence_type?: "monthly" | "weekly" | "yearly" | null;
          parent_transaction_id?: string | null;
          tags?: string[] | null;
          payment_method?: string | null;
          installment_type?: "a_vista" | "parcelado";
          installments_count?: number | null;
          current_installment?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          branch_id?: string | null;
          category_id?: string | null;
          type?: "income" | "expense";
          amount?: number;
          description?: string;
          due_date?: string;
          paid_at?: string | null;
          is_recurring?: boolean;
          recurrence_type?: "monthly" | "weekly" | "yearly" | null;
          parent_transaction_id?: string | null;
          tags?: string[] | null;
          payment_method?: string | null;
          installment_type?: "a_vista" | "parcelado";
          installments_count?: number | null;
          current_installment?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      branches: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      branch_members: {
        Row: {
          id: string;
          branch_id: string;
          user_id: string;
          role: "owner" | "member";
          joined_at: string;
          invited_by: string | null;
        };
        Insert: {
          id?: string;
          branch_id: string;
          user_id: string;
          role: "owner" | "member";
          joined_at?: string;
          invited_by?: string | null;
        };
        Update: {
          id?: string;
          branch_id?: string;
          user_id?: string;
          role?: "owner" | "member";
          joined_at?: string;
          invited_by?: string | null;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          branch_id: string;
          name: string;
          description: string | null;
          icon: string;
          goal_type: "emergency_fund" | "savings" | "debt_payoff" | "purchase";
          priority: "critical" | "high" | "medium" | "low";
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
        };
        Insert: {
          id?: string;
          user_id: string;
          branch_id: string;
          name: string;
          description?: string | null;
          icon?: string;
          goal_type?: "emergency_fund" | "savings" | "debt_payoff" | "purchase";
          priority?: "critical" | "high" | "medium" | "low";
          target_amount: number;
          current_amount?: number;
          target_date?: string | null;
          achieved_at?: string | null;
          is_active?: boolean;
          auto_contribute?: boolean;
          monthly_target?: number | null;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          branch_id?: string;
          name?: string;
          description?: string | null;
          icon?: string;
          goal_type?: "emergency_fund" | "savings" | "debt_payoff" | "purchase";
          priority?: "critical" | "high" | "medium" | "low";
          target_amount?: number;
          current_amount?: number;
          target_date?: string | null;
          achieved_at?: string | null;
          is_active?: boolean;
          auto_contribute?: boolean;
          monthly_target?: number | null;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      goal_contributions: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          amount: number;
          description: string | null;
          contributed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          amount: number;
          description?: string | null;
          contributed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          amount?: number;
          description?: string | null;
          contributed_at?: string;
          created_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          branch_id: string | null;
          category_id: string | null;
          amount: number;
          month: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          branch_id?: string | null;
          category_id?: string | null;
          amount: number;
          month: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          branch_id?: string | null;
          category_id?: string | null;
          amount?: number;
          month?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          transaction_id: string;
          days_before: number;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_id: string;
          days_before: number;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_id?: string;
          days_before?: number;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_branch_with_owner: {
        Args: {
          p_name: string;
          p_description?: string;
        };
        Returns: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Enums: {
      transaction_type: "income" | "expense";
      recurrence_type: "monthly" | "weekly" | "yearly";
      installment_type: "a_vista" | "parcelado";
      goal_type: "emergency_fund" | "savings" | "debt_payoff" | "purchase";
      goal_priority: "critical" | "high" | "medium" | "low";
      branch_role: "owner" | "member";
    };
  };
}

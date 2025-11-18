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
          name: string;
          color: string;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
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
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          amount: number;
          month: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          amount: number;
          month: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
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
      [_ in never]: never;
    };
    Enums: {
      transaction_type: "income" | "expense";
      recurrence_type: "monthly" | "weekly" | "yearly";
      installment_type: "a_vista" | "parcelado";
    };
  };
}

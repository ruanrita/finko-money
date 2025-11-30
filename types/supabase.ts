export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      branch_members: {
        Row: {
          branch_id: string
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          branch_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          branch_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          alert_100: boolean | null
          alert_80: boolean | null
          alert_90: boolean | null
          amount: number
          category_id: string | null
          created_at: string
          id: string
          month: string
          rollover: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_100?: boolean | null
          alert_80?: boolean | null
          alert_90?: boolean | null
          amount: number
          category_id?: string | null
          created_at?: string
          id?: string
          month: string
          rollover?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_100?: boolean | null
          alert_80?: boolean | null
          alert_90?: boolean | null
          amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          month?: string
          rollover?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          branch_id: string | null
          color: string
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          email_to: string
          email_type: string
          error_message: string | null
          failed_at: string | null
          id: string
          metadata: Json | null
          resend_id: string | null
          sent_at: string | null
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_to: string
          email_type: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_to?: string
          email_type?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_core: boolean | null
          name: string
          path: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_core?: boolean | null
          name: string
          path: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_core?: boolean | null
          name?: string
          path?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      goal_contributions: {
        Row: {
          amount: number
          contributed_at: string
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          contributed_at?: string
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          contributed_at?: string
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          achieved_at: string | null
          auto_contribute: boolean
          branch_id: string
          category_id: string | null
          created_at: string
          current_amount: number
          description: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          icon: string | null
          id: string
          is_active: boolean
          monthly_target: number | null
          name: string
          priority: Database["public"]["Enums"]["goal_priority"]
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          auto_contribute?: boolean
          branch_id: string
          category_id?: string | null
          created_at?: string
          current_amount?: number
          description?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          icon?: string | null
          id?: string
          is_active?: boolean
          monthly_target?: number | null
          name: string
          priority?: Database["public"]["Enums"]["goal_priority"]
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          auto_contribute?: boolean
          branch_id?: string
          category_id?: string | null
          created_at?: string
          current_amount?: number
          description?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          icon?: string | null
          id?: string
          is_active?: boolean
          monthly_target?: number | null
          name?: string
          priority?: Database["public"]["Enums"]["goal_priority"]
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_features: {
        Row: {
          created_at: string | null
          feature_id: string | null
          id: string
          plan_id: string | null
        }
        Insert: {
          created_at?: string | null
          feature_id?: string | null
          id?: string
          plan_id?: string | null
        }
        Update: {
          created_at?: string | null
          feature_id?: string | null
          id?: string
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "plan_features_view"
            referencedColumns: ["feature_id"]
          },
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_features_view"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          days_before: number
          id: string
          sent_at: string | null
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_before?: number
          id?: string
          sent_at?: string | null
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_before?: number
          id?: string
          sent_at?: string | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          display_name: string
          export_formats: string[] | null
          has_advanced_reports: boolean | null
          history_months: number | null
          id: string
          is_active: boolean | null
          max_branches: number | null
          max_budgets: number | null
          max_categories: number | null
          max_goals: number | null
          max_reminders: number | null
          max_team_members: number | null
          max_transactions: number | null
          name: string
          stripe_product_id: string | null
          support_level: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          export_formats?: string[] | null
          has_advanced_reports?: boolean | null
          history_months?: number | null
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_budgets?: number | null
          max_categories?: number | null
          max_goals?: number | null
          max_reminders?: number | null
          max_team_members?: number | null
          max_transactions?: number | null
          name: string
          stripe_product_id?: string | null
          support_level?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          export_formats?: string[] | null
          has_advanced_reports?: boolean | null
          history_months?: number | null
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_budgets?: number | null
          max_categories?: number | null
          max_goals?: number | null
          max_reminders?: number | null
          max_team_members?: number | null
          max_transactions?: number | null
          name?: string
          stripe_product_id?: string | null
          support_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_prices: {
        Row: {
          active: boolean | null
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          interval: string
          interval_count: number | null
          plan_id: string | null
          stripe_price_id: string
        }
        Insert: {
          active?: boolean | null
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          interval: string
          interval_count?: number | null
          plan_id?: string | null
          stripe_price_id: string
        }
        Update: {
          active?: boolean | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          interval?: string
          interval_count?: number | null
          plan_id?: string | null
          stripe_price_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_prices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_features_view"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "subscription_prices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_batches: {
        Row: {
          amortized_amount: number | null
          batch_type: string
          branch_id: string
          category_id: string | null
          created_at: string | null
          description: string
          first_due_date: string
          id: string
          installment_amount: number | null
          installments_count: number | null
          last_amortization_date: string | null
          notes: string | null
          original_total_amount: number
          paid_installments: number | null
          payment_method: string | null
          status: string
          tags: string[] | null
          total_amount: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amortized_amount?: number | null
          batch_type?: string
          branch_id: string
          category_id?: string | null
          created_at?: string | null
          description: string
          first_due_date: string
          id?: string
          installment_amount?: number | null
          installments_count?: number | null
          last_amortization_date?: string | null
          notes?: string | null
          original_total_amount: number
          paid_installments?: number | null
          payment_method?: string | null
          status?: string
          tags?: string[] | null
          total_amount: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amortized_amount?: number | null
          batch_type?: string
          branch_id?: string
          category_id?: string | null
          created_at?: string | null
          description?: string
          first_due_date?: string
          id?: string
          installment_amount?: number | null
          installments_count?: number | null
          last_amortization_date?: string | null
          notes?: string | null
          original_total_amount?: number
          paid_installments?: number | null
          payment_method?: string | null
          status?: string
          tags?: string[] | null
          total_amount?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_batches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_batches_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          batch_id: string | null
          branch_id: string | null
          category_id: string | null
          created_at: string
          current_installment: number | null
          description: string
          due_date: string
          id: string
          installment_type:
            | Database["public"]["Enums"]["installment_type"]
            | null
          installments_count: number | null
          is_recurring: boolean
          paid_at: string | null
          parent_transaction_id: string | null
          payment_method: string | null
          recurrence_type: Database["public"]["Enums"]["recurrence_type"] | null
          tags: string[] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          batch_id?: string | null
          branch_id?: string | null
          category_id?: string | null
          created_at?: string
          current_installment?: number | null
          description: string
          due_date: string
          id?: string
          installment_type?:
            | Database["public"]["Enums"]["installment_type"]
            | null
          installments_count?: number | null
          is_recurring?: boolean
          paid_at?: string | null
          parent_transaction_id?: string | null
          payment_method?: string | null
          recurrence_type?:
            | Database["public"]["Enums"]["recurrence_type"]
            | null
          tags?: string[] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          batch_id?: string | null
          branch_id?: string | null
          category_id?: string | null
          created_at?: string
          current_installment?: number | null
          description?: string
          due_date?: string
          id?: string
          installment_type?:
            | Database["public"]["Enums"]["installment_type"]
            | null
          installments_count?: number | null
          is_recurring?: boolean
          paid_at?: string | null
          parent_transaction_id?: string | null
          payment_method?: string | null
          recurrence_type?:
            | Database["public"]["Enums"]["recurrence_type"]
            | null
          tags?: string[] | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "transaction_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          resource_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          resource_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          resource_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string | null
          price_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id?: string | null
          price_id?: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string | null
          price_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_features_view"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "subscription_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          early_adopter_registered_at: string | null
          email: string
          full_name: string | null
          id: string
          is_admin: boolean
          is_early_adopter: boolean | null
          stripe_customer_id: string | null
          subscription_current_period_end: string | null
          subscription_plan_id: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          early_adopter_registered_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          is_early_adopter?: boolean | null
          stripe_customer_id?: string | null
          subscription_current_period_end?: string | null
          subscription_plan_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          early_adopter_registered_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_early_adopter?: boolean | null
          stripe_customer_id?: string | null
          subscription_current_period_end?: string | null
          subscription_plan_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "plan_features_view"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "users_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          type: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          type?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          type?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      plan_features_view: {
        Row: {
          assignment_id: string | null
          feature_display_name: string | null
          feature_icon: string | null
          feature_id: string | null
          feature_name: string | null
          feature_path: string | null
          is_core_feature: boolean | null
          plan_display_name: string | null
          plan_id: string | null
          plan_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_verification_codes: { Args: never; Returns: undefined }
      create_branch_with_owner: {
        Args: { p_description?: string; p_name: string }
        Returns: {
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
        }[]
      }
      user_has_feature_access: {
        Args: { feature_path_param: string; user_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      goal_priority: "critical" | "high" | "medium" | "low"
      goal_type: "emergency_fund" | "savings" | "debt_payoff" | "purchase"
      installment_type: "a_vista" | "parcelado"
      recurrence_type: "monthly" | "weekly" | "yearly"
      transaction_type: "income" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      goal_priority: ["critical", "high", "medium", "low"],
      goal_type: ["emergency_fund", "savings", "debt_payoff", "purchase"],
      installment_type: ["a_vista", "parcelado"],
      recurrence_type: ["monthly", "weekly", "yearly"],
      transaction_type: ["income", "expense"],
    },
  },
} as const


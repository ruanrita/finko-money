import { z } from "zod";
import type { Database } from "@/types/database";

// Enums
export const GoalType = z.enum(['emergency_fund', 'savings', 'debt_payoff', 'purchase']);
export const GoalPriority = z.enum(['critical', 'high', 'medium', 'low']);

// Schema para criar meta
export const createGoalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  icon: z.string().optional().default('🎯'),
  goal_type: GoalType.default('savings'),
  priority: GoalPriority.default('medium'),
  target_amount: z.number().positive("Valor alvo deve ser maior que zero"),
  target_date: z.string().optional(), // Format: YYYY-MM-DD
  monthly_target: z.number().positive().optional(),
  auto_contribute: z.boolean().optional().default(false),
  category_id: z.string().uuid("ID de categoria inválido").optional(),
});

// Schema para atualizar meta
export const updateGoalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo").optional(),
  description: z.string().max(500, "Descrição muito longa").optional(),
  icon: z.string().optional(),
  goal_type: GoalType.optional(),
  priority: GoalPriority.optional(),
  target_amount: z.number().positive("Valor alvo deve ser maior que zero").optional(),
  target_date: z.string().optional(),
  monthly_target: z.number().positive().optional(),
  auto_contribute: z.boolean().optional(),
  is_active: z.boolean().optional(),
  category_id: z.string().uuid("ID de categoria inválido").nullable().optional(),
});

// Schema para criar contribuição
export const createContributionSchema = z.object({
  amount: z.number().positive("Valor deve ser maior que zero"),
  notes: z.string().max(500, "Nota muito longa").optional(),
  transaction_id: z.string().uuid("ID de transação inválido").optional(),
  contributed_at: z.string().optional(), // Format: YYYY-MM-DD HH:MM:SS
});

// Schema para filtros de listagem
export const listGoalsSchema = z.object({
  is_active: z.boolean().optional(),
  goal_type: GoalType.optional(),
  priority: GoalPriority.optional(),
});

// Types
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateContributionInput = z.infer<typeof createContributionSchema>;
export type ListGoalsFilters = z.infer<typeof listGoalsSchema>;
export type GoalTypeValue = z.infer<typeof GoalType>;
export type GoalPriorityValue = z.infer<typeof GoalPriority>;

// Database interfaces
export type Goal = Database["public"]["Tables"]["goals"]["Row"];

export type GoalContribution = Database["public"]["Tables"]["goal_contributions"]["Row"];

// Goal com informações calculadas
export interface GoalWithProgress extends Goal {
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  } | null;
  progress_percentage: number;      // Percentual atingido (0-100+)
  remaining_amount: number;          // Quanto falta para atingir
  status: 'not_started' | 'in_progress' | 'almost_there' | 'achieved'; // Status visual
  projected_date: string | null;    // Data projetada de alcance
  monthly_average: number;           // Média de contribuição mensal
  total_contributions: number;       // Total de contribuições feitas
  days_until_target: number | null;  // Dias até a data alvo
  is_overdue: boolean;               // Se passou da data alvo sem atingir
  monthly_needed: number | null;     // Quanto precisa contribuir por mês para atingir no prazo
}

// Contribution com detalhes
export interface ContributionWithDetails extends GoalContribution {
  transaction?: {
    id: string;
    description: string;
    amount: number;
    type: string;
  } | null;
  user: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

// Response types
export interface CreateGoalResponse {
  goal: Goal;
  message: string;
}

export interface UpdateGoalResponse {
  goal: Goal;
  message: string;
}

export interface DeleteGoalResponse {
  message: string;
}

export interface CreateContributionResponse {
  contribution: GoalContribution;
  goal: GoalWithProgress;
  message: string;
}

export interface GoalStatsResponse {
  total_goals: number;
  active_goals: number;
  achieved_goals: number;
  total_target_amount: number;
  total_current_amount: number;
  overall_progress: number;
  goals_by_type: {
    emergency_fund: number;
    savings: number;
    debt_payoff: number;
    purchase: number;
  };
  goals_by_priority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

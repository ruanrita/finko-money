import { z } from "zod";

// Schema para criar orçamento
export const createBudgetSchema = z.object({
  category_id: z.string().uuid("ID de categoria inválido"),
  amount: z.number().positive("Valor deve ser maior que zero"),
  month: z.string().regex(/^\d{4}-\d{2}-01$/, "Mês deve estar no formato YYYY-MM-01"),
  rollover: z.boolean().optional().default(false),
  alert_80: z.boolean().optional().default(true),
  alert_90: z.boolean().optional().default(true),
  alert_100: z.boolean().optional().default(true),
});

// Schema para atualizar orçamento
export const updateBudgetSchema = z.object({
  amount: z.number().positive("Valor deve ser maior que zero").optional(),
  rollover: z.boolean().optional(),
  alert_80: z.boolean().optional(),
  alert_90: z.boolean().optional(),
  alert_100: z.boolean().optional(),
});

// Types
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
  rollover: boolean;
  alert_80: boolean;
  alert_90: boolean;
  alert_100: boolean;
  created_at: string;
  updated_at: string;
}

// Budget com informações calculadas
export interface BudgetWithStats extends Budget {
  category: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  };
  spent: number;           // Quanto já gastou no mês
  remaining: number;       // Quanto ainda tem disponível
  percentage: number;      // Percentual usado
  status: 'ok' | 'warning' | 'danger' | 'exceeded'; // Status visual
  daily_available: number; // Quanto pode gastar por dia
  weekly_available: number; // Quanto pode gastar por semana
  days_remaining: number;  // Dias restantes no mês
  previous_month_spent?: number; // Gasto do mês anterior para comparação
}

import { z } from "zod";

// Schema para criar lembrete
export const createReminderSchema = z.object({
  transaction_id: z.string().uuid("ID de transação inválido"),
  days_before: z.number().int().min(0, "Dias antes deve ser no mínimo 0").max(365, "Dias antes deve ser no máximo 365"),
});

// Schema para atualizar lembrete
export const updateReminderSchema = z.object({
  days_before: z.number().int().min(0, "Dias antes deve ser no mínimo 0").max(365, "Dias antes deve ser no máximo 365").optional(),
  sent_at: z.string().datetime().optional().nullable(),
});

// Types
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;

export interface Reminder {
  id: string;
  user_id: string;
  transaction_id: string;
  days_before: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

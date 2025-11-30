import { z } from "zod";

/**
 * Schema para criar log de email
 */
export const createEmailLogSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  email_to: z.string().email("Email inválido"),
  email_type: z.string().min(1, "Tipo de email é obrigatório"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  status: z.enum(["pending", "sent", "failed"]).default("pending"),
  error_message: z.string().nullable().optional(),
  resend_id: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});

/**
 * Schema para atualizar status do email
 */
export const updateEmailLogStatusSchema = z.object({
  id: z.string().uuid("ID inválido"),
  status: z.enum(["sent", "failed"]),
  error_message: z.string().nullable().optional(),
  resend_id: z.string().nullable().optional(),
});

// Types inferidos
export type CreateEmailLogInput = z.infer<typeof createEmailLogSchema>;
export type UpdateEmailLogStatusInput = z.infer<typeof updateEmailLogStatusSchema>;

// Database type
export interface EmailLog {
  id: string;
  user_id: string | null;
  email_to: string;
  email_type: string;
  subject: string;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  resend_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  sent_at: string | null;
  failed_at: string | null;
}

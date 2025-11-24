import { z } from "zod";
import type { Database } from "@/types/database";

// Type from database
export type TransactionBatch = Database["public"]["Tables"]["transaction_batches"]["Row"];
export type TransactionBatchInsert = Database["public"]["Tables"]["transaction_batches"]["Insert"];
export type TransactionBatchUpdate = Database["public"]["Tables"]["transaction_batches"]["Update"];

// Zod schemas for validation
export const createTransactionBatchSchema = z.object({
  batch_type: z.enum(["installments"]).default("installments"),
  description: z.string().min(1, "Descrição é obrigatória"),
  total_amount: z.number().positive("Valor total deve ser positivo"),
  installments_count: z.number().int().positive("Número de parcelas deve ser positivo"),
  type: z.enum(["income", "expense"]),
  category_id: z.string().uuid().optional().nullable(),
  payment_method: z.enum(["pix", "boleto", "credito", "debito", "dinheiro", "transferencia"]).optional().nullable(),
  first_due_date: z.union([z.string(), z.date()]),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const updateTransactionBatchSchema = z.object({
  description: z.string().min(1).optional(),
  category_id: z.string().uuid().optional().nullable(),
  payment_method: z.enum(["pix", "boleto", "credito", "debito", "dinheiro", "transferencia"]).optional().nullable(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "cancelled", "completed"]).optional(),
});

export const amortizeTransactionBatchSchema = z.object({
  amortization_amount: z.number().positive("Valor de amortização deve ser positivo"),
  amortization_date: z.union([z.string(), z.date()]).optional(),
});

export type CreateTransactionBatchInput = z.infer<typeof createTransactionBatchSchema>;
export type UpdateTransactionBatchInput = z.infer<typeof updateTransactionBatchSchema>;
export type AmortizeTransactionBatchInput = z.infer<typeof amortizeTransactionBatchSchema>;

// Extended type with related data
export type TransactionBatchWithTransactions = TransactionBatch & {
  transactions: Array<{
    id: string;
    amount: number;
    due_date: string;
    paid_at: string | null;
    current_installment: number | null;
    description: string;
  }>;
  category?: {
    name: string;
    color: string;
    icon: string | null;
  } | null;
};

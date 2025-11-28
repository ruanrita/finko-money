import { z } from "zod";
import type { Database } from "@/types/database";

// Enums
export const transactionTypeEnum = z.enum(["income", "expense"]);
export const recurrenceTypeEnum = z.enum(["monthly", "weekly", "yearly"]);
export const installmentTypeEnum = z.enum(["a_vista", "parcelado"]);

// Schema base para transação
const baseTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória").max(255),
  category_id: z.string().uuid().nullable().optional(),
  due_date: z.string().or(z.date()),
  payment_method: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  branch_id: z.string().uuid("Branch ID inválido"),
});

// Schema para criação de transação única
export const createSingleTransactionSchema = baseTransactionSchema.extend({
  installment_type: z.literal("a_vista"),
  is_recurring: z.boolean().default(false),
  recurrence_type: recurrenceTypeEnum.nullable().optional(),
});

// Schema para criação de transação parcelada
export const createInstallmentTransactionSchema = baseTransactionSchema.extend({
  installment_type: z.literal("parcelado"),
  installments_count: z.number().int().min(2, "Mínimo 2 parcelas").max(100),
  is_recurring: z.literal(false),
});

// Schema para criação (união)
export const createTransactionSchema = z.discriminatedUnion("installment_type", [
  createSingleTransactionSchema,
  createInstallmentTransactionSchema,
]);

// Schema para atualização
export const updateTransactionSchema = z.object({
  type: transactionTypeEnum.optional(),
  amount: z.number().positive("Valor deve ser positivo").optional(),
  description: z.string().min(1).max(255).optional(),
  category_id: z.string().uuid().nullable().optional(),
  due_date: z.string().or(z.date()).optional(),
  payment_method: z.string().optional(),
  tags: z.array(z.string()).optional(),
  paid_at: z.string().or(z.date()).nullable().optional(),
  installment_type: installmentTypeEnum.optional(),
  is_recurring: z.boolean().optional(),
  recurrence_type: recurrenceTypeEnum.nullable().optional(),
  installments_count: z.number().int().min(2).max(100).optional(),
});

// Schema para marcar como pago/não pago
export const markAsPaidSchema = z.object({
  paid_at: z.string().or(z.date()).optional(),
});

// Schema para filtros
export const transactionFiltersSchema = z.object({
  type: transactionTypeEnum.optional(),
  category_id: z.string().uuid().optional(),
  status: z.enum(["paid", "pending", "overdue"]).optional(),
  payment_method: z.string().optional(),
  installment_type: installmentTypeEnum.optional(),
  is_recurring: z.boolean().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(), // YYYY-MM
  start_date: z.string().optional(), // YYYY-MM-DD
  end_date: z.string().optional(), // YYYY-MM-DD
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Schema para buscar por ID
export const getTransactionByIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

// Types inferidos
export type TransactionType = z.infer<typeof transactionTypeEnum>;
export type RecurrenceType = z.infer<typeof recurrenceTypeEnum>;
export type InstallmentType = z.infer<typeof installmentTypeEnum>;
export type CreateSingleTransactionInput = z.infer<typeof createSingleTransactionSchema>;
export type CreateInstallmentTransactionInput = z.infer<typeof createInstallmentTransactionSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type MarkAsPaidInput = z.infer<typeof markAsPaidSchema>;

// Database types
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

// Type for transaction with joined category
export type TransactionWithCategory = Transaction & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null;
};

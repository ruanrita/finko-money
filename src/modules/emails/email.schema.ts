import { z } from "zod";

/**
 * Schema base para envio de email
 */
export const baseEmailSchema = z.object({
  to: z.union([
    z.string().email("Email inválido"),
    z.array(z.string().email("Email inválido")).min(1, "Pelo menos um destinatário é obrigatório"),
  ]),
  subject: z.string().min(1, "Assunto é obrigatório").max(255),
  from: z.string().email("Email do remetente inválido").optional(),
  replyTo: z.string().email("Email de resposta inválido").optional(),
});

/**
 * Schema para envio de email HTML
 */
export const sendHtmlEmailSchema = baseEmailSchema.extend({
  html: z.string().min(1, "Conteúdo HTML é obrigatório"),
  text: z.string().optional(), // Versão em texto plano (fallback)
});

/**
 * Schema para envio de email com template React
 */
export const sendReactEmailSchema = baseEmailSchema.extend({
  react: z.any(), // Componente React
});

/**
 * Schema para email de boas-vindas
 */
export const welcomeEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  userName: z.string().min(1, "Nome do usuário é obrigatório"),
});

/**
 * Schema para email de redefinição de senha
 */
export const passwordResetEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  userName: z.string().min(1, "Nome do usuário é obrigatório"),
  resetLink: z.string().url("Link de redefinição inválido"),
});

/**
 * Schema para email de confirmação de transação
 */
export const transactionConfirmationEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  userName: z.string().min(1, "Nome do usuário é obrigatório"),
  transactionType: z.enum(["income", "expense"]),
  amount: z.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z.string().or(z.date()),
});

/**
 * Schema para email de lembrete de vencimento
 */
export const paymentReminderEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  userName: z.string().min(1, "Nome do usuário é obrigatório"),
  transactions: z.array(
    z.object({
      description: z.string(),
      amount: z.number(),
      dueDate: z.string().or(z.date()),
    })
  ).min(1, "Pelo menos uma transação é obrigatória"),
});

/**
 * Schema para email de código 2FA
 */
export const twoFactorEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  userName: z.string().min(1, "Nome do usuário é obrigatório"),
  code: z.string().length(6, "Código deve ter 6 dígitos"),
  expiresInMinutes: z.number().positive().default(10),
});

/**
 * Schema para email de alerta de orçamento
 */
export const budgetAlertEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  userName: z.string().min(1, "Nome do usuário é obrigatório"),
  categoryName: z.string().min(1, "Nome da categoria é obrigatório"),
  budgetAmount: z.number().positive("Valor do orçamento deve ser positivo"),
  spentAmount: z.number().nonnegative("Valor gasto deve ser não-negativo"),
  percentage: z.number().nonnegative("Percentual deve ser não-negativo"),
  alertLevel: z.enum(["80", "90", "100"]).transform(val => parseInt(val) as 80 | 90 | 100),
  month: z.string().regex(/^\d{4}-\d{2}-01$/, "Mês deve estar no formato YYYY-MM-01"),
});

// Types inferidos
export type SendHtmlEmailInput = z.infer<typeof sendHtmlEmailSchema>;
export type SendReactEmailInput = z.infer<typeof sendReactEmailSchema>;
export type WelcomeEmailInput = z.infer<typeof welcomeEmailSchema>;
export type PasswordResetEmailInput = z.infer<typeof passwordResetEmailSchema>;
export type TransactionConfirmationEmailInput = z.infer<typeof transactionConfirmationEmailSchema>;
export type PaymentReminderEmailInput = z.infer<typeof paymentReminderEmailSchema>;
export type TwoFactorEmailInput = z.infer<typeof twoFactorEmailSchema>;
export type BudgetAlertEmailInput = z.infer<typeof budgetAlertEmailSchema>;

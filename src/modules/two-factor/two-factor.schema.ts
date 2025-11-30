import { z } from "zod";

/**
 * Schema para gerar código de verificação
 */
export const generateCodeSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  type: z.enum(["2fa", "password_reset"]).default("2fa"),
});

/**
 * Schema para verificar código
 */
export const verifyCodeSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  code: z.string().length(6, "Código deve ter 6 dígitos"),
  type: z.enum(["2fa", "password_reset"]).default("2fa"),
});

// Types inferidos
export type GenerateCodeInput = z.infer<typeof generateCodeSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;

// Database types
export interface VerificationCode {
  id: string;
  user_id: string;
  code: string;
  type: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
  used_at: string | null;
}

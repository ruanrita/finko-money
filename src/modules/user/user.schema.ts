import { z } from "zod";

// Schema para login
export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

// Schema para signup
export const signupSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  full_name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
});

// Schema para atualização de perfil
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().optional(),
});

// Schema para alteração de senha
export const changePasswordSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
});

// Schema para recuperação de senha
export const resetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

// Types inferidos
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

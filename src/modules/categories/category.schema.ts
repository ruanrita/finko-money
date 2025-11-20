import { z } from "zod";

// Schema para criação de categoria
export const createCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").default("#6366f1"),
  icon: z.string().optional(),
  branch_id: z.string().uuid("Branch ID inválido"),
});

// Schema para atualização de categoria
export const updateCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional(),
  icon: z.string().optional(),
});

// Schema para buscar categoria por ID
export const getCategoryByIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

// Types inferidos dos schemas
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoryByIdInput = z.infer<typeof getCategoryByIdSchema>;

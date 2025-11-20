import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  description: z.string().max(500).optional(),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export const addMemberSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["owner", "member"]).default("member"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["owner", "member"]),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

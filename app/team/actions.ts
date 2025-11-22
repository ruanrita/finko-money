"use server";

import { revalidatePath } from "next/cache";
import { BranchService } from "@/src/modules/branches";
import { createClient } from "@/lib/supabase/server";
import { switchBranch } from "@/lib/supabase/branch-context";
import { getAuthenticatedUser } from "./auth-helper";

export async function inviteMemberAction(
  branchId: string,
  email: string,
  role: "owner" | "member"
) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.addMember(branchId, { email, role }, user.id);
    revalidatePath("/equipe");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBranchMembersAction(branchId: string) {
  const user = await getAuthenticatedUser();

  try {
    return await BranchService.getBranchMembers(branchId, user.id);
  } catch (error: any) {
    return null;
  }
}

export async function removeMemberAction(branchId: string, targetUserId: string) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.removeMember(branchId, targetUserId, user.id);
    revalidatePath("/equipe");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changeMemberRoleAction(
  branchId: string,
  targetUserId: string,
  newRole: "owner" | "member"
) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.updateMemberRole(branchId, targetUserId, { role: newRole }, user.id);
    revalidatePath("/equipe");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBranchAction(
  branchId: string,
  name: string,
  description: string
) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.updateBranch(branchId, { name, description }, user.id);
    revalidatePath("/configuracoes");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBranchAction(branchId: string) {
  const user = await getAuthenticatedUser();

  try {
    await BranchService.deleteBranch(branchId, user.id);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createBranchAction(name: string, description?: string) {
  const user = await getAuthenticatedUser();

  try {
    const newBranch = await BranchService.createBranch({ name, description }, user.id);

    // Criar categorias padrão para o novo workspace
    const supabase = await createClient();
    await supabase.from("categories").insert([
      { user_id: user.id, branch_id: newBranch.id, name: "Alimentacao", color: "#ef4444", icon: "Utensils" },
      { user_id: user.id, branch_id: newBranch.id, name: "Transporte", color: "#3b82f6", icon: "Car" },
      { user_id: user.id, branch_id: newBranch.id, name: "Moradia", color: "#8b5cf6", icon: "Home" },
      { user_id: user.id, branch_id: newBranch.id, name: "Lazer", color: "#ec4899", icon: "Gamepad2" },
      { user_id: user.id, branch_id: newBranch.id, name: "Saude", color: "#10b981", icon: "Heart" },
      { user_id: user.id, branch_id: newBranch.id, name: "Educacao", color: "#f59e0b", icon: "GraduationCap" },
      { user_id: user.id, branch_id: newBranch.id, name: "Assinaturas", color: "#6366f1", icon: "ShoppingCart" },
      { user_id: user.id, branch_id: newBranch.id, name: "Outros", color: "#6b7280", icon: "DollarSign" },
    ]);

    // Trocar para o novo workspace automaticamente
    await switchBranch(user.id, newBranch.id);

    revalidatePath("/configuracoes");
    revalidatePath("/", "layout");
    return { success: true, branch: newBranch };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

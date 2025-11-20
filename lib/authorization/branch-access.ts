import { createClient } from "@/lib/supabase/server";

/**
 * Controle de acesso baseado em branches
 * Verifica se usuários têm permissão para acessar/modificar recursos de um branch
 */
export class BranchAccessControl {
  /**
   * Verifica se o usuário é membro do branch
   */
  static async verifyMembership(branchId: string, userId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("branch_members")
      .select("id")
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  }

  /**
   * Verifica se o usuário é dono do branch
   */
  static async verifyOwnership(branchId: string, userId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("branch_members")
      .select("role")
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === "owner";
  }

  /**
   * Requer que o usuário seja membro do branch (lança erro se não for)
   */
  static async requireMembership(branchId: string, userId: string): Promise<void> {
    const isMember = await this.verifyMembership(branchId, userId);

    if (!isMember) {
      throw new Error("Acesso negado a este branch");
    }
  }

  /**
   * Requer que o usuário seja dono do branch (lança erro se não for)
   */
  static async requireOwnership(branchId: string, userId: string): Promise<void> {
    const isOwner = await this.verifyOwnership(branchId, userId);

    if (!isOwner) {
      throw new Error("Apenas donos podem realizar esta ação");
    }
  }

  /**
   * Obtém a role do usuário no branch
   */
  static async getUserRole(branchId: string, userId: string): Promise<"owner" | "member" | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("branch_members")
      .select("role")
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role as "owner" | "member";
  }
}

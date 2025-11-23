import { createClient } from "@/lib/supabase/server";
import type { CreateBranchInput, UpdateBranchInput } from "./branch.schema";

export class BranchRepository {
  static async findByUserId(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("branches")
      .select(`
        *,
        branch_members!inner(
          user_id,
          role,
          joined_at
        )
      `)
      .eq("branch_members.user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  static async findById(branchId: string, userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("branches")
      .select(`
        *,
        branch_members(
          id,
          user_id,
          role,
          joined_at,
          invited_by
        )
      `)
      .eq("id", branchId)
      .single();

    if (error) throw new Error(error.message);

    // Verify user has access
    const hasAccess = data.branch_members?.some(
      (member: any) => member.user_id === userId
    );

    if (!hasAccess) {
      throw new Error("Acesso negado a este branch");
    }

    return data;
  }

  static async create(input: CreateBranchInput, userId: string) {
    const supabase = await createClient();

    // Usar função RPC que cria branch + membership atomicamente (resolve RLS)
    const { data: branch, error: branchError } = await supabase
      .rpc("create_branch_with_owner", {
        p_name: input.name,
        p_description: input.description || undefined,
      })
      .single();

    if (branchError) throw new Error(branchError.message);

    return branch;
  }

  static async update(branchId: string, input: UpdateBranchInput, userId: string) {
    const supabase = await createClient();

    // Check if user is owner
    const isOwner = await this.verifyOwnership(branchId, userId);
    if (!isOwner) {
      throw new Error("Apenas donos podem atualizar o branch");
    }

    const { data, error } = await supabase
      .from("branches")
      .update(input as any)
      .eq("id", branchId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async delete(branchId: string, userId: string) {
    const supabase = await createClient();

    // Check if user is owner
    const isOwner = await this.verifyOwnership(branchId, userId);
    if (!isOwner) {
      throw new Error("Apenas donos podem deletar o branch");
    }

    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("id", branchId);

    if (error) throw new Error(error.message);
  }

  static async getMembers(branchId: string, userId: string) {
    const supabase = await createClient();

    // Verify user has access to this branch
    const isMember = await this.verifyMembership(branchId, userId);
    if (!isMember) {
      throw new Error("Acesso negado a este branch");
    }

    const { data, error } = await supabase
      .from("branch_members")
      .select(`
        id,
        role,
        joined_at,
        user_id,
        users!branch_members_user_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .eq("branch_id", branchId)
      .order("joined_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  static async addMember(branchId: string, targetUserId: string, role: string, invitedBy: string) {
    const supabase = await createClient();

    // Check if inviter is owner
    const isOwner = await this.verifyOwnership(branchId, invitedBy);
    if (!isOwner) {
      throw new Error("Apenas donos podem adicionar membros");
    }

    const { data, error } = await supabase
      .from("branch_members")
      .insert({
        branch_id: branchId,
        user_id: targetUserId,
        role,
        invited_by: invitedBy,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Usuário já é membro deste branch");
      }
      throw new Error(error.message);
    }

    return data;
  }

  static async removeMember(branchId: string, targetUserId: string, removedBy: string) {
    const supabase = await createClient();

    // Check if remover is owner
    const isOwner = await this.verifyOwnership(branchId, removedBy);
    if (!isOwner) {
      throw new Error("Apenas donos podem remover membros");
    }

    // Don't allow removing yourself if you're the only owner
    const { data: owners } = await supabase
      .from("branch_members")
      .select("user_id")
      .eq("branch_id", branchId)
      .eq("role", "owner");

    if (owners && owners.length === 1 && owners[0].user_id === targetUserId) {
      throw new Error("Não é possível remover o único dono do branch");
    }

    const { error } = await supabase
      .from("branch_members")
      .delete()
      .eq("branch_id", branchId)
      .eq("user_id", targetUserId);

    if (error) throw new Error(error.message);
  }

  static async updateMemberRole(branchId: string, targetUserId: string, newRole: string, updatedBy: string) {
    const supabase = await createClient();

    // Check if updater is owner
    const isOwner = await this.verifyOwnership(branchId, updatedBy);
    if (!isOwner) {
      throw new Error("Apenas donos podem alterar roles de membros");
    }

    // Don't allow demoting yourself if you're the only owner
    if (newRole === "member" && targetUserId === updatedBy) {
      const { data: owners } = await supabase
        .from("branch_members")
        .select("user_id")
        .eq("branch_id", branchId)
        .eq("role", "owner");

      if (owners && owners.length === 1) {
        throw new Error("Não é possível rebaixar o único dono do branch");
      }
    }

    const { data, error } = await supabase
      .from("branch_members")
      .update({ role: newRole })
      .eq("branch_id", branchId)
      .eq("user_id", targetUserId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getUserByEmail(email: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name")
      .eq("email", email)
      .single();

    if (error) return null;
    return data;
  }

  // =========================================
  // MÉTODOS DE VERIFICAÇÃO DE ACESSO
  // =========================================

  /**
   * Verifica se usuário é membro do branch
   */
  static async verifyMembership(branchId: string, userId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("branch_members")
      .select("id")
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .single();

    return !!data && !error;
  }

  /**
   * Verifica se usuário é owner do branch
   */
  static async verifyOwnership(branchId: string, userId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("branch_members")
      .select("role")
      .eq("branch_id", branchId)
      .eq("user_id", userId)
      .eq("role", "owner")
      .single();

    return !!data && !error;
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

    if (error || !data) return null;
    return data.role as "owner" | "member";
  }
}

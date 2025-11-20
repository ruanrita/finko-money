import { createClient } from "@/lib/supabase/server";

/**
 * Helper class for branch-based authorization
 * Provides methods to verify user access to branches
 */
export class BranchAccessControl {
  /**
   * Verifies if user is a member of a branch
   * @param branchId - ID of the branch
   * @param userId - ID of the user
   * @returns true if user is a member, false otherwise
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
   * Verifies if user is an owner of a branch
   * @param branchId - ID of the branch
   * @param userId - ID of the user
   * @returns true if user is an owner, false otherwise
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
   * Throws error if user is not a member of the branch
   * @param branchId - ID of the branch
   * @param userId - ID of the user
   * @throws Error if user is not a member
   */
  static async requireMembership(branchId: string, userId: string): Promise<void> {
    const isMember = await this.verifyMembership(branchId, userId);
    if (!isMember) {
      throw new Error("Acesso negado a este branch");
    }
  }

  /**
   * Throws error if user is not an owner of the branch
   * @param branchId - ID of the branch
   * @param userId - ID of the user
   * @throws Error if user is not an owner
   */
  static async requireOwnership(branchId: string, userId: string): Promise<void> {
    const isOwner = await this.verifyOwnership(branchId, userId);
    if (!isOwner) {
      throw new Error("Apenas donos podem realizar esta ação");
    }
  }

  /**
   * Gets the user's role in a branch
   * @param branchId - ID of the branch
   * @param userId - ID of the user
   * @returns "owner" | "member" | null
   */
  static async getUserRole(
    branchId: string,
    userId: string
  ): Promise<"owner" | "member" | null> {
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

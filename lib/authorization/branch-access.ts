import { BranchRepository } from "@/src/modules/branches/branch.repository";

/**
 * Controle de acesso baseado em branches
 * Verifica se usuários têm permissão para acessar/modificar recursos de um branch
 *
 * IMPORTANTE: Este arquivo NÃO acessa o banco diretamente.
 * Ele delega para o BranchRepository que é a camada de acesso a dados.
 */
export class BranchAccessControl {
  /**
   * Verifica se o usuário é membro do branch
   */
  static async verifyMembership(branchId: string, userId: string): Promise<boolean> {
    return BranchRepository.verifyMembership(branchId, userId);
  }

  /**
   * Verifica se o usuário é dono do branch
   */
  static async verifyOwnership(branchId: string, userId: string): Promise<boolean> {
    return BranchRepository.verifyOwnership(branchId, userId);
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
    return BranchRepository.getUserRole(branchId, userId);
  }
}

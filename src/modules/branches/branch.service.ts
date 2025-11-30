import { BranchRepository } from "./branch.repository";
import type {
  CreateBranchInput,
  UpdateBranchInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from "./branch.schema";
import { UsageService } from "@/src/modules/usage/usage.service";

export class BranchService {
  static async getUserBranches(userId: string) {
    return await BranchRepository.findByUserId(userId);
  }

  static async getBranchById(branchId: string, userId: string) {
    return await BranchRepository.findById(branchId, userId);
  }

  static async createBranch(input: CreateBranchInput, userId: string) {
    // 1. Verificar limite de branches
    const usageCheck = await UsageService.checkUsageLimit(userId, 'branch');

    if (!usageCheck.allowed) {
      throw new Error(
        `Limite de ${usageCheck.limit} branches atingido. ` +
        `Você está usando ${usageCheck.current}/${usageCheck.limit} branches disponíveis no plano ${usageCheck.planName}. ` +
        `Faça upgrade para criar mais branches.`
      );
    }

    // 2. Criar branch
    return await BranchRepository.create(input, userId);
  }

  static async updateBranch(branchId: string, input: UpdateBranchInput, userId: string) {
    return await BranchRepository.update(branchId, input, userId);
  }

  static async deleteBranch(branchId: string, userId: string) {
    return await BranchRepository.delete(branchId, userId);
  }

  static async getBranchMembers(branchId: string, userId: string) {
    return await BranchRepository.getMembers(branchId, userId);
  }

  static async addMember(branchId: string, input: AddMemberInput, invitedBy: string) {
    // 1. Verificar limite de membros da equipe
    const usageCheck = await UsageService.checkUsageLimit(invitedBy, 'team_member', branchId);

    if (!usageCheck.allowed) {
      throw new Error(
        `Limite de ${usageCheck.limit} membros na equipe atingido. ` +
        `Você está usando ${usageCheck.current}/${usageCheck.limit} membros disponíveis no plano ${usageCheck.planName}. ` +
        `Faça upgrade para adicionar mais membros à equipe.`
      );
    }

    // 2. Find user by email
    const targetUser = await BranchRepository.getUserByEmail(input.email);

    if (!targetUser) {
      throw new Error("Usuário não encontrado com este email");
    }

    // 3. Add member
    return await BranchRepository.addMember(
      branchId,
      targetUser.id,
      input.role,
      invitedBy
    );
  }

  static async removeMember(branchId: string, targetUserId: string, removedBy: string) {
    return await BranchRepository.removeMember(branchId, targetUserId, removedBy);
  }

  static async updateMemberRole(
    branchId: string,
    targetUserId: string,
    input: UpdateMemberRoleInput,
    updatedBy: string
  ) {
    return await BranchRepository.updateMemberRole(
      branchId,
      targetUserId,
      input.role,
      updatedBy
    );
  }
}

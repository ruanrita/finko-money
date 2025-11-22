import { GoalRepository } from "./goal.repository";
import { BranchAccessControl } from "@/lib/authorization/branch-access";
import type {
  CreateGoalInput,
  UpdateGoalInput,
  CreateContributionInput,
  GoalWithProgress,
  GoalContribution,
  ContributionWithDetails,
  CreateGoalResponse,
  UpdateGoalResponse,
  DeleteGoalResponse,
  CreateContributionResponse,
  ListGoalsFilters,
  GoalStatsResponse,
} from "./goal.schema";

export class GoalService {
  // =========================================
  // GOALS CRUD
  // =========================================

  // Listar todas as metas
  static async listGoals(
    userId: string,
    branchId: string,
    filters?: ListGoalsFilters
  ): Promise<GoalWithProgress[]> {
    // Verificar acesso ao branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const goals = await GoalRepository.findAll(userId, branchId, filters);
    return goals;
  }

  // Buscar meta por ID
  static async getGoal(goalId: string, userId: string): Promise<GoalWithProgress> {
    const goal = await GoalRepository.findById(goalId, userId);
    if (!goal) {
      throw new Error("Meta não encontrada");
    }

    // Verificar acesso ao branch
    await BranchAccessControl.requireMembership(goal.branch_id, userId);

    return goal;
  }

  // Criar nova meta
  static async createGoal(
    userId: string,
    branchId: string,
    data: CreateGoalInput
  ): Promise<CreateGoalResponse> {
    // Verificar acesso ao branch
    await BranchAccessControl.requireMembership(branchId, userId);

    // Validar categoria se fornecida
    if (data.category_id) {
      // TODO: Verificar se categoria existe e pertence ao usuário/branch
    }

    // Se for reserva de emergência e não houver target_amount, calcular sugestão
    if (data.goal_type === 'emergency_fund' && !data.target_amount) {
      const suggested = await GoalRepository.calculateEmergencyFundSuggestion(userId, branchId);
      data.target_amount = suggested;
    }

    const goal = await GoalRepository.create(userId, branchId, data);

    return {
      goal,
      message: "Meta criada com sucesso!",
    };
  }

  // Atualizar meta
  static async updateGoal(
    goalId: string,
    userId: string,
    data: UpdateGoalInput
  ): Promise<UpdateGoalResponse> {
    // Verificar se meta existe
    const existingGoal = await GoalRepository.findById(goalId, userId);
    if (!existingGoal) {
      throw new Error("Meta não encontrada");
    }

    // Verificar acesso ao branch
    await BranchAccessControl.requireMembership(existingGoal.branch_id, userId);

    // Validar categoria se fornecida
    if (data.category_id) {
      // TODO: Verificar se categoria existe e pertence ao usuário/branch
    }

    const goal = await GoalRepository.update(goalId, userId, data);

    return {
      goal,
      message: "Meta atualizada com sucesso!",
    };
  }

  // Deletar meta
  static async deleteGoal(goalId: string, userId: string): Promise<DeleteGoalResponse> {
    // Verificar se meta existe
    const existingGoal = await GoalRepository.findById(goalId, userId);
    if (!existingGoal) {
      throw new Error("Meta não encontrada");
    }

    // Verificar acesso ao branch
    await BranchAccessControl.requireMembership(existingGoal.branch_id, userId);

    await GoalRepository.delete(goalId, userId);

    return {
      message: "Meta excluída com sucesso!",
    };
  }

  // =========================================
  // CONTRIBUTIONS
  // =========================================

  // Listar contribuições de uma meta
  static async listContributions(
    goalId: string,
    userId: string
  ): Promise<ContributionWithDetails[]> {
    // Verificar se meta existe
    const goal = await GoalRepository.findById(goalId, userId);
    if (!goal) {
      throw new Error("Meta não encontrada");
    }

    // Verificar acesso ao branch
    await BranchAccessControl.requireMembership(goal.branch_id, userId);

    const contributions = await GoalRepository.findContributions(goalId, userId);
    return contributions;
  }

  // Criar contribuição
  static async createContribution(
    goalId: string,
    userId: string,
    data: CreateContributionInput
  ): Promise<CreateContributionResponse> {
    // Verificar se meta existe
    const goal = await GoalRepository.findById(goalId, userId);
    if (!goal) {
      throw new Error("Meta não encontrada");
    }

    // Verificar acesso ao branch
    await BranchAccessControl.requireMembership(goal.branch_id, userId);

    // Verificar se meta está ativa
    if (!goal.is_active) {
      throw new Error("Não é possível contribuir para uma meta inativa");
    }

    // Verificar se meta já foi alcançada
    if (goal.achieved_at) {
      throw new Error("Esta meta já foi alcançada!");
    }

    // Verificar se contribuição não excede o valor alvo
    const newTotal = Number(goal.current_amount) + data.amount;
    if (newTotal > Number(goal.target_amount)) {
      // Permitir, mas avisar
      console.warn(
        `Contribuição excede valor alvo. Total: ${newTotal}, Alvo: ${goal.target_amount}`
      );
    }

    // Validar transação se fornecida
    if (data.transaction_id) {
      // TODO: Verificar se transação existe e pertence ao usuário/branch
    }

    const contribution = await GoalRepository.createContribution(goalId, userId, data);

    // Buscar meta atualizada
    const updatedGoal = await GoalRepository.findById(goalId, userId);

    return {
      contribution,
      goal: updatedGoal!,
      message: "Contribuição registrada com sucesso!",
    };
  }

  // Deletar contribuição
  static async deleteContribution(contributionId: string, userId: string): Promise<void> {
    // Buscar contribuição para verificar acesso
    // TODO: Implementar método no repository para buscar contribuição por ID

    await GoalRepository.deleteContribution(contributionId, userId);
  }

  // =========================================
  // STATISTICS
  // =========================================

  // Obter estatísticas das metas
  static async getStats(userId: string, branchId: string): Promise<GoalStatsResponse> {
    // Verificar acesso ao branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const stats = await GoalRepository.getStats(userId, branchId);
    return stats;
  }

  // Calcular sugestão de valor para reserva de emergência
  static async calculateEmergencyFundSuggestion(
    userId: string,
    branchId: string
  ): Promise<{ suggested_amount: number; monthly_expenses: number; months: number }> {
    // Verificar acesso ao branch
    await BranchAccessControl.requireMembership(branchId, userId);

    const suggestedAmount = await GoalRepository.calculateEmergencyFundSuggestion(
      userId,
      branchId
    );
    const monthlyExpenses = suggestedAmount / 6; // Dividir por 6 meses

    return {
      suggested_amount: suggestedAmount,
      monthly_expenses: monthlyExpenses,
      months: 6,
    };
  }

  // =========================================
  // HELPER METHODS
  // =========================================

  // Verificar se usuário tem reserva de emergência
  static async hasEmergencyFund(userId: string, branchId: string): Promise<boolean> {
    const goals = await GoalRepository.findAll(userId, branchId, {
      goal_type: 'emergency_fund',
      is_active: true,
    });

    return goals.length > 0;
  }

  // Buscar reserva de emergência ativa
  static async getEmergencyFund(userId: string, branchId: string): Promise<GoalWithProgress | null> {
    const goals = await GoalRepository.findAll(userId, branchId, {
      goal_type: 'emergency_fund',
      is_active: true,
    });

    return goals.length > 0 ? goals[0] : null;
  }

  // Verificar se usuário pode criar mais metas
  static async canCreateGoal(userId: string, branchId: string): Promise<boolean> {
    const goals = await GoalRepository.findAll(userId, branchId, {
      is_active: true,
    });

    // Limite de 20 metas ativas (pode ser configurável)
    return goals.length < 20;
  }
}

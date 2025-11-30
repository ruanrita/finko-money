import { BudgetRepository } from "./budget.repository";
import type { CreateBudgetInput, UpdateBudgetInput } from "./budget.schema";
import { UsageService } from "@/src/modules/usage/usage.service";

export class BudgetService {
  static async getMonthBudgets(userId: string, branchId: string, month: string) {
    return await BudgetRepository.findByMonth(userId, branchId, month);
  }

  static async getMonthSummary(userId: string, branchId: string, month: string) {
    return await BudgetRepository.getMonthSummary(userId, branchId, month);
  }

  static async getBudgetById(budgetId: string, userId: string) {
    return await BudgetRepository.findById(budgetId, userId);
  }

  static async createBudget(input: CreateBudgetInput, userId: string) {
    // 1. Verificar limite do plano (budgets não têm branchId explícito, usar userId)
    const usageCheck = await UsageService.checkUsageLimit(userId, 'budget');

    if (!usageCheck.allowed) {
      throw new Error(
        `Limite de ${usageCheck.limit} orçamentos atingido. ` +
        `Você está usando ${usageCheck.current}/${usageCheck.limit} orçamentos disponíveis no plano ${usageCheck.planName}. ` +
        `Faça upgrade para criar mais orçamentos.`
      );
    }

    // 2. Criar orçamento
    return await BudgetRepository.create(input, userId);
  }

  static async updateBudget(budgetId: string, input: UpdateBudgetInput, userId: string) {
    return await BudgetRepository.update(budgetId, input, userId);
  }

  static async deleteBudget(budgetId: string, userId: string) {
    return await BudgetRepository.delete(budgetId, userId);
  }

  static async copyFromPreviousMonth(userId: string, branchId: string, targetMonth: string) {
    return await BudgetRepository.copyFromPreviousMonth(userId, branchId, targetMonth);
  }
}

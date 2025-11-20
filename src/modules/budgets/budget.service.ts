import { BudgetRepository } from "./budget.repository";
import type { CreateBudgetInput, UpdateBudgetInput } from "./budget.schema";

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

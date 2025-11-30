import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { CreateBudgetInput, UpdateBudgetInput, BudgetWithStats } from "./budget.schema";

type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export class BudgetRepository {
  // Buscar orçamentos de um mês específico com estatísticas
  static async findByMonth(userId: string, branchId: string, month: string): Promise<BudgetWithStats[]> {
    const supabase = await createClient();

    // Buscar orçamentos do mês
    const { data: budgets, error } = await supabase
      .from("budgets")
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq("user_id", userId)
      .eq("month", month);

    if (error) throw new Error(error.message);
    if (!budgets) return [];

    // Calcular estatísticas para cada orçamento
    const budgetsWithStats = await Promise.all(
      budgets.map((budget: any) => this.calculateBudgetStats(budget, branchId, month))
    );

    return budgetsWithStats;
  }

  // Calcular estatísticas de um orçamento
  private static async calculateBudgetStats(budget: any, branchId: string, month: string): Promise<BudgetWithStats> {
    const supabase = await createClient();

    // Calcular primeiro e último dia do mês (parse manual para evitar problemas de fuso horário)
    const [year, monthNum] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    const today = new Date();

    // Dias restantes no mês (se estiver no mês atual)
    const isCurrentMonth =
      today.getFullYear() === year &&
      today.getMonth() === monthNum - 1;

    const daysRemaining = isCurrentMonth
      ? Math.max(1, lastDay.getDate() - today.getDate() + 1)
      : lastDay.getDate();

    // Formatar datas como string YYYY-MM-DD
    const firstDayStr = `${year}-${String(monthNum).padStart(2, '0')}-01`;
    const lastDayStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

    // Buscar gastos da categoria no mês atual
    const { data: transactions, error: transError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("category_id", budget.category_id)
      .eq("branch_id", branchId)
      .eq("type", "expense")
      .gte("due_date", firstDayStr)
      .lte("due_date", lastDayStr);

    console.log('Buscando transações:', {
      category: budget.categories?.name,
      firstDayStr,
      lastDayStr,
      found: transactions?.length,
      error: transError
    });

    const spent = transactions?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;

    // Buscar gastos do mês anterior para comparação
    const previousDate = new Date(year, monthNum - 1, 1);
    previousDate.setMonth(previousDate.getMonth() - 1);
    const prevYear = previousDate.getFullYear();
    const prevMonth = previousDate.getMonth() + 1;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();

    const previousFirstStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const previousLastStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;

    const { data: previousTransactions } = await supabase
      .from("transactions")
      .select("amount")
      .eq("category_id", budget.category_id)
      .eq("branch_id", branchId)
      .eq("type", "expense")
      .gte("due_date", previousFirstStr)
      .lte("due_date", previousLastStr);

    const previousMonthSpent = previousTransactions?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;

    // Calcular valores
    const budgetAmount = Number(budget.amount);
    const remaining = Math.max(0, budgetAmount - spent);
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    // Determinar status
    let status: 'ok' | 'warning' | 'danger' | 'exceeded' = 'ok';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= 90) status = 'danger';
    else if (percentage >= 80) status = 'warning';

    // Calcular saldo diário e semanal
    const totalDaysInMonth = lastDay.getDate();
    const dailyAvailable = remaining / daysRemaining; // Saldo diário para os dias restantes
    const dailyBudget = budgetAmount / totalDaysInMonth; // Média diária do orçamento total
    const weeklyAvailable = dailyBudget * 7; // Saldo semanal baseado na média mensal

    return {
      ...budget,
      category: budget.categories,
      spent,
      remaining,
      percentage,
      status,
      daily_available: dailyAvailable,
      weekly_available: weeklyAvailable,
      days_remaining: daysRemaining,
      previous_month_spent: previousMonthSpent,
    };
  }

  // Buscar resumo geral do mês
  static async getMonthSummary(userId: string, branchId: string, month: string) {
    const budgets = await this.findByMonth(userId, branchId, month);

    const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);
    const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
      total_budgeted: totalBudgeted,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      percentage: overallPercentage,
      budgets_count: budgets.length,
      exceeded_count: budgets.filter(b => b.status === 'exceeded').length,
      warning_count: budgets.filter(b => b.status === 'warning' || b.status === 'danger').length,
    };
  }

  // Buscar orçamento por ID
  static async findById(budgetId: string, userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("budgets")
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq("id", budgetId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Orçamento não encontrado");
      }
      throw new Error(error.message);
    }

    return data;
  }

  // Criar orçamento
  static async create(input: CreateBudgetInput, userId: string) {
    const supabase = await createClient();

    // Verificar se já existe orçamento para essa categoria nesse mês
    const { data: existing } = await supabase
      .from("budgets")
      .select("id")
      .eq("user_id", userId)
      .eq("category_id", input.category_id)
      .eq("month", input.month)
      .single();

    if (existing) {
      throw new Error("Já existe um orçamento para esta categoria neste mês");
    }

    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: userId,
        category_id: input.category_id,
        amount: input.amount,
        month: input.month,
        rollover: input.rollover || false,
        alert_80: input.alert_80 !== undefined ? input.alert_80 : true,
        alert_90: input.alert_90 !== undefined ? input.alert_90 : true,
        alert_100: input.alert_100 !== undefined ? input.alert_100 : true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Atualizar orçamento
  static async update(budgetId: string, input: UpdateBudgetInput, userId: string) {
    const supabase = await createClient();

    // Verificar se o orçamento pertence ao usuário
    const { data: budget } = await supabase
      .from("budgets")
      .select("user_id")
      .eq("id", budgetId)
      .single();

    if (!budget) {
      throw new Error("Orçamento não encontrado");
    }

    if (budget.user_id !== userId) {
      throw new Error("Você não tem permissão para atualizar este orçamento");
    }

    const { data, error } = await supabase
      .from("budgets")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", budgetId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Deletar orçamento
  static async delete(budgetId: string, userId: string) {
    const supabase = await createClient();

    // Verificar se o orçamento pertence ao usuário
    const { data: budget } = await supabase
      .from("budgets")
      .select("user_id")
      .eq("id", budgetId)
      .single();

    if (!budget) {
      throw new Error("Orçamento não encontrado");
    }

    if (budget.user_id !== userId) {
      throw new Error("Você não tem permissão para deletar este orçamento");
    }

    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", budgetId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  // Copiar orçamentos do mês anterior para o próximo mês
  static async copyFromPreviousMonth(userId: string, branchId: string, targetMonth: string) {
    const supabase = await createClient();

    // Calcular mês anterior (parse manual para evitar problemas de fuso horário)
    const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);
    const previousDate = new Date(targetYear, targetMonthNum - 1, 1); // month - 1 porque JS é 0-indexed
    previousDate.setMonth(previousDate.getMonth() - 1);
    const previousMonthStr = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}-01`;

    // Buscar orçamentos do mês anterior (filtrando por categorias do branch atual)
    const { data: previousBudgets } = await supabase
      .from("budgets")
      .select(`
        *,
        categories!inner (
          branch_id
        )
      `)
      .eq("user_id", userId)
      .eq("month", previousMonthStr)
      .eq("categories.branch_id", branchId);

    if (!previousBudgets || previousBudgets.length === 0) {
      const monthName = previousDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      throw new Error(`Não há orçamentos em ${monthName} para copiar`);
    }

    // Criar novos orçamentos baseados no mês anterior
    const newBudgets = previousBudgets.map((budget: any) => ({
      user_id: userId,
      category_id: budget.category_id,
      amount: budget.amount,
      month: targetMonth,
      rollover: budget.rollover,
      alert_80: budget.alert_80,
      alert_90: budget.alert_90,
      alert_100: budget.alert_100,
    }));

    const { data, error } = await supabase
      .from("budgets")
      .insert(newBudgets)
      .select();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existem orçamentos para este mês");
      }
      throw new Error(error.message);
    }

    return data;
  }
}

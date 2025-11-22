import { createClient } from "@/lib/supabase/server";
import type {
  CreateGoalInput,
  UpdateGoalInput,
  CreateContributionInput,
  GoalWithProgress,
  GoalContribution,
  ContributionWithDetails,
  Goal,
  ListGoalsFilters,
  GoalStatsResponse,
} from "./goal.schema";

export class GoalRepository {
  // =========================================
  // GOALS CRUD
  // =========================================

  // Listar todas as metas do usuário com progresso
  static async findAll(
    userId: string,
    branchId: string,
    filters?: ListGoalsFilters
  ): Promise<GoalWithProgress[]> {
    const supabase = await createClient();

    let query = supabase
      .from("goals")
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
      .eq("branch_id", branchId)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    // Aplicar filtros
    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }
    if (filters?.goal_type) {
      query = query.eq("goal_type", filters.goal_type);
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    const { data: goals, error } = await query;

    if (error) throw new Error(error.message);
    if (!goals) return [];

    // Calcular progresso para cada meta
    const goalsWithProgress = await Promise.all(
      goals.map((goal) => this.calculateGoalProgress(goal, branchId))
    );

    return goalsWithProgress;
  }

  // Buscar meta por ID com progresso
  static async findById(goalId: string, userId: string): Promise<GoalWithProgress | null> {
    const supabase = await createClient();

    const { data: goal, error } = await supabase
      .from("goals")
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq("id", goalId)
      .eq("user_id", userId)
      .single();

    if (error) throw new Error(error.message);
    if (!goal) return null;

    // Buscar branch_id da meta para usar no cálculo
    const goalWithProgress = await this.calculateGoalProgress(goal, goal.branch_id);
    return goalWithProgress;
  }

  // Criar nova meta
  static async create(userId: string, branchId: string, data: CreateGoalInput): Promise<Goal> {
    const supabase = await createClient();

    const { data: goal, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        branch_id: branchId,
        ...data,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return goal;
  }

  // Atualizar meta
  static async update(goalId: string, userId: string, data: UpdateGoalInput): Promise<Goal> {
    const supabase = await createClient();

    const { data: goal, error } = await supabase
      .from("goals")
      .update(data)
      .eq("id", goalId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return goal;
  }

  // Deletar meta
  static async delete(goalId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  // =========================================
  // CONTRIBUTIONS CRUD
  // =========================================

  // Listar contribuições de uma meta
  static async findContributions(
    goalId: string,
    userId: string
  ): Promise<ContributionWithDetails[]> {
    const supabase = await createClient();

    const { data: contributions, error } = await supabase
      .from("goal_contributions")
      .select(`
        *,
        transactions (
          id,
          description,
          amount,
          type
        ),
        users!goal_contributions_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq("goal_id", goalId)
      .order("contributed_at", { ascending: false });

    if (error) throw new Error(error.message);
    if (!contributions) return [];

    return contributions.map((contrib) => ({
      ...contrib,
      transaction: contrib.transactions || null,
      user: contrib.users,
    }));
  }

  // Criar contribuição
  static async createContribution(
    goalId: string,
    userId: string,
    data: CreateContributionInput
  ): Promise<GoalContribution> {
    const supabase = await createClient();

    const { data: contribution, error } = await supabase
      .from("goal_contributions")
      .insert({
        goal_id: goalId,
        user_id: userId,
        amount: data.amount,
        notes: data.notes || null,
        transaction_id: data.transaction_id || null,
        contributed_at: data.contributed_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return contribution;
  }

  // Deletar contribuição
  static async deleteContribution(contributionId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("goal_contributions")
      .delete()
      .eq("id", contributionId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  // =========================================
  // STATISTICS & CALCULATIONS
  // =========================================

  // Calcular progresso de uma meta
  private static async calculateGoalProgress(goal: any, branchId: string): Promise<GoalWithProgress> {
    const targetAmount = Number(goal.target_amount);
    const currentAmount = Number(goal.current_amount);
    const remainingAmount = Math.max(0, targetAmount - currentAmount);
    const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

    // Determinar status
    let status: 'not_started' | 'in_progress' | 'almost_there' | 'achieved' = 'not_started';
    if (goal.achieved_at || progressPercentage >= 100) {
      status = 'achieved';
    } else if (progressPercentage >= 75) {
      status = 'almost_there';
    } else if (progressPercentage > 0) {
      status = 'in_progress';
    }

    // Calcular média mensal de contribuições
    const monthlyAverage = await this.calculateMonthlyAverage(goal.id);
    const totalContributions = await this.getTotalContributions(goal.id);

    // Calcular projeção de data de alcance
    let projectedDate: string | null = null;
    if (monthlyAverage > 0 && remainingAmount > 0 && status !== 'achieved') {
      const monthsNeeded = Math.ceil(remainingAmount / monthlyAverage);
      const projected = new Date();
      projected.setMonth(projected.getMonth() + monthsNeeded);
      projectedDate = projected.toISOString().split('T')[0];
    }

    // Calcular dias até a data alvo
    let daysUntilTarget: number | null = null;
    let isOverdue = false;
    let monthlyNeeded: number | null = null;

    if (goal.target_date) {
      const targetDate = new Date(goal.target_date);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      daysUntilTarget = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isOverdue = daysUntilTarget < 0 && status !== 'achieved';

      // Calcular quanto precisa contribuir por mês para atingir no prazo
      if (daysUntilTarget > 0 && remainingAmount > 0) {
        const monthsUntilTarget = Math.max(1, daysUntilTarget / 30);
        monthlyNeeded = remainingAmount / monthsUntilTarget;
      }
    }

    return {
      ...goal,
      category: goal.categories || null,
      progress_percentage: Math.min(progressPercentage, 100),
      remaining_amount: remainingAmount,
      status,
      projected_date: projectedDate,
      monthly_average: monthlyAverage,
      total_contributions: totalContributions,
      days_until_target: daysUntilTarget,
      is_overdue: isOverdue,
      monthly_needed: monthlyNeeded,
    };
  }

  // Calcular média mensal de contribuições
  private static async calculateMonthlyAverage(goalId: string): Promise<number> {
    const supabase = await createClient();

    const { data: contributions, error } = await supabase
      .from("goal_contributions")
      .select("amount, contributed_at")
      .eq("goal_id", goalId)
      .order("contributed_at", { ascending: true });

    if (error || !contributions || contributions.length === 0) return 0;

    // Calcular diferença em meses entre primeira e última contribuição
    const firstDate = new Date(contributions[0].contributed_at);
    const lastDate = new Date(contributions[contributions.length - 1].contributed_at);
    const monthsDiff = Math.max(
      1,
      (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
        (lastDate.getMonth() - firstDate.getMonth()) + 1
    );

    const totalAmount = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
    return totalAmount / monthsDiff;
  }

  // Obter total de contribuições
  private static async getTotalContributions(goalId: string): Promise<number> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("goal_contributions")
      .select("*", { count: "exact", head: true })
      .eq("goal_id", goalId);

    if (error) return 0;
    return count || 0;
  }

  // Obter estatísticas gerais das metas
  static async getStats(userId: string, branchId: string): Promise<GoalStatsResponse> {
    const supabase = await createClient();

    const { data: goals, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("branch_id", branchId);

    if (error) throw new Error(error.message);
    if (!goals || goals.length === 0) {
      return {
        total_goals: 0,
        active_goals: 0,
        achieved_goals: 0,
        total_target_amount: 0,
        total_current_amount: 0,
        overall_progress: 0,
        goals_by_type: {
          emergency_fund: 0,
          savings: 0,
          debt_payoff: 0,
          purchase: 0,
        },
        goals_by_priority: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
      };
    }

    const totalGoals = goals.length;
    const activeGoals = goals.filter((g) => g.is_active).length;
    const achievedGoals = goals.filter((g) => g.achieved_at !== null).length;
    const totalTargetAmount = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    const goalsByType = {
      emergency_fund: goals.filter((g) => g.goal_type === 'emergency_fund').length,
      savings: goals.filter((g) => g.goal_type === 'savings').length,
      debt_payoff: goals.filter((g) => g.goal_type === 'debt_payoff').length,
      purchase: goals.filter((g) => g.goal_type === 'purchase').length,
    };

    const goalsByPriority = {
      critical: goals.filter((g) => g.priority === 'critical').length,
      high: goals.filter((g) => g.priority === 'high').length,
      medium: goals.filter((g) => g.priority === 'medium').length,
      low: goals.filter((g) => g.priority === 'low').length,
    };

    return {
      total_goals: totalGoals,
      active_goals: activeGoals,
      achieved_goals: achievedGoals,
      total_target_amount: totalTargetAmount,
      total_current_amount: totalCurrentAmount,
      overall_progress: overallProgress,
      goals_by_type: goalsByType,
      goals_by_priority: goalsByPriority,
    };
  }

  // Calcular valor sugerido para reserva de emergência
  static async calculateEmergencyFundSuggestion(userId: string, branchId: string): Promise<number> {
    const supabase = await createClient();

    // Buscar despesas fixas dos últimos 3 meses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const dateStr = threeMonthsAgo.toISOString().split('T')[0];

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("amount, due_date")
      .eq("user_id", userId)
      .eq("branch_id", branchId)
      .eq("type", "expense")
      .gte("due_date", dateStr);

    if (error || !transactions || transactions.length === 0) {
      // Valor padrão se não tiver histórico
      return 10000;
    }

    // Calcular média mensal
    const totalExpenses = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const monthlyAverage = totalExpenses / 3;

    // Sugerir 6 meses de despesas
    return Math.round(monthlyAverage * 6);
  }
}

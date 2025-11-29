import { supabaseAdmin } from '@/lib/supabase/admin';

export type ResourceType =
  | 'transaction'
  | 'category'
  | 'goal'
  | 'budget'
  | 'team_member'
  | 'branch'
  | 'reminder';

export interface UsageLimitResult {
  allowed: boolean;
  current: number;
  limit: number | null;
  planName: string;
  percentage?: number;
}

export interface FeatureAccess {
  hasAccess: boolean;
  planName: string;
}

export class UsageService {
  /**
   * Verifica se usuário pode criar um novo recurso baseado no plano dele
   */
  static async checkUsageLimit(
    userId: string,
    resourceType: ResourceType,
    branchId?: string
  ): Promise<UsageLimitResult> {
    // 1. Buscar plano do usuário
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(
        `
        subscription_plan_id,
        is_early_adopter,
        subscription_plans (
          name,
          display_name,
          max_transactions,
          max_categories,
          max_goals,
          max_budgets,
          max_team_members,
          max_branches,
          max_reminders
        )
      `
      )
      .eq('id', userId)
      .single();

    if (userError || !user?.subscription_plans) {
      throw new Error('Plano não encontrado');
    }

    const plan = user.subscription_plans as any;

    // 2. Mapear limite baseado no tipo de recurso
    const limitMap: Record<ResourceType, number | null> = {
      transaction: plan.max_transactions,
      category: plan.max_categories,
      goal: plan.max_goals,
      budget: plan.max_budgets,
      team_member: plan.max_team_members,
      branch: plan.max_branches,
      reminder: plan.max_reminders,
    };

    const limit = limitMap[resourceType];

    // null = ilimitado
    if (limit === null) {
      return {
        allowed: true,
        current: 0,
        limit: null,
        planName: plan.display_name,
      };
    }

    // 3. Contar uso atual
    const current = await this.getCurrentUsage(userId, resourceType, branchId);

    // 4. Verificar se pode criar
    const allowed = current < limit;
    const percentage = Math.round((current / limit) * 100);

    return {
      allowed,
      current,
      limit,
      planName: plan.display_name,
      percentage,
    };
  }

  /**
   * Conta quantos recursos o usuário já usou no período
   */
  private static async getCurrentUsage(
    userId: string,
    resourceType: ResourceType,
    branchId?: string
  ): Promise<number> {
    const tableName = this.getTableName(resourceType);

    // Para transações, contar apenas do mês atual
    if (resourceType === 'transaction') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      let query = supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .gte('date', startOfMonth.toISOString().split('T')[0]);

      // Se for por branch
      if (branchId) {
        query = query.eq('branch_id', branchId);
      } else {
        // Se não tem branch, buscar transações do usuário
        query = query.eq('user_id', userId);
      }

      const { count } = await query;
      return count || 0;
    }

    // Para branches, contar apenas as que o usuário é owner
    if (resourceType === 'branch') {
      const { count } = await supabaseAdmin
        .from('branch_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('role', 'owner');

      return count || 0;
    }

    // Para team_members, contar membros de uma branch específica
    if (resourceType === 'team_member' && branchId) {
      const { count } = await supabaseAdmin
        .from('branch_members')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId);

      return count || 0;
    }

    // Para outros recursos (categorias, metas, orçamentos), contar total por branch
    if (branchId) {
      const { count } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId);

      return count || 0;
    }

    // Fallback: contar por user_id
    const { count } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return count || 0;
  }

  /**
   * Mapeia tipo de recurso para nome da tabela
   */
  private static getTableName(resourceType: ResourceType): string {
    const tableMap: Record<ResourceType, string> = {
      transaction: 'transactions',
      category: 'categories',
      goal: 'goals',
      budget: 'budgets',
      team_member: 'branch_members',
      branch: 'branch_members',
      reminder: 'reminders',
    };
    return tableMap[resourceType];
  }

  /**
   * Verifica se usuário tem acesso a feature específica
   */
  static async hasFeatureAccess(
    userId: string,
    feature: 'advanced_reports' | 'export_csv' | 'export_pdf' | 'export_excel'
  ): Promise<FeatureAccess> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(
        `
        subscription_plans (
          display_name,
          has_advanced_reports,
          export_formats
        )
      `
      )
      .eq('id', userId)
      .single();

    if (error || !user?.subscription_plans) {
      return { hasAccess: false, planName: 'Desconhecido' };
    }

    const plan = user.subscription_plans as any;

    // Verificar feature
    if (feature === 'advanced_reports') {
      return {
        hasAccess: plan.has_advanced_reports || false,
        planName: plan.display_name,
      };
    }

    // Verificar exportação
    const exportMap: Record<string, string> = {
      export_csv: 'csv',
      export_pdf: 'pdf',
      export_excel: 'excel',
    };

    const format = exportMap[feature];
    const hasAccess = plan.export_formats?.includes(format) || false;

    return {
      hasAccess,
      planName: plan.display_name,
    };
  }

  /**
   * Retorna informações completas do plano do usuário
   */
  static async getUserPlan(userId: string) {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(
        `
        subscription_plan_id,
        subscription_status,
        is_early_adopter,
        subscription_plans (
          name,
          display_name,
          max_transactions,
          max_categories,
          max_goals,
          max_budgets,
          max_team_members,
          max_branches,
          max_reminders,
          has_advanced_reports,
          export_formats,
          support_level,
          history_months
        )
      `
      )
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('Usuário não encontrado');
    }

    return {
      plan: user.subscription_plans,
      status: user.subscription_status,
      isEarlyAdopter: user.is_early_adopter,
    };
  }
}

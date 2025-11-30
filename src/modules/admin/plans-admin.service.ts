import { supabaseAdmin } from '@/lib/supabase/admin';

export class PlansAdminService {
  /**
   * Listar todos os planos (incluindo inativos)
   */
  static async listAll() {
    const { data, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Buscar plano por ID
   */
  static async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Criar novo plano
   */
  static async create(planData: any) {
    const { data, error } = await supabaseAdmin
      .from('subscription_plans')
      .insert(planData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualizar plano
   */
  static async update(id: string, planData: any) {
    const { data, error } = await supabaseAdmin
      .from('subscription_plans')
      .update({ ...planData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deletar plano (soft delete - marca como inativo)
   */
  static async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('subscription_plans')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Plano desativado com sucesso' };
  }

  /**
   * Estatísticas de uso de planos
   */
  static async getStats() {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        subscription_plan_id,
        subscription_plans (
          name,
          display_name
        )
      `);

    if (error) throw error;

    // Contar usuários por plano
    const stats = users.reduce((acc: any, user: any) => {
      const planName = user.subscription_plans?.display_name || 'Sem plano';
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {});

    return stats;
  }

  /**
   * Obter configuração de assinaturas
   */
  static async getSubscriptionConfig() {
    const { data, error } = await supabaseAdmin
      .from('system_config')
      .select('*')
      .eq('key', 'subscriptions_enabled')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Ativar/Desativar sistema de assinaturas
   */
  static async toggleSubscriptions(enabled: boolean, adminUserId: string) {
    const { error } = await supabaseAdmin
      .from('system_config')
      .update({
        value: enabled.toString(),
        updated_at: new Date().toISOString(),
        updated_by: adminUserId,
      })
      .eq('key', 'subscriptions_enabled');

    if (error) throw error;
    return { enabled, message: `Assinaturas ${enabled ? 'ativadas' : 'desativadas'} com sucesso` };
  }
}

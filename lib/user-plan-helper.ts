import { createClient } from "@/lib/supabase/server";

export type UserPlanData = {
  userPlanName: string;
  isEarlyAdopter: boolean;
  isAdmin: boolean;
  planData: any | null;
};

/**
 * Helper centralizado para buscar dados do plano do usuário
 * Usado em todas as páginas para garantir consistência
 */
export async function getUserPlanData(userId: string): Promise<UserPlanData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select(`
      subscription_plan_id,
      subscription_status,
      is_early_adopter,
      is_admin,
      subscription_plans!inner (
        id,
        name,
        display_name
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user plan:', error);
    return {
      userPlanName: 'free',
      isEarlyAdopter: false,
      isAdmin: false,
      planData: null
    };
  }

  return {
    userPlanName: data?.subscription_plans?.name || 'free',
    isEarlyAdopter: data?.is_early_adopter || false,
    isAdmin: data?.is_admin || false,
    planData: data
  };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function togglePlanFeature(planId: string, featureId: string, enabled: boolean) {
  const supabase = await createClient();

  // Verify user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_admin) {
    return { error: "Sem permissão" };
  }

  if (enabled) {
    // Add feature to plan
    const { error } = await supabase
      .from('plan_features')
      .insert({ plan_id: planId, feature_id: featureId });

    if (error) {
      console.error('Error adding feature to plan:', error);
      return { error: "Erro ao adicionar feature" };
    }
  } else {
    // Remove feature from plan
    const { error } = await supabase
      .from('plan_features')
      .delete()
      .eq('plan_id', planId)
      .eq('feature_id', featureId);

    if (error) {
      console.error('Error removing feature from plan:', error);
      return { error: "Erro ao remover feature" };
    }
  }

  revalidatePath('/admin/features');
  revalidatePath('/dashboard');
  revalidatePath('/financeiro');
  revalidatePath('/relatorios');
  revalidatePath('/categorias');
  revalidatePath('/orcamentos');
  revalidatePath('/metas');
  revalidatePath('/lembretes');
  revalidatePath('/equipe');
  revalidatePath('/configuracoes');

  return { success: true };
}

export async function getPlanFeaturesMatrix() {
  const supabase = await createClient();

  // Get all plans
  const { data: plansData, error: plansError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true);

  if (plansError || !plansData) {
    console.error('Error fetching plans:', plansError);
    return { plans: [], features: [], matrix: {} };
  }

  // Sort plans in logical order: initial_launch, free, basic, pro, business
  const planOrder = ['initial_launch', 'free', 'basic', 'pro', 'business'];
  const plans = plansData.sort((a, b) => {
    const aIndex = planOrder.indexOf(a.name);
    const bIndex = planOrder.indexOf(b.name);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Get all non-core features
  const { data: features, error: featuresError } = await supabase
    .from('features')
    .select('*')
    .eq('is_core', false)
    .order('sort_order', { ascending: true });

  if (featuresError || !features) {
    console.error('Error fetching features:', featuresError);
    return { plans, features: [], matrix: {} };
  }

  // Get all plan_features relationships
  const { data: planFeatures, error: pfError } = await supabase
    .from('plan_features')
    .select('plan_id, feature_id');

  if (pfError) {
    console.error('Error fetching plan features:', pfError);
    return { plans, features, matrix: {} };
  }

  // Build matrix: { [planId]: { [featureId]: boolean } }
  const matrix: Record<string, Record<string, boolean>> = {};

  plans.forEach(plan => {
    matrix[plan.id] = {};
    features.forEach(feature => {
      const hasFeature = planFeatures?.some(
        pf => pf.plan_id === plan.id && pf.feature_id === feature.id
      ) || false;
      matrix[plan.id][feature.id] = hasFeature;
    });
  });

  return { plans, features, matrix };
}

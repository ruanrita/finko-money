import { createClient } from "@/lib/supabase/server";

export type Feature = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  path: string;
  icon: string | null;
  is_core: boolean;
  sort_order: number;
};

export type UserFeatureAccess = {
  feature: Feature;
  hasAccess: boolean;
  isCore: boolean;
};

/**
 * Get all features from the database
 */
export async function getAllFeatures(): Promise<Feature[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('features')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching features:', error);
    return [];
  }

  return data || [];
}

/**
 * Get features available for a specific plan
 */
export async function getPlanFeatures(planId: string): Promise<Feature[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('plan_features')
    .select(`
      features (
        id,
        name,
        display_name,
        description,
        path,
        icon,
        is_core,
        sort_order
      )
    `)
    .eq('plan_id', planId);

  if (error) {
    console.error('Error fetching plan features:', error);
    return [];
  }

  // Extract features from the join result
  const features = data?.map((item: any) => item.features).filter(Boolean) || [];
  return features;
}

/**
 * Check if a user has access to a specific feature
 */
export async function userHasFeatureAccess(
  userId: string,
  featurePath: string
): Promise<boolean> {
  const supabase = await createClient();

  // Use the database function for consistent logic
  const { data, error } = await supabase.rpc('user_has_feature_access', {
    user_id_param: userId,
    feature_path_param: featurePath
  });

  if (error) {
    console.error('Error checking feature access:', error);
    // Fail open - allow access on error to prevent lockouts
    return true;
  }

  return data || false;
}

/**
 * Get all features with access status for a user
 * This is used for rendering the navigation
 */
export async function getUserFeaturesWithAccess(userId: string): Promise<UserFeatureAccess[]> {
  const supabase = await createClient();

  // Get user info
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('is_admin, is_early_adopter, subscription_plan_id')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    console.error('Error fetching user data:', userError);
    return [];
  }

  const isAdmin = userData.is_admin || false;
  const isEarlyAdopter = userData.is_early_adopter || false;
  const planId = userData.subscription_plan_id;

  // Get all features
  const allFeatures = await getAllFeatures();

  // If admin or early adopter, all features are accessible
  if (isAdmin || isEarlyAdopter) {
    return allFeatures.map(feature => ({
      feature,
      hasAccess: true,
      isCore: feature.is_core
    }));
  }

  // Get plan features
  const planFeatures = planId ? await getPlanFeatures(planId) : [];
  const planFeatureIds = new Set(planFeatures.map(f => f.id));

  // Map features to access status
  return allFeatures.map(feature => ({
    feature,
    hasAccess: feature.is_core || planFeatureIds.has(feature.id),
    isCore: feature.is_core
  }));
}

/**
 * Get the minimum plan required for a feature
 * Returns the cheapest plan that includes this feature
 */
export async function getMinimumPlanForFeature(featurePath: string): Promise<{
  planName: string;
  displayName: string;
  price: number;
} | null> {
  const supabase = await createClient();

  // Get feature
  const { data: feature, error: featureError } = await supabase
    .from('features')
    .select('id, is_core')
    .eq('path', featurePath)
    .single();

  if (featureError || !feature) {
    return null;
  }

  // Core features don't require a plan
  if (feature.is_core) {
    return null;
  }

  // Get all plans that include this feature, ordered by price
  const { data: planData, error: planError } = await supabase
    .from('plan_features')
    .select(`
      subscription_plans!inner (
        id,
        name,
        display_name,
        monthly_price_cents
      )
    `)
    .eq('feature_id', feature.id)
    .order('subscription_plans(monthly_price_cents)', { ascending: true })
    .limit(1);

  if (planError || !planData || planData.length === 0) {
    return null;
  }

  const plan = (planData[0] as any).subscription_plans;
  return {
    planName: plan.name,
    displayName: plan.display_name,
    price: plan.monthly_price_cents / 100
  };
}

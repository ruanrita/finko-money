/**
 * Sistema de Features por Plano
 *
 * IMPORTANTE: Por enquanto, todas as features estão disponíveis em todos os planos
 * O que muda são os LIMITES de uso (transações/mês, categorias, etc.)
 * O controle de limites é feito no backend via hooks useCanCreate
 *
 * No futuro, features específicas podem ser bloqueadas para planos inferiores
 * usando o campo 'availableInFree'
 */

export type PlanFeature = {
  path: string;
  name: string;
  minPlan: 'free' | 'basic' | 'pro' | 'business';
  availableInFree: boolean; // Define se a feature está disponível no plano free
};

/**
 * Mapeamento de features e seus requisitos de plano
 */
export const PLAN_FEATURES: PlanFeature[] = [
  // TODAS as features atuais estão disponíveis no free
  { path: '/dashboard', name: 'Dashboard', minPlan: 'free', availableInFree: true },
  { path: '/financeiro', name: 'Despesas e Receitas', minPlan: 'free', availableInFree: true },
  { path: '/categorias', name: 'Categorias', minPlan: 'free', availableInFree: true },
  { path: '/orcamentos', name: 'Orçamentos', minPlan: 'free', availableInFree: true },
  { path: '/metas', name: 'Metas', minPlan: 'free', availableInFree: true },
  { path: '/lembretes', name: 'Lembretes', minPlan: 'free', availableInFree: true },
  { path: '/relatorios', name: 'Relatórios', minPlan: 'free', availableInFree: true },
  { path: '/equipe', name: 'Equipe', minPlan: 'free', availableInFree: true },
  { path: '/configuracoes', name: 'Configurações', minPlan: 'free', availableInFree: true },

  // Exemplo de feature futura que seria bloqueada no free:
  // { path: '/analytics', name: 'Analytics Avançado', minPlan: 'pro', availableInFree: false },
  // { path: '/api-access', name: 'API Access', minPlan: 'business', availableInFree: false },
];

/**
 * Planos e seus preços (para comparação)
 */
export const PLAN_PRICES: Record<string, number> = {
  'free': 0,
  'basic': 19.90,
  'pro': 29.90,
  'business': 99.90,
  'initial_launch': 999, // Early adopter - maior que todos para ter acesso total
};

/**
 * Nomes de exibição dos planos
 */
export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  'free': 'Grátis',
  'basic': 'Básico',
  'pro': 'Pro',
  'business': 'Business',
  'initial_launch': 'Early Adopter',
};

/**
 * Verifica se o usuário tem acesso a uma feature baseado no seu plano
 *
 * @param userPlanName - Nome do plano do usuário
 * @param featurePath - Caminho da feature (ex: '/dashboard')
 * @param isEarlyAdopter - Se o usuário é early adopter
 * @returns true se tem acesso, false caso contrário
 */
export function hasAccessToFeature(
  userPlanName: string,
  featurePath: string,
  isEarlyAdopter: boolean = false
): boolean {
  // Early adopters têm acesso a tudo sempre
  if (isEarlyAdopter) return true;

  const feature = PLAN_FEATURES.find(f => f.path === featurePath);

  // Se a feature não está mapeada, permite acesso por padrão
  if (!feature) return true;

  // Verifica se o plano é free
  if (userPlanName === 'free') {
    return feature.availableInFree;
  }

  // Para outros planos, verifica se o preço do plano é >= preço mínimo
  const userPlanPrice = PLAN_PRICES[userPlanName] ?? 0;
  const minPlanPrice = PLAN_PRICES[feature.minPlan] ?? 0;

  return userPlanPrice >= minPlanPrice;
}

/**
 * Retorna o próximo plano que desbloqueia uma feature
 *
 * @param userPlanName - Nome do plano do usuário
 * @param featurePath - Caminho da feature
 * @returns Informações do plano necessário ou null se já tem acesso
 */
export function getUpgradePlanForFeature(
  userPlanName: string,
  featurePath: string
): { planName: string; displayName: string; price: number } | null {
  const feature = PLAN_FEATURES.find(f => f.path === featurePath);
  if (!feature) return null;

  const userPlanPrice = PLAN_PRICES[userPlanName] ?? 0;
  const minPlanPrice = PLAN_PRICES[feature.minPlan] ?? 0;

  // Se já tem acesso, não precisa upgrade
  if (userPlanPrice >= minPlanPrice && (userPlanName !== 'free' || feature.availableInFree)) {
    return null;
  }

  return {
    planName: feature.minPlan,
    displayName: PLAN_DISPLAY_NAMES[feature.minPlan] || feature.minPlan,
    price: minPlanPrice,
  };
}

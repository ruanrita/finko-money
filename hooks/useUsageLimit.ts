'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export type ResourceType =
  | 'transaction'
  | 'category'
  | 'goal'
  | 'budget'
  | 'team_member'
  | 'branch'
  | 'reminder';

export interface UsageLimitInfo {
  allowed: boolean;
  current: number;
  limit: number | null;
  planName: string;
  percentage?: number;
}

export interface UseUsageLimitReturn {
  usageInfo: UsageLimitInfo | null;
  isLoading: boolean;
  canCreate: () => boolean;
  checkUsage: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook para verificar limites de uso de recursos baseado no plano do usuário
 *
 * @param resourceType - Tipo de recurso a verificar ('transaction', 'category', etc.)
 * @param branchId - ID do branch (opcional, usado para recursos específicos de branch)
 * @param showWarnings - Mostrar toasts de aviso quando próximo ou atingir o limite (padrão: true)
 *
 * @example
 * ```tsx
 * const { canCreate, usageInfo } = useUsageLimit('transaction');
 *
 * const handleCreateTransaction = () => {
 *   if (!canCreate()) {
 *     return; // Bloqueado pelo limite
 *   }
 *   // Criar transação...
 * };
 * ```
 */
export function useUsageLimit(
  resourceType: ResourceType,
  branchId?: string,
  showWarnings: boolean = true
): UseUsageLimitReturn {
  const [usageInfo, setUsageInfo] = useState<UsageLimitInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ type: resourceType });
      if (branchId) {
        params.append('branchId', branchId);
      }

      const response = await fetch(`/api/usage/check?${params.toString()}`);
      const { data, error } = await response.json();

      if (error) {
        console.error('Erro ao verificar limite:', error);
        setUsageInfo(null);
        return;
      }

      setUsageInfo(data);
    } catch (error) {
      console.error('Erro ao verificar limite:', error);
      setUsageInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [resourceType, branchId]);

  useEffect(() => {
    checkUsage();
  }, [checkUsage]);

  const canCreate = useCallback((): boolean => {
    if (!usageInfo) return true; // Se não conseguiu carregar, permite (fail-safe)

    if (!usageInfo.allowed) {
      if (showWarnings) {
        const resourceLabels: Record<ResourceType, string> = {
          transaction: 'transações',
          category: 'categorias',
          goal: 'metas',
          budget: 'orçamentos',
          team_member: 'membros da equipe',
          branch: 'branches',
          reminder: 'lembretes',
        };

        toast.error('Limite atingido', {
          description: `Você atingiu o limite de ${usageInfo.limit} ${resourceLabels[resourceType]} do seu plano ${usageInfo.planName}. Faça upgrade para continuar.`,
          action: {
            label: 'Ver Planos',
            onClick: () => (window.location.href = '/pricing'),
          },
        });
      }
      return false;
    }

    // Avisar quando próximo do limite (80%)
    if (
      showWarnings &&
      usageInfo.limit &&
      usageInfo.percentage &&
      usageInfo.percentage >= 80 &&
      usageInfo.percentage < 100
    ) {
      const resourceLabels: Record<ResourceType, string> = {
        transaction: 'transações',
        category: 'categorias',
        goal: 'metas',
        budget: 'orçamentos',
        team_member: 'membros da equipe',
        branch: 'branches',
        reminder: 'lembretes',
      };

      toast.warning('Próximo do limite', {
        description: `Você está usando ${usageInfo.current} de ${usageInfo.limit} ${resourceLabels[resourceType]} disponíveis (${usageInfo.percentage}%).`,
      });
    }

    return true;
  }, [usageInfo, resourceType, showWarnings]);

  return {
    usageInfo,
    isLoading,
    canCreate,
    checkUsage,
    refetch: checkUsage,
  };
}

/**
 * Hook para verificar acesso a features específicas do plano
 *
 * @param feature - Nome da feature a verificar
 *
 * @example
 * ```tsx
 * const { hasAccess } = useFeatureAccess('export_pdf');
 *
 * if (!hasAccess) {
 *   // Mostrar mensagem de upgrade
 * }
 * ```
 */
export function useFeatureAccess(
  feature: 'advanced_reports' | 'export_csv' | 'export_pdf' | 'export_excel'
) {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [planName, setPlanName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/usage/feature?name=${feature}`);
        const { data, error } = await response.json();

        if (error) {
          console.error('Erro ao verificar acesso:', error);
          return;
        }

        setHasAccess(data.hasAccess);
        setPlanName(data.planName);
      } catch (error) {
        console.error('Erro ao verificar acesso:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [feature]);

  return { hasAccess, planName, isLoading };
}

/**
 * Hook para obter informações completas do plano do usuário
 *
 * @example
 * ```tsx
 * const { plan, isEarlyAdopter } = useUserPlan();
 *
 * return (
 *   <div>
 *     Plano: {plan?.display_name}
 *     {isEarlyAdopter && <Badge>Early Adopter</Badge>}
 *   </div>
 * );
 * ```
 */
export function useUserPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const [isEarlyAdopter, setIsEarlyAdopter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/usage/plan');
      const { data, error } = await response.json();

      if (error) {
        console.error('Erro ao buscar plano:', error);
        return;
      }

      setPlan(data.plan);
      setStatus(data.status);
      setIsEarlyAdopter(data.isEarlyAdopter);
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    plan,
    status,
    isEarlyAdopter,
    isLoading,
    refetch,
  };
}

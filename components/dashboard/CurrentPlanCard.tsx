'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PlanInfo = {
  planName: string;
  isEarlyAdopter: boolean;
  limits: {
    transactions: { current: number; limit: number | null };
    categories: { current: number; limit: number | null };
    goals: { current: number; limit: number | null };
    budgets: { current: number; limit: number | null };
  };
};

export function CurrentPlanCard() {
  const router = useRouter();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlanInfo();
  }, []);

  async function loadPlanInfo() {
    try {
      setLoading(true);

      // Buscar informações do plano
      const planRes = await fetch('/api/usage/plan');
      if (!planRes.ok) throw new Error('Erro ao carregar plano');
      const planData = await planRes.json();

      // Buscar uso de cada recurso
      const [transactionsRes, categoriesRes, goalsRes, budgetsRes] = await Promise.all([
        fetch('/api/usage/check?type=transaction'),
        fetch('/api/usage/check?type=category'),
        fetch('/api/usage/check?type=goal'),
        fetch('/api/usage/check?type=budget'),
      ]);

      const [transactions, categories, goals, budgets] = await Promise.all([
        transactionsRes.json(),
        categoriesRes.json(),
        goalsRes.json(),
        budgetsRes.json(),
      ]);

      setPlanInfo({
        planName: planData.plan?.display_name || 'Plano Desconhecido',
        isEarlyAdopter: planData.isEarlyAdopter || false,
        limits: {
          transactions: {
            current: transactions.data?.current || 0,
            limit: transactions.data?.limit,
          },
          categories: {
            current: categories.data?.current || 0,
            limit: categories.data?.limit,
          },
          goals: {
            current: goals.data?.current || 0,
            limit: goals.data?.limit,
          },
          budgets: {
            current: budgets.data?.current || 0,
            limit: budgets.data?.limit,
          },
        },
      });
    } catch (error) {
      console.error('Erro ao carregar informações do plano:', error);
    } finally {
      setLoading(false);
    }
  }

  function getPercentage(current: number, limit: number | null): number {
    if (limit === null) return 0;
    return Math.min((current / limit) * 100, 100);
  }

  function getProgressColor(percentage: number): string {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-primary';
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seu Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!planInfo) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {planInfo.isEarlyAdopter && <Crown className="h-5 w-5 text-yellow-500" />}
              {planInfo.planName}
            </CardTitle>
            <CardDescription>
              {planInfo.isEarlyAdopter
                ? 'Early Adopter - Acesso Vitalício'
                : 'Seu plano atual e uso de recursos'}
            </CardDescription>
          </div>
          {!planInfo.isEarlyAdopter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/pricing')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transações */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Transações este mês</span>
            <span className="text-muted-foreground">
              {planInfo.limits.transactions.current}/
              {planInfo.limits.transactions.limit === null
                ? '∞'
                : planInfo.limits.transactions.limit}
            </span>
          </div>
          {planInfo.limits.transactions.limit !== null && (
            <div className="space-y-1">
              <Progress
                value={getPercentage(
                  planInfo.limits.transactions.current,
                  planInfo.limits.transactions.limit
                )}
                className="h-2"
                indicatorClassName={getProgressColor(
                  getPercentage(
                    planInfo.limits.transactions.current,
                    planInfo.limits.transactions.limit
                  )
                )}
              />
              {getPercentage(
                planInfo.limits.transactions.current,
                planInfo.limits.transactions.limit
              ) >= 75 && (
                <p className="text-xs text-yellow-600">
                  Você está próximo do limite!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Categorias */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Categorias customizadas</span>
            <span className="text-muted-foreground">
              {planInfo.limits.categories.current}/
              {planInfo.limits.categories.limit === null
                ? '∞'
                : planInfo.limits.categories.limit}
            </span>
          </div>
          {planInfo.limits.categories.limit !== null && (
            <Progress
              value={getPercentage(
                planInfo.limits.categories.current,
                planInfo.limits.categories.limit
              )}
              className="h-2"
              indicatorClassName={getProgressColor(
                getPercentage(
                  planInfo.limits.categories.current,
                  planInfo.limits.categories.limit
                )
              )}
            />
          )}
        </div>

        {/* Metas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Metas financeiras</span>
            <span className="text-muted-foreground">
              {planInfo.limits.goals.current}/
              {planInfo.limits.goals.limit === null ? '∞' : planInfo.limits.goals.limit}
            </span>
          </div>
          {planInfo.limits.goals.limit !== null && (
            <Progress
              value={getPercentage(planInfo.limits.goals.current, planInfo.limits.goals.limit)}
              className="h-2"
              indicatorClassName={getProgressColor(
                getPercentage(planInfo.limits.goals.current, planInfo.limits.goals.limit)
              )}
            />
          )}
        </div>

        {/* Orçamentos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Orçamentos</span>
            <span className="text-muted-foreground">
              {planInfo.limits.budgets.current}/
              {planInfo.limits.budgets.limit === null ? '∞' : planInfo.limits.budgets.limit}
            </span>
          </div>
          {planInfo.limits.budgets.limit !== null && (
            <Progress
              value={getPercentage(planInfo.limits.budgets.current, planInfo.limits.budgets.limit)}
              className="h-2"
              indicatorClassName={getProgressColor(
                getPercentage(planInfo.limits.budgets.current, planInfo.limits.budgets.limit)
              )}
            />
          )}
        </div>

        {!planInfo.isEarlyAdopter && (
          <Button
            variant="link"
            className="w-full mt-4"
            onClick={() => router.push('/pricing')}
          >
            Ver todos os planos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

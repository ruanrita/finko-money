'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Plan = {
  id: string;
  name: string;
  display_name: string;
  max_transactions: number | null;
  max_categories: number | null;
  max_goals: number | null;
  max_budgets: number | null;
  max_team_members: number | null;
  max_branches: number | null;
  max_reminders: number | null;
  is_active: boolean;
};

type Stats = {
  [planName: string]: number;
};

export default function AdminPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Carregar planos
      const plansRes = await fetch('/api/admin/plans');
      if (!plansRes.ok) {
        throw new Error('Erro ao carregar planos');
      }
      const plansData = await plansRes.json();
      setPlans(plansData.data || []);

      // Carregar estatísticas
      const statsRes = await fetch('/api/admin/plans/stats');
      if (!statsRes.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }
      const statsData = await statsRes.json();
      setStats(statsData.data || {});

      // Carregar status de assinaturas
      const configRes = await fetch('/api/admin/subscriptions/toggle');
      if (!configRes.ok) {
        throw new Error('Erro ao carregar configuração');
      }
      const configData = await configRes.json();
      setSubscriptionsEnabled(configData.enabled || false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleSubscriptions(enabled: boolean) {
    setToggling(true);
    try {
      const res = await fetch('/api/admin/subscriptions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao alterar configuração');
      }

      const data = await res.json();
      setSubscriptionsEnabled(enabled);
      toast.success(data.message || `Assinaturas ${enabled ? 'ativadas' : 'desativadas'} com sucesso`);
    } catch (error: any) {
      toast.error(error.message);
      setSubscriptionsEnabled(!enabled); // Reverter
    } finally {
      setToggling(false);
    }
  }

  async function handleDeletePlan(planId: string, planName: string) {
    if (!confirm(`Deseja realmente desativar o plano "${planName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao desativar plano');
      }

      toast.success('Plano desativado com sucesso');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  const totalUsers = Object.values(stats).reduce((sum, count) => sum + count, 0);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciar Planos</h1>
        <p className="text-muted-foreground">
          Controle os planos de assinatura e suas limitações
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Distribuídos em {plans.length} planos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter((p) => p.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {plans.filter((p) => !p.is_active).length} inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema de Assinaturas</CardTitle>
            <Switch
              checked={subscriptionsEnabled}
              onCheckedChange={handleToggleSubscriptions}
              disabled={toggling}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptionsEnabled ? 'Ativo' : 'Inativo'}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionsEnabled
                ? 'Novos usuários ganham plano Free'
                : 'Novos usuários viram Early Adopters'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Planos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Planos Disponíveis</CardTitle>
              <CardDescription>
                Gerencie os planos e suas limitações de recursos
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/admin/plans/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead className="text-center">Usuários</TableHead>
                <TableHead className="text-center">Trans./mês</TableHead>
                <TableHead className="text-center">Categorias</TableHead>
                <TableHead className="text-center">Metas</TableHead>
                <TableHead className="text-center">Membros</TableHead>
                <TableHead className="text-center">Branches</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Nenhum plano encontrado
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{plan.display_name}</div>
                        <div className="text-xs text-muted-foreground">{plan.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {stats[plan.display_name] || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {plan.max_transactions === null ? '∞' : plan.max_transactions}
                    </TableCell>
                    <TableCell className="text-center">
                      {plan.max_categories === null ? '∞' : plan.max_categories}
                    </TableCell>
                    <TableCell className="text-center">
                      {plan.max_goals === null ? '∞' : plan.max_goals}
                    </TableCell>
                    <TableCell className="text-center">
                      {plan.max_team_members === null ? '∞' : plan.max_team_members}
                    </TableCell>
                    <TableCell className="text-center">
                      {plan.max_branches === null ? '∞' : plan.max_branches}
                    </TableCell>
                    <TableCell className="text-center">
                      {plan.is_active ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/plans/${plan.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id, plan.display_name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

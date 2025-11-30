'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

type PlanForm = {
  name: string;
  display_name: string;
  max_transactions: string;
  max_categories: string;
  max_goals: string;
  max_budgets: string;
  max_team_members: string;
  max_branches: string;
  max_reminders: string;
  is_active: boolean;
};

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [form, setForm] = useState<PlanForm>({
    name: '',
    display_name: '',
    max_transactions: '',
    max_categories: '',
    max_goals: '',
    max_budgets: '',
    max_team_members: '',
    max_branches: '',
    max_reminders: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlan();
  }, [planId]);

  async function loadPlan() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/plans/${planId}`);

      if (!res.ok) {
        throw new Error('Erro ao carregar plano');
      }

      const { data } = await res.json();

      setForm({
        name: data.name || '',
        display_name: data.display_name || '',
        max_transactions: data.max_transactions?.toString() || '',
        max_categories: data.max_categories?.toString() || '',
        max_goals: data.max_goals?.toString() || '',
        max_budgets: data.max_budgets?.toString() || '',
        max_team_members: data.max_team_members?.toString() || '',
        max_branches: data.max_branches?.toString() || '',
        max_reminders: data.max_reminders?.toString() || '',
        is_active: data.is_active ?? true,
      });
    } catch (error: any) {
      toast.error(error.message);
      router.push('/admin/plans');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        display_name: form.display_name,
        max_transactions: form.max_transactions ? parseInt(form.max_transactions) : null,
        max_categories: form.max_categories ? parseInt(form.max_categories) : null,
        max_goals: form.max_goals ? parseInt(form.max_goals) : null,
        max_budgets: form.max_budgets ? parseInt(form.max_budgets) : null,
        max_team_members: form.max_team_members ? parseInt(form.max_team_members) : null,
        max_branches: form.max_branches ? parseInt(form.max_branches) : null,
        max_reminders: form.max_reminders ? parseInt(form.max_reminders) : null,
        is_active: form.is_active,
      };

      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar plano');
      }

      toast.success('Plano atualizado com sucesso');
      router.push('/admin/plans');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

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
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/admin/plans')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Plano</CardTitle>
          <CardDescription>
            Altere as limitações e configurações do plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Interno</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ex: pro"
                    required
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Não pode ser alterado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Nome de Exibição</Label>
                  <Input
                    id="display_name"
                    value={form.display_name}
                    onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                    placeholder="ex: Plano Pro"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label htmlFor="is_active">Plano ativo</Label>
              </div>
            </div>

            {/* Limitações de Recursos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Limitações de Recursos</h3>
              <p className="text-sm text-muted-foreground">
                Deixe em branco para ilimitado
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_transactions">Transações por Mês</Label>
                  <Input
                    id="max_transactions"
                    type="number"
                    min="0"
                    value={form.max_transactions}
                    onChange={(e) => setForm({ ...form, max_transactions: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_categories">Categorias Customizadas</Label>
                  <Input
                    id="max_categories"
                    type="number"
                    min="0"
                    value={form.max_categories}
                    onChange={(e) => setForm({ ...form, max_categories: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_goals">Metas Financeiras</Label>
                  <Input
                    id="max_goals"
                    type="number"
                    min="0"
                    value={form.max_goals}
                    onChange={(e) => setForm({ ...form, max_goals: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_budgets">Orçamentos</Label>
                  <Input
                    id="max_budgets"
                    type="number"
                    min="0"
                    value={form.max_budgets}
                    onChange={(e) => setForm({ ...form, max_budgets: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_team_members">Membros da Equipe</Label>
                  <Input
                    id="max_team_members"
                    type="number"
                    min="0"
                    value={form.max_team_members}
                    onChange={(e) => setForm({ ...form, max_team_members: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_branches">Branches Próprias</Label>
                  <Input
                    id="max_branches"
                    type="number"
                    min="0"
                    value={form.max_branches}
                    onChange={(e) => setForm({ ...form, max_branches: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_reminders">Lembretes (Email)</Label>
                  <Input
                    id="max_reminders"
                    type="number"
                    min="0"
                    value={form.max_reminders}
                    onChange={(e) => setForm({ ...form, max_reminders: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/plans')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Check, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { PLAN_DISPLAY_NAMES } from "@/lib/plan-features";

type SubscriptionPlan = {
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
  has_advanced_reports: boolean;
  export_formats: string[] | null;
  support_level: string | null;
  history_months: number | null;
};

type UserData = {
  subscription_plan_id: string;
  subscription_status: string;
  is_early_adopter: boolean;
  subscription_plans: SubscriptionPlan;
} | null;

interface PlanManagementContentProps {
  userData: UserData;
  availablePlans: SubscriptionPlan[];
}

export function PlanManagementContent({ userData, availablePlans }: PlanManagementContentProps) {
  const router = useRouter();
  const currentPlan = userData?.subscription_plans;
  const isEarlyAdopter = userData?.is_early_adopter || false;

  if (!currentPlan) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Erro ao carregar plano</CardTitle>
            <CardDescription>
              Não foi possível carregar as informações do seu plano.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="relative overflow-hidden border-b-2 border-border bg-header-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Meu Plano</h1>
              <p className="mt-2 text-sm text-blue-100">
                Gerencie sua assinatura e veja os recursos disponíveis
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Current Plan Card */}
        <Card className={isEarlyAdopter ? "border-2 border-yellow-400" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {isEarlyAdopter && <Crown className="h-6 w-6 text-yellow-500" />}
                  <CardTitle className="text-2xl">{currentPlan.display_name}</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  {isEarlyAdopter
                    ? "Você é um Early Adopter com acesso vitalício a todos os recursos"
                    : "Seu plano atual"}
                </CardDescription>
              </div>
              {isEarlyAdopter && (
                <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                  <Crown className="mr-1 h-3 w-3" />
                  Early Adopter
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Features List */}
              <div>
                <h3 className="font-semibold mb-4">Recursos Inclusos</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>
                      {currentPlan.max_transactions === null
                        ? "Transações ilimitadas"
                        : `${currentPlan.max_transactions} transações/mês`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>
                      {currentPlan.max_categories === null
                        ? "Categorias ilimitadas"
                        : `${currentPlan.max_categories} categorias customizadas`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>
                      {currentPlan.max_goals === null
                        ? "Metas ilimitadas"
                        : `${currentPlan.max_goals} metas financeiras`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>
                      {currentPlan.max_budgets === null
                        ? "Orçamentos ilimitados"
                        : `${currentPlan.max_budgets} orçamentos`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>
                      {currentPlan.max_team_members === null
                        ? "Membros ilimitados"
                        : `${currentPlan.max_team_members} membros da equipe`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>
                      {currentPlan.max_branches === null
                        ? "Workspaces ilimitadas"
                        : `${currentPlan.max_branches} workspaces`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>
                      {currentPlan.max_reminders === null
                        ? "Lembretes ilimitados"
                        : `${currentPlan.max_reminders} lembretes via email`}
                    </span>
                  </li>
                  {currentPlan.has_advanced_reports && (
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Relatórios avançados</span>
                    </li>
                  )}
                  {currentPlan.export_formats && currentPlan.export_formats.length > 0 && (
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Exportação: {currentPlan.export_formats.join(', ').toUpperCase()}</span>
                    </li>
                  )}
                  {currentPlan.history_months && (
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Histórico de {currentPlan.history_months} meses</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold mb-4">Status da Assinatura</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={userData?.subscription_status === 'active' ? 'default' : 'secondary'}>
                      {userData?.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  {!isEarlyAdopter && (
                    <div className="pt-4">
                      <Button
                        className="w-full"
                        onClick={() => router.push('/pricing')}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Ver Outros Planos
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans - Only show if not early adopter */}
        {!isEarlyAdopter && availablePlans.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Planos Disponíveis</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availablePlans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan.id;

                return (
                  <Card key={plan.id} className={isCurrentPlan ? "border-2 border-brand" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{plan.display_name}</CardTitle>
                        {isCurrentPlan && (
                          <Badge variant="default">Atual</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm mb-4">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>
                            {plan.max_transactions === null ? "∞" : plan.max_transactions} transações
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>
                            {plan.max_categories === null ? "∞" : plan.max_categories} categorias
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>
                            {plan.max_goals === null ? "∞" : plan.max_goals} metas
                          </span>
                        </li>
                        {plan.has_advanced_reports && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Relatórios avançados</span>
                          </li>
                        )}
                      </ul>

                      {!isCurrentPlan && (
                        <Button
                          className="w-full"
                          variant={plan.name === 'free' ? 'outline' : 'default'}
                          onClick={() => router.push('/pricing')}
                        >
                          {plan.name === 'free' ? 'Downgrade' : 'Upgrade'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

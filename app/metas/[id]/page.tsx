import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { GoalService } from "@/src/modules/goals";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoalProgress } from "../components/goal-progress";
import { ContributionForm } from "../components/contribution-form";
import { ContributionHistory } from "../components/contribution-history";
import { GoalActions } from "../components/goal-actions";
import { ArrowLeft, Calendar, Target, TrendingUp } from "lucide-react";

interface GoalDetailPageProps {
  params: Promise<{ id: string }>;
}

const goalTypeLabels = {
  emergency_fund: "Reserva de Emergência",
  savings: "Poupança",
  debt_payoff: "Quitar Dívida",
  purchase: "Compra",
};

const priorityColors = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  low: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pegar branch atual do usuário
  const currentBranch = await getCurrentBranch(user.id);

  const { id } = await params;

  try {
    // Buscar meta e contribuições
    const [goal, contributions] = await Promise.all([
      GoalService.getGoal(id, user.id),
      GoalService.listContributions(id, user.id),
    ]);

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    return (
      <AuthenticatedLayout currentBranch={currentBranch}>
        <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="px-8 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <Link href="/metas">
                  <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{goal.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-3xl font-bold">{goal.name}</h1>
                        <Badge className={priorityColors[goal.priority]}>
                          {goalTypeLabels[goal.goal_type]}
                        </Badge>
                        {!goal.is_active && (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                        {goal.achieved_at && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            ✓ Alcançada
                          </Badge>
                        )}
                      </div>
                      {goal.description && (
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <GoalActions goalId={goal.id} isActive={goal.is_active} isAchieved={!!goal.achieved_at} />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Section */}
              <GoalProgress goal={goal} />

              {/* Info Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                {goal.remaining_amount > 0 && (
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                      <Target className="h-4 w-4" />
                      Faltam
                    </div>
                    <p className="text-2xl font-semibold">{formatCurrency(goal.remaining_amount)}</p>
                  </div>
                )}

                {goal.target_date && (
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                      <Calendar className="h-4 w-4" />
                      {goal.is_overdue ? "Venceu em" : "Meta até"}
                    </div>
                    <p className={`text-2xl font-semibold ${goal.is_overdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {formatDate(goal.target_date)}
                    </p>
                    {goal.days_until_target !== null && goal.days_until_target > 0 && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {goal.days_until_target} dias restantes
                      </p>
                    )}
                  </div>
                )}

                {goal.monthly_average > 0 && (
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Média mensal
                    </div>
                    <p className="text-2xl font-semibold">{formatCurrency(goal.monthly_average)}</p>
                    {goal.total_contributions > 0 && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {goal.total_contributions} contribuiç
                        {goal.total_contributions === 1 ? "ão" : "ões"}
                      </p>
                    )}
                  </div>
                )}

                {goal.projected_date && goal.status !== "achieved" && (
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Projeção
                    </div>
                    <p className="text-lg font-semibold">{formatDate(goal.projected_date)}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      No ritmo atual
                    </p>
                  </div>
                )}

                {goal.monthly_needed !== null && goal.monthly_needed > 0 && (
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                      <Target className="h-4 w-4" />
                      Necessário/mês
                    </div>
                    <p className="text-2xl font-semibold">{formatCurrency(goal.monthly_needed)}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Para atingir no prazo
                    </p>
                  </div>
                )}
              </div>

              {/* Contribution History */}
              <ContributionHistory contributions={contributions} />
            </div>

            {/* Sidebar - 1 column */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ContributionForm
                  goalId={goal.id}
                  goalName={goal.name}
                  isActive={goal.is_active}
                  isAchieved={!!goal.achieved_at}
                  currentAmount={goal.current_amount}
                  targetAmount={goal.target_amount}
                />
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  } catch (error) {
    console.error("Erro ao carregar meta:", error);
    redirect("/metas");
  }
}

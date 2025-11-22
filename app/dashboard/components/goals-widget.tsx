import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { GoalWithProgress } from "@/src/modules/goals";
import { Target, ArrowRight, TrendingUp } from "lucide-react";

interface GoalsWidgetProps {
  goals: GoalWithProgress[];
}

const goalTypeLabels = {
  emergency_fund: "Reserva de Emergência",
  savings: "Poupança",
  debt_payoff: "Quitar Dívida",
  purchase: "Compra",
};

const statusColors = {
  not_started: "text-zinc-500",
  in_progress: "text-blue-600 dark:text-blue-400",
  almost_there: "text-green-600 dark:text-green-400",
  achieved: "text-emerald-600 dark:text-emerald-400",
};

export function GoalsWidget({ goals }: GoalsWidgetProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Pegar apenas as 3 primeiras metas ativas
  const topGoals = goals.slice(0, 3);
  const totalGoals = goals.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas Financeiras
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso das suas metas
            </CardDescription>
          </div>
          <Link href="/metas">
            <Button variant="ghost" size="sm">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {totalGoals === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
              <Target className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhuma meta criada
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm">
              Defina metas de economia para alcançar seus objetivos financeiros.
            </p>
            <Link href="/metas/criar">
              <Button className="mt-4" size="sm">
                <Target className="mr-2 h-4 w-4" />
                Criar Meta
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {topGoals.map((goal) => (
              <Link key={goal.id} href={`/metas/${goal.id}`}>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-xl">{goal.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm leading-none">{goal.name}</p>
                        <Badge
                          variant="secondary"
                          className="mt-1.5 text-xs"
                        >
                          {goalTypeLabels[goal.goal_type]}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${statusColors[goal.status]}`}>
                        {Math.min(goal.progress_percentage, 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <Progress
                    value={Math.min(goal.progress_percentage, 100)}
                    className="h-2 mb-2"
                  />

                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>
                      {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
                    </span>
                    {goal.remaining_amount > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Faltam {formatCurrency(goal.remaining_amount)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {totalGoals > 3 && (
              <Link href="/metas">
                <Button variant="outline" className="w-full" size="sm">
                  Ver todas as {totalGoals} metas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

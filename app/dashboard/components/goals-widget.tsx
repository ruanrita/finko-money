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
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Target className="h-4 w-4" />
              </div>
              Metas Financeiras
            </CardTitle>
            <CardDescription className="mt-1">
              Acompanhe o progresso das suas metas
            </CardDescription>
          </div>
          <Link href="/metas">
            <Button variant="ghost" size="sm" className="text-brand hover:bg-blue-50 hover:text-brand dark:hover:bg-blue-900/20">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {totalGoals === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-card-foreground">
              Nenhuma meta criada
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Defina metas de economia para alcançar seus objetivos financeiros.
            </p>
            <Link href="/metas/criar">
              <Button className="btn-brand mt-4" size="sm">
                <Target className="mr-2 h-4 w-4" />
                Criar Meta
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {topGoals.map((goal) => (
              <Link key={goal.id} href={`/metas/${goal.id}`}>
                <div className="rounded-lg border-2 border-border bg-card p-4 transition-all hover:border-brand hover:shadow-md cursor-pointer">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 text-2xl shadow-sm">
                        {goal.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-card-foreground">{goal.name}</p>
                        <Badge
                          variant="secondary"
                          className="mt-1.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                          {goalTypeLabels[goal.goal_type]}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${statusColors[goal.status]}`}>
                        {Math.min(goal.progress_percentage, 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <Progress
                    value={Math.min(goal.progress_percentage, 100)}
                    className="h-2.5 mb-3"
                  />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">
                      {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
                    </span>
                    {goal.remaining_amount > 0 && (
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
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
                <Button variant="outline" className="w-full border-brand text-brand hover:bg-brand hover:text-white" size="sm">
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

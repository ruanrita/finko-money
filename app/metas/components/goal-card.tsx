"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { GoalWithProgress } from "@/src/modules/goals";
import { Calendar, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: GoalWithProgress;
  priority?: boolean;
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

const statusColors = {
  not_started: "text-zinc-500",
  in_progress: "text-blue-600 dark:text-blue-400",
  almost_there: "text-green-600 dark:text-green-400",
  achieved: "text-emerald-600 dark:text-emerald-400",
};

const statusLabels = {
  not_started: "Não iniciada",
  in_progress: "Em progresso",
  almost_there: "Quase lá!",
  achieved: "Alcançada!",
};

export function GoalCard({ goal, priority = false }: GoalCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Link href={`/metas/${goal.id}`}>
      <Card
        className={cn(
          "transition-all hover:shadow-md cursor-pointer",
          priority && "border-2 border-red-200 dark:border-red-900/30"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <span className="text-2xl">{goal.icon}</span>
              <div>
                <h3 className="font-semibold text-base leading-none">{goal.name}</h3>
                {goal.description && (
                  <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>
            <Badge
              className={cn("text-xs", priorityColors[goal.priority])}
              variant="secondary"
            >
              {goalTypeLabels[goal.goal_type]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={statusColors[goal.status]}>
                {statusLabels[goal.status]}
              </span>
              <span className="font-semibold">
                {Math.min(goal.progress_percentage, 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={Math.min(goal.progress_percentage, 100)} className="h-2" />
          </div>

          {/* Amounts */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Atual</p>
              <p className="font-semibold">{formatCurrency(goal.current_amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Meta</p>
              <p className="font-semibold">{formatCurrency(goal.target_amount)}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            {goal.remaining_amount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <Target className="h-3.5 w-3.5" />
                <span>
                  Faltam {formatCurrency(goal.remaining_amount)}
                </span>
              </div>
            )}

            {goal.target_date && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {goal.is_overdue ? "Venceu em " : "Meta até "}
                  {formatDate(goal.target_date)}
                  {goal.is_overdue && (
                    <span className="ml-1 text-red-600 dark:text-red-400 font-medium">
                      (Atrasada)
                    </span>
                  )}
                </span>
              </div>
            )}

            {goal.projected_date && goal.status !== "achieved" && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>
                  Projeção: {formatDate(goal.projected_date)}
                </span>
              </div>
            )}

            {goal.monthly_average > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>
                  Média mensal: {formatCurrency(goal.monthly_average)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

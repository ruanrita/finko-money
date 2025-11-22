"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GoalWithProgress } from "@/src/modules/goals";

interface GoalProgressProps {
  goal: GoalWithProgress;
}

const statusLabels = {
  not_started: "Não iniciada",
  in_progress: "Em progresso",
  almost_there: "Quase lá! Continue assim!",
  achieved: "Parabéns! Meta alcançada! 🎉",
};

const statusColors = {
  not_started: "text-zinc-500",
  in_progress: "text-blue-600 dark:text-blue-400",
  almost_there: "text-green-600 dark:text-green-400",
  achieved: "text-emerald-600 dark:text-emerald-400",
};

export function GoalProgress({ goal }: GoalProgressProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const progressPercentage = Math.min(goal.progress_percentage, 100);

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-lg font-semibold ${statusColors[goal.status]}`}>
              {statusLabels[goal.status]}
            </h2>
            <span className="text-3xl font-bold">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-4" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              Valor Atual
            </p>
            <p className="text-3xl font-bold">
              {formatCurrency(goal.current_amount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              Valor Meta
            </p>
            <p className="text-3xl font-bold">
              {formatCurrency(goal.target_amount)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

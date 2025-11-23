"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { GoalStatsResponse } from "@/src/modules/goals";
import { Target, TrendingUp, CheckCircle2, Wallet } from "lucide-react";

interface GoalStatsProps {
  stats: GoalStatsResponse;
}

export function GoalStats({ stats }: GoalStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const statCards = [
    {
      label: "Metas Ativas",
      value: stats.active_goals,
      total: stats.total_goals,
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      label: "Metas Alcançadas",
      value: stats.achieved_goals,
      total: stats.total_goals,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      label: "Total Economizado",
      value: formatCurrency(stats.total_current_amount),
      subtitle: `de ${formatCurrency(stats.total_target_amount)}`,
      icon: Wallet,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      label: "Progresso Geral",
      value: `${Math.min(stats.overall_progress, 100).toFixed(0)}%`,
      subtitle: "das suas metas",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-2 transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg shadow-sm transition-transform hover:scale-110 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color} drop-shadow-sm`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-semibold">
                    {stat.value}
                  </p>
                  {stat.total !== undefined && (
                    <span className="text-sm text-zinc-500">/ {stat.total}</span>
                  )}
                </div>
                {stat.subtitle && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  metrics: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
    averageMonthlyIncome: number;
    averageMonthlyExpense: number;
    transactionCount: number;
  };
};

export function SummaryMetrics({ metrics }: Props) {
  const cards = [
    {
      title: "Total de Receitas",
      value: formatCurrency(metrics.totalIncome),
      description: `Média mensal: ${formatCurrency(metrics.averageMonthlyIncome)}`,
      icon: TrendingUp,
      iconColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total de Despesas",
      value: formatCurrency(metrics.totalExpense),
      description: `Média mensal: ${formatCurrency(metrics.averageMonthlyExpense)}`,
      icon: TrendingDown,
      iconColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Saldo do Período",
      value: formatCurrency(metrics.balance),
      description: `${metrics.transactionCount} transações`,
      icon: DollarSign,
      iconColor: metrics.balance >= 0 ? "text-green-600" : "text-red-600",
      bgColor: metrics.balance >= 0 ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Taxa de Economia",
      value: `${metrics.savingsRate.toFixed(1)}%`,
      description: metrics.savingsRate >= 20 ? "Ótima taxa!" : metrics.savingsRate >= 10 ? "Boa taxa" : "Pode melhorar",
      icon: PiggyBank,
      iconColor: metrics.savingsRate >= 20 ? "text-green-600" : metrics.savingsRate >= 10 ? "text-blue-600" : "text-yellow-600",
      bgColor: metrics.savingsRate >= 20 ? "bg-green-50 dark:bg-green-950" : metrics.savingsRate >= 10 ? "bg-blue-50 dark:bg-blue-950" : "bg-yellow-50 dark:bg-yellow-950",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
          Visão Geral
        </h2>
        <p className="text-sm text-zinc-500">
          Principais métricas dos últimos 6 meses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>{card.title}</CardDescription>
                  <div className={`rounded-full p-2 ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl">{card.value}</CardTitle>
                <p className="text-xs text-zinc-500 mt-2">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

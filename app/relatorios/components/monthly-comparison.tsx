"use client";

import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type Props = {
  bestWorstMonths: {
    bestMonth: { month: string; monthName: string; balance: number };
    worstMonth: { month: string; monthName: string; balance: number };
    highestIncome: { month: string; monthName: string; income: number };
    highestExpense: { month: string; monthName: string; expense: number };
  };
};

export function MonthlyComparison({ bestWorstMonths }: Props) {
  const insights = [
    {
      title: "Melhor Mês",
      description: "Maior saldo positivo",
      month: bestWorstMonths.bestMonth.monthName,
      value: formatCurrency(bestWorstMonths.bestMonth.balance),
      icon: TrendingUp,
      iconColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      badgeColor: "bg-green-600",
      isPositive: true,
    },
    {
      title: "Pior Mês",
      description: "Menor saldo ou maior déficit",
      month: bestWorstMonths.worstMonth.monthName,
      value: formatCurrency(bestWorstMonths.worstMonth.balance),
      icon: TrendingDown,
      iconColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      badgeColor: "bg-red-600",
      isPositive: false,
    },
    {
      title: "Maior Receita",
      description: "Mês com mais receitas",
      month: bestWorstMonths.highestIncome.monthName,
      value: formatCurrency(bestWorstMonths.highestIncome.income),
      icon: ArrowUp,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      badgeColor: "bg-blue-600",
      isPositive: true,
    },
    {
      title: "Maior Despesa",
      description: "Mês com mais despesas",
      month: bestWorstMonths.highestExpense.monthName,
      value: formatCurrency(bestWorstMonths.highestExpense.expense),
      icon: ArrowDown,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      badgeColor: "bg-orange-600",
      isPositive: false,
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
          Análise Comparativa
        </h2>
        <p className="text-sm text-zinc-500">
          Insights sobre os melhores e piores períodos dos últimos 12 meses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.title} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {insight.description}
                    </CardDescription>
                  </div>
                  <div className={`rounded-full p-2 ${insight.bgColor}`}>
                    <Icon className={`h-5 w-5 ${insight.iconColor}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className="capitalize"
                  >
                    {insight.month}
                  </Badge>
                  <p className={`text-2xl font-bold ${
                    insight.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {insight.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
          <CardDescription>
            Insights baseados na análise dos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bestWorstMonths.bestMonth.balance > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Excelente desempenho em {bestWorstMonths.bestMonth.monthName}!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Você conseguiu um saldo positivo de {formatCurrency(bestWorstMonths.bestMonth.balance)}.
                    Tente replicar os hábitos desse mês.
                  </p>
                </div>
              </div>
            )}

            {bestWorstMonths.worstMonth.balance < 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
                <TrendingDown className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Atenção ao mês de {bestWorstMonths.worstMonth.monthName}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Houve um déficit de {formatCurrency(Math.abs(bestWorstMonths.worstMonth.balance))}.
                    Revise as despesas desse período para identificar oportunidades de economia.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
              <ArrowUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Maior receita em {bestWorstMonths.highestIncome.monthName}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Com {formatCurrency(bestWorstMonths.highestIncome.income)} em receitas,
                  este foi seu melhor mês. Identifique fontes extras de renda para replicar o resultado.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

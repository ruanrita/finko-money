"use client";

import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  summary: {
    total_budgeted: number;
    total_spent: number;
    total_remaining: number;
    percentage: number;
    budgets_count: number;
    exceeded_count: number;
    warning_count: number;
  };
};

export function BudgetSummary({ summary }: Props) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  const isOverBudget = summary.percentage > 100;
  const needsAttention = summary.warning_count > 0 || summary.exceeded_count > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-2 transition-all hover:border-brand hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Orçado</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(summary.total_budgeted)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center shadow-sm transition-transform hover:scale-110">
              <Wallet className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-2 transition-all hover:shadow-md ${isOverBudget ? 'hover:border-red-500' : 'hover:border-green-500'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Gasto</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(summary.total_spent)}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {summary.percentage.toFixed(1)}% do orçamento
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110 ${isOverBudget ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
              {isOverBudget ? (
                <TrendingUp className="h-6 w-6 text-white drop-shadow-sm" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white drop-shadow-sm" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-2 transition-all hover:shadow-md ${summary.total_remaining < 0 ? 'hover:border-red-500' : 'hover:border-green-500'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Disponível</p>
              <p className={`text-2xl font-bold ${summary.total_remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatCurrency(summary.total_remaining)}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110 ${summary.total_remaining < 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
              <Wallet className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-2 transition-all hover:shadow-md ${needsAttention ? 'hover:border-yellow-500' : 'hover:border-green-500'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Status</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.budgets_count}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {summary.exceeded_count > 0 && `${summary.exceeded_count} excedido${summary.exceeded_count > 1 ? 's' : ''}`}
                {summary.exceeded_count > 0 && summary.warning_count > 0 && ', '}
                {summary.warning_count > 0 && `${summary.warning_count} alerta${summary.warning_count > 1 ? 's' : ''}`}
                {!needsAttention && 'Tudo ok'}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110 ${needsAttention ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
              <AlertCircle className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

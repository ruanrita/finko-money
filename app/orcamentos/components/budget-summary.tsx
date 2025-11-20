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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orçado</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.total_budgeted)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Gasto</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.total_spent)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.percentage.toFixed(1)}% do orçamento
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}>
              {isOverBudget ? (
                <TrendingUp className="h-6 w-6 text-red-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-green-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Disponível</p>
              <p className={`text-2xl font-bold ${summary.total_remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(summary.total_remaining)}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${summary.total_remaining < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <Wallet className={`h-6 w-6 ${summary.total_remaining < 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-2xl font-bold">{summary.budgets_count}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.exceeded_count > 0 && `${summary.exceeded_count} excedido${summary.exceeded_count > 1 ? 's' : ''}`}
                {summary.exceeded_count > 0 && summary.warning_count > 0 && ', '}
                {summary.warning_count > 0 && `${summary.warning_count} alerta${summary.warning_count > 1 ? 's' : ''}`}
                {!needsAttention && 'Tudo ok'}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${needsAttention ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <AlertCircle className={`h-6 w-6 ${needsAttention ? 'text-yellow-600' : 'text-green-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

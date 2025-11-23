"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface FinancialChartProps {
  income: number;
  expenses: number;
  month?: string; // Formato: "2025-01"
}

export function FinancialChart({ income, expenses, month }: FinancialChartProps) {
  const data = [
    {
      name: "Período",
      Receitas: income,
      Despesas: expenses,
    },
  ];

  const balance = income - expenses;

  // Formatar mês para exibição (evitando problemas de timezone)
  const getDisplayMonth = () => {
    if (!month) return "Mês atual";

    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1); // month - 1 porque JS usa 0-indexed
    const formatted = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const displayMonth = getDisplayMonth();

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Resumo Financeiro - {displayMonth}</CardTitle>
        <CardDescription>
          Visão geral das suas receitas e despesas do período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border-2 border-green-200 bg-card p-4 transition-all hover:border-green-500 hover:shadow-md dark:border-green-900/30">
            <p className="text-sm font-medium text-muted-foreground">Receitas</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(income)}
            </p>
          </div>
          <div className="rounded-lg border-2 border-red-200 bg-card p-4 transition-all hover:border-red-500 hover:shadow-md dark:border-red-900/30">
            <p className="text-sm font-medium text-muted-foreground">Despesas</p>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(expenses)}
            </p>
          </div>
          <div className={`rounded-lg border-2 bg-card p-4 transition-all hover:shadow-md ${balance >= 0 ? 'border-blue-200 hover:border-brand dark:border-blue-900/30' : 'border-orange-200 hover:border-orange-500 dark:border-orange-900/30'}`}>
            <p className="text-sm font-medium text-muted-foreground">Saldo</p>
            <p className={`mt-1 text-2xl font-bold ${balance >= 0 ? 'text-brand' : 'text-orange-600 dark:text-orange-400'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis
              dataKey="name"
              className="text-zinc-600 dark:text-zinc-400"
            />
            <YAxis
              className="text-zinc-600 dark:text-zinc-400"
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="Receitas" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

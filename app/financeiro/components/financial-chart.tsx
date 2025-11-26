"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { MonthNavigation } from "./month-navigation";

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

  // Mês padrão caso não seja fornecido
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return (
    <Card className="border-2 border-gray-300 dark:border-gray-700">
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <MonthNavigation selectedMonth={currentMonth} title="Resumo Financeiro" />
        <CardDescription className="text-xs sm:text-sm">
          Visão geral das suas receitas e despesas do período
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="rounded-lg border-2 border-green-200 bg-card p-3 sm:p-4 transition-all hover:border-green-500 hover:shadow-md dark:border-green-900/30">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Receitas</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(income)}
            </p>
          </div>
          <div className="rounded-lg border-2 border-red-200 bg-card p-3 sm:p-4 transition-all hover:border-red-500 hover:shadow-md dark:border-red-900/30">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Despesas</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(expenses)}
            </p>
          </div>
          <div className={`rounded-lg border-2 bg-card p-3 sm:p-4 transition-all hover:shadow-md ${balance >= 0 ? 'border-blue-200 hover:border-brand dark:border-blue-900/30' : 'border-orange-200 hover:border-orange-500 dark:border-orange-900/30'}`}>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo</p>
            <p className={`mt-1 text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-brand' : 'text-orange-600 dark:text-orange-400'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis
              dataKey="name"
              className="text-zinc-600 dark:text-zinc-400"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-zinc-600 dark:text-zinc-400"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "12px"
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "10px"
              }}
              iconSize={14}
            />
            <Bar dataKey="Receitas" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

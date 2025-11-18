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

  // Formatar mês para exibição
  const formattedMonth = month
    ? new Date(month + "-01").toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "";
  const displayMonth = formattedMonth
    ? formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1)
    : "Mês atual";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro - {displayMonth}</CardTitle>
        <CardDescription>
          Visão geral das suas receitas e despesas do período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Receitas</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {formatCurrency(income)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Despesas</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {formatCurrency(expenses)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Saldo</p>
            <p className={`mt-1 text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

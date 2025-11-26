"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { MonthNavigation } from "./month-navigation";

interface CategoryData {
  category_name: string;
  category_color: string;
  total: number;
}

interface CategoryPieChartProps {
  expensesByCategory: CategoryData[];
  incomesByCategory: CategoryData[];
  month: string;
}

export function CategoryPieChart({ expensesByCategory, incomesByCategory, month }: CategoryPieChartProps) {
  const [showExpenses, setShowExpenses] = useState(true);
  const [showIncome, setShowIncome] = useState(false);

  // Combinar dados baseado nos toggles
  const getChartData = () => {
    const data: Array<{ name: string; value: number; color: string }> = [];

    if (showExpenses) {
      expensesByCategory.forEach(cat => {
        data.push({
          name: cat.category_name || "Sem categoria",
          value: cat.total,
          color: cat.category_color || "#94a3b8",
        });
      });
    }

    if (showIncome) {
      incomesByCategory.forEach(cat => {
        data.push({
          name: cat.category_name || "Sem categoria",
          value: cat.total,
          color: cat.category_color || "#10b981",
        });
      });
    }

    return data;
  };

  const chartData = getChartData();
  const hasData = chartData.length > 0;

  return (
    <Card className="border-2 border-gray-300 dark:border-gray-700">
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <MonthNavigation selectedMonth={month} title="Distribuição por Categoria" />
        <CardDescription className="text-xs sm:text-sm">
          Análise de {showExpenses && showIncome ? "despesas e receitas" : showExpenses ? "despesas" : "receitas"} por categoria
        </CardDescription>

        {/* Toggle Buttons */}
        <div className="flex gap-2 pt-2 sm:pt-4">
          <Button
            variant={showExpenses ? "default" : "outline"}
            size="sm"
            onClick={() => setShowExpenses(!showExpenses)}
            className={`text-xs sm:text-sm ${showExpenses ? "bg-brand hover:bg-blue-700" : ""}`}
          >
            Despesas
          </Button>
          <Button
            variant={showIncome ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIncome(!showIncome)}
            className={`text-xs sm:text-sm ${showIncome ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            Receitas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {!hasData ? (
          <div className="flex h-[250px] sm:h-[400px] items-center justify-center text-xs sm:text-sm text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px"
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{
                      paddingTop: "10px",
                      fontSize: "11px",
                      lineHeight: "1.5",
                      fontWeight: "600"
                    }}
                    iconSize={12}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="60%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px"
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="left"
                    verticalAlign="middle"
                    wrapperStyle={{
                      paddingLeft: "10px",
                      fontSize: "14px",
                      lineHeight: "2.2",
                      fontWeight: "700"
                    }}
                    iconSize={16}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

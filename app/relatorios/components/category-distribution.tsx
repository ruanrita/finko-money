"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";

type Props = {
  title: string;
  description: string;
  data: Array<{
    category: string;
    categoryId: string | null;
    amount: number;
    color: string;
    icon: string | null;
    percentage: number;
  }>;
  type: "income" | "expense";
};

export function CategoryDistribution({ title, description, data, type }: Props) {
  // Prepare data for pie chart
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    color: item.color,
    percentage: item.percentage,
    icon: item.icon,
  }));

  // Custom label to show percentage
  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 mb-2">
            {data.icon && (
              <div
                className="h-6 w-6 rounded flex items-center justify-center"
                style={{ backgroundColor: `${data.color}30`, color: data.color }}
              >
                <CategoryIcon iconName={data.icon} className="h-4 w-4" />
              </div>
            )}
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{data.name}</p>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Valor: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Percentual: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="mt-4 space-y-2">
        {payload.map((entry: any, index: number) => {
          // Handle both Recharts format (entry.payload) and direct data format
          const data = entry.payload || entry;
          const displayName = entry.value || data.name;
          const color = entry.color || data.color;

          return (
            <div
              key={`legend-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {data.icon && (
                  <div
                    className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}30`, color: color }}
                  >
                    <CategoryIcon iconName={data.icon} className="h-4 w-4" />
                  </div>
                )}
                {!data.icon && (
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                  {displayName}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium text-zinc-500">
                  {data.percentage.toFixed(1)}%
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(data.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-zinc-500">
              Nenhum dado disponível para o período selecionado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          {renderLegend({ payload: chartData })}
        </div>
      </CardContent>
    </Card>
  );
}

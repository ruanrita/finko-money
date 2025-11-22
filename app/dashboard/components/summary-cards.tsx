"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Props = {
  monthName: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  yearlyIncome: number;
  yearlyExpenses: number;
  yearlyBalance: number;
};

export function SummaryCards({
  monthName,
  monthlyIncome,
  monthlyExpenses,
  monthlyBalance,
  yearlyIncome,
  yearlyExpenses,
  yearlyBalance,
}: Props) {
  const [showYearly, setShowYearly] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Resumo Financeiro
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
            {monthName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowYearly(!showYearly)}
          className="border-brand text-brand hover:bg-brand hover:text-white"
        >
          {showYearly ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Ocultar Anual
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Mostrar Anual
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Receitas */}
        <Link href="/financeiro?type=income">
          <Card className="group cursor-pointer border-2 transition-all hover:border-green-500 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-zinc-600 dark:text-zinc-400">Receitas</CardDescription>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-transform group-hover:scale-110 dark:bg-green-900/20 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(monthlyIncome)}
              </CardTitle>
              {showYearly && (
                <>
                  <p className="text-base text-zinc-500 dark:text-zinc-400">
                    {formatCurrency(yearlyIncome)} <span className="text-xs">/ ano</span>
                  </p>
                </>
              )}
            </CardHeader>
          </Card>
        </Link>

        {/* Despesas */}
        <Link href="/financeiro?type=expense">
          <Card className="group cursor-pointer border-2 transition-all hover:border-red-500 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-zinc-600 dark:text-zinc-400">Despesas</CardDescription>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-transform group-hover:scale-110 dark:bg-red-900/20 dark:text-red-400">
                  <TrendingDown className="h-5 w-5" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(monthlyExpenses)}
              </CardTitle>
              {showYearly && (
                <>
                  <p className="text-base text-zinc-500 dark:text-zinc-400">
                    {formatCurrency(yearlyExpenses)} <span className="text-xs">/ ano</span>
                  </p>
                </>
              )}
            </CardHeader>
          </Card>
        </Link>

        {/* Saldo */}
        <Link href="/financeiro">
          <Card className={`group cursor-pointer border-2 transition-all hover:shadow-lg ${
            monthlyBalance >= 0
              ? 'hover:border-blue-500'
              : 'hover:border-orange-500'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-zinc-600 dark:text-zinc-400">Saldo</CardDescription>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${
                  monthlyBalance >= 0
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                }`}>
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <CardTitle className={`text-3xl font-bold ${
                monthlyBalance >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {formatCurrency(monthlyBalance)}
              </CardTitle>
              {showYearly && (
                <>
                  <p className={`text-base ${
                    yearlyBalance >= 0
                      ? 'text-zinc-500 dark:text-zinc-400'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {formatCurrency(yearlyBalance)} <span className="text-xs">/ ano</span>
                  </p>
                </>
              )}
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

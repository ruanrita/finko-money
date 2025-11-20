"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
            Resumo Financeiro
          </h2>
          <p className="text-sm text-zinc-500 capitalize">
            {monthName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowYearly(!showYearly)}
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
          <Card className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <CardHeader>
              <CardDescription>Receitas</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {formatCurrency(monthlyIncome)}
                {showYearly && (
                  <span className="text-base text-zinc-500 ml-2">
                    / {formatCurrency(yearlyIncome)}
                  </span>
                )}
              </CardTitle>
              {showYearly && (
                <p className="text-xs text-zinc-500 mt-1">
                  Mês / Ano
                </p>
              )}
            </CardHeader>
          </Card>
        </Link>

        {/* Despesas */}
        <Link href="/financeiro?type=expense">
          <Card className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <CardHeader>
              <CardDescription>Despesas</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {formatCurrency(monthlyExpenses)}
                {showYearly && (
                  <span className="text-base text-zinc-500 ml-2">
                    / {formatCurrency(yearlyExpenses)}
                  </span>
                )}
              </CardTitle>
              {showYearly && (
                <p className="text-xs text-zinc-500 mt-1">
                  Mês / Ano
                </p>
              )}
            </CardHeader>
          </Card>
        </Link>

        {/* Saldo */}
        <Link href="/financeiro">
          <Card className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <CardHeader>
              <CardDescription>Saldo</CardDescription>
              <CardTitle className={`text-3xl ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyBalance)}
                {showYearly && (
                  <span className={`text-base ml-2 ${yearlyBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    / {formatCurrency(yearlyBalance)}
                  </span>
                )}
              </CardTitle>
              {showYearly && (
                <p className="text-xs text-zinc-500 mt-1">
                  Mês / Ano
                </p>
              )}
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

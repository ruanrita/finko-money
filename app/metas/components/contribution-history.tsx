"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ContributionWithDetails } from "@/src/modules/goals";
import { History, TrendingUp } from "lucide-react";

interface ContributionHistoryProps {
  contributions: ContributionWithDetails[];
}

export function ContributionHistory({ contributions }: ContributionHistoryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Contribuições
            </CardTitle>
            <CardDescription>
              {contributions.length} contribuiç
              {contributions.length === 1 ? "ão registrada" : "ões registradas"}
            </CardDescription>
          </div>
          {contributions.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalContributed)}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {contributions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
              <TrendingUp className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhuma contribuição ainda
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm">
              Use o formulário ao lado para registrar sua primeira contribuição.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-start justify-between gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold">
                      {formatCurrency(Number(contribution.amount))}
                    </span>
                    {contribution.transaction && (
                      <Badge variant="secondary" className="text-xs">
                        Vinculado à transação
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatDate(contribution.contributed_at)} às{" "}
                    {formatTime(contribution.contributed_at)}
                  </p>
                  {contribution.notes && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 italic">
                      "{contribution.notes}"
                    </p>
                  )}
                  {contribution.transaction && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Transação: {contribution.transaction.description}
                    </p>
                  )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

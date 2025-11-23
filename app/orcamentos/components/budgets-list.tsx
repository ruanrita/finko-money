"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Calendar, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteBudgetAction } from "../actions";
import { useRouter } from "next/navigation";
import { EditBudgetDialog } from "./edit-budget-dialog";
import type { BudgetWithStats } from "@/src/modules/budgets";

type Props = {
  budgets: BudgetWithStats[];
  selectedMonth: string;
};

export function BudgetsList({ budgets, selectedMonth }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(budgetId: string) {
    const result = await deleteBudgetAction(budgetId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erro ao deletar orçamento");
    }
    setDeletingId(null);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'ok':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-orange-500';
      case 'exceeded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  function getStatusBadge(status: string, percentage: number) {
    if (status === 'exceeded') {
      return <Badge variant="destructive">Excedido {percentage.toFixed(0)}%</Badge>;
    }
    if (status === 'danger') {
      return <Badge className="bg-orange-500">Atenção {percentage.toFixed(0)}%</Badge>;
    }
    if (status === 'warning') {
      return <Badge className="bg-yellow-500">Alerta {percentage.toFixed(0)}%</Badge>;
    }
    return <Badge variant="secondary">{percentage.toFixed(0)}%</Badge>;
  }

  const budgetToEdit = budgets.find((b) => b.id === editingId);

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Orçamentos por Categoria</CardTitle>
          <CardDescription>
            {budgets.length} {budgets.length === 1 ? "categoria" : "categorias"} com orçamento definido
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                Nenhum orçamento definido para este mês.
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                Crie um orçamento para começar a controlar seus gastos.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {budgets.map((budget) => {
                const isExceeded = budget.status === 'exceeded';
                const comparison = budget.previous_month_spent
                  ? ((budget.spent - budget.previous_month_spent) / budget.previous_month_spent) * 100
                  : 0;

                return (
                  <div
                    key={budget.id}
                    className="p-4 rounded-lg border-2 space-y-4 bg-white transition-all hover:border-brand hover:shadow-md dark:bg-zinc-950"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: budget.category.color + '20', color: budget.category.color }}
                        >
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{budget.category.name}</h3>
                            {getStatusBadge(budget.status, budget.percentage)}
                            {isExceeded && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>
                              {formatCurrency(budget.spent)} de {formatCurrency(budget.amount)}
                            </span>
                            {budget.previous_month_spent !== undefined && (
                              <span className="flex items-center gap-1">
                                {comparison > 0 ? (
                                  <>
                                    <TrendingUp className="h-3 w-3 text-red-600" />
                                    <span className="text-red-600">+{comparison.toFixed(0)}% vs mês anterior</span>
                                  </>
                                ) : comparison < 0 ? (
                                  <>
                                    <TrendingDown className="h-3 w-3 text-green-600" />
                                    <span className="text-green-600">{comparison.toFixed(0)}% vs mês anterior</span>
                                  </>
                                ) : (
                                  <span>Igual ao mês anterior</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(budget.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(budget.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {isExceeded ? (
                            <span className="text-red-600">Excedeu em {formatCurrency(Math.abs(budget.remaining))}</span>
                          ) : (
                            <span className="text-green-600">Restam {formatCurrency(budget.remaining)}</span>
                          )}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(budget.percentage, 100)}
                        className="h-2"
                        indicatorClassName={getStatusColor(budget.status)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Saldo Diário</span>
                        </div>
                        <p className="text-lg font-semibold">
                          {formatCurrency(budget.daily_available)}
                          <span className="text-xs text-muted-foreground ml-1">/dia</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {budget.days_remaining} {budget.days_remaining === 1 ? "dia restante" : "dias restantes"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Saldo Semanal</span>
                        </div>
                        <p className="text-lg font-semibold">
                          {formatCurrency(budget.weekly_available)}
                          <span className="text-xs text-muted-foreground ml-1">/semana</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Média para os próximos 7 dias
                        </p>
                      </div>
                    </div>

                    {deletingId === budget.id && (
                      <AlertDialog
                        open={deletingId === budget.id}
                        onOpenChange={(open) => !open && setDeletingId(null)}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar orçamento</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar o orçamento de {budget.category.name}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(budget.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {budgetToEdit && (
        <EditBudgetDialog
          budget={budgetToEdit}
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
        />
      )}
    </>
  );
}

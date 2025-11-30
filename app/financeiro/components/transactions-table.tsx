"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteTransaction, markAsPaid, markAsUnpaid } from "../actions";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { MonthNavigation } from "./month-navigation";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  installment_type: "a_vista" | "parcelado";
  installments_count: number | null;
  current_installment: number | null;
  is_recurring: boolean;
  categories: {
    name: string;
    color: string;
  } | null;
};

interface TransactionsTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  selectedMonth?: string;
  onUpdate?: () => void;
}

export function TransactionsTable({ transactions, onEdit, selectedMonth, onUpdate }: TransactionsTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta transação?")) {
      return;
    }

    setLoading(id);
    const result = await deleteTransaction(id);
    setLoading(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Transação deletada com sucesso!");
      onUpdate?.(); // Atualiza a lista
    }
  };

  const handleTogglePaid = async (id: string, isPaid: boolean) => {
    setLoading(id);
    const result = isPaid ? await markAsUnpaid(id) : await markAsPaid(id);
    setLoading(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isPaid ? "Marcado como pendente!" : "Marcado como pago!");
      onUpdate?.(); // Atualiza a lista imediatamente
    }
  };

  const getStatus = (transaction: Transaction) => {
    if (transaction.paid_at) {
      return { label: "Pago", variant: "success" as const };
    }

    const dueDate = new Date(transaction.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return { label: "Atrasado", variant: "destructive" as const };
    }

    return { label: "Pendente", variant: "secondary" as const };
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return "-";
    const labels: Record<string, string> = {
      pix: "PIX",
      boleto: "Boleto",
      credito: "Cartão de Crédito",
      debito: "Cartão de Débito",
    };
    return labels[method] || method;
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma transação encontrada</CardTitle>
          <CardDescription>
            Comece adicionando suas primeiras despesas ou receitas!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        {selectedMonth ? (
          <MonthNavigation selectedMonth={selectedMonth} title="Transações" />
        ) : (
          <CardTitle className="text-xl sm:text-2xl">Transações</CardTitle>
        )}
        <CardDescription className="text-xs sm:text-sm">
          Lista de todas as suas despesas e receitas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Cards View */}
        <div className="block md:hidden space-y-3">
          {transactions.map((transaction) => {
            const status = getStatus(transaction);
            const isPaid = !!transaction.paid_at;

            return (
              <div key={transaction.id} className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(transaction.due_date)}</p>
                  </div>
                  <Badge variant={status.variant} className="text-xs">
                    {status.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={transaction.type === "income" ? "success" : "destructive"} className="text-xs">
                    {transaction.type === "income" ? "Receita" : "Despesa"}
                  </Badge>
                  {transaction.categories && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: `${transaction.categories.color}20`, color: transaction.categories.color }}
                    >
                      {transaction.categories.name}
                    </Badge>
                  )}
                  {transaction.installment_type === "parcelado" && (
                    <span className="text-xs text-purple-600 dark:text-purple-400">
                      {transaction.current_installment || 1}/{transaction.installments_count}x
                    </span>
                  )}
                  {transaction.is_recurring && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">🔄 Recorrente</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className={`text-lg font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(Number(transaction.amount))}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleTogglePaid(transaction.id, isPaid)}
                      disabled={loading === transaction.id}
                      className="h-8 w-8"
                    >
                      {isPaid ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(transaction)}
                      disabled={loading === transaction.id}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(transaction.id)}
                      disabled={loading === transaction.id}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-lg border-2 border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-sky-50 border-gray-300 hover:from-blue-50 hover:to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
                <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Data
                </TableHead>
                <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Descrição
                </TableHead>
                <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Categoria
                </TableHead>
                <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Tipo
                </TableHead>
                <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Método
                </TableHead>
                <TableHead className="text-right font-semibold text-zinc-700 dark:text-zinc-300">
                  Valor
                </TableHead>
                <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-zinc-700 dark:text-zinc-300">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => {
                const status = getStatus(transaction);
                const isPaid = !!transaction.paid_at;

                return (
                  <TableRow
                    key={transaction.id}
                    className={`
                      transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20 border-border
                      ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'}
                    `}
                  >
                    <TableCell className="text-sm">
                      {formatDate(transaction.due_date)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {transaction.description}
                      {transaction.installment_type === "parcelado" && transaction.installments_count && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <span className="text-xs text-purple-600 dark:text-purple-400">
                            {transaction.current_installment || 1}/{transaction.installments_count}x
                          </span>
                        </span>
                      )}
                      {transaction.is_recurring && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <span className="text-xs text-blue-600 dark:text-blue-400">🔄</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">Recorrente</span>
                        </span>
                      )}
                      {(transaction as any).is_virtual_occurrence && (
                        <span className="ml-2 text-xs text-zinc-500">(Virtual)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.categories ? (
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: `${transaction.categories.color}20`, color: transaction.categories.color }}
                        >
                          {transaction.categories.name}
                        </Badge>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant={transaction.type === "income" ? "success" : "destructive"}>
                        {transaction.type === "income" ? "Receita" : "Despesa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getPaymentMethodLabel(transaction.payment_method)}
                    </TableCell>
                    <TableCell className={`text-right text-sm font-bold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleTogglePaid(transaction.id, isPaid)}
                          disabled={loading === transaction.id}
                          className={isPaid ? "hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-all" : "hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-400 transition-all"}
                          title={isPaid ? "Marcar como Pendente" : "Marcar como Pago"}
                        >
                          {isPaid ? <X className="h-4 w-4 text-amber-600 dark:text-amber-500" /> : <Check className="h-4 w-4 text-green-600 dark:text-green-500" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(transaction)}
                          disabled={loading === transaction.id}
                          className="hover:bg-brand hover:text-white transition-all"
                          title="Editar transação"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(transaction.id)}
                          disabled={loading === transaction.id}
                          className="hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all"
                          title="Deletar transação"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

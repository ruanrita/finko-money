"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTransaction, markAsPaid, markAsUnpaid } from "../actions";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";

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
}

export function TransactionsTable({ transactions, onEdit }: TransactionsTableProps) {
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
      <CardHeader>
        <CardTitle>Transações</CardTitle>
        <CardDescription>
          Lista de todas as suas despesas e receitas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="pb-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Data
                </th>
                <th className="pb-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Descrição
                </th>
                <th className="pb-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Categoria
                </th>
                <th className="pb-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Tipo
                </th>
                <th className="pb-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Método
                </th>
                <th className="pb-3 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Valor
                </th>
                <th className="pb-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="pb-3 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const status = getStatus(transaction);
                const isPaid = !!transaction.paid_at;

                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <td className="py-4 text-sm">
                      {formatDate(transaction.due_date)}
                    </td>
                    <td className="py-4 text-sm font-medium">
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
                    </td>
                    <td className="py-4 text-sm">
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
                    </td>
                    <td className="py-4 text-sm">
                      <Badge variant={transaction.type === "income" ? "success" : "destructive"}>
                        {transaction.type === "income" ? "Receita" : "Despesa"}
                      </Badge>
                    </td>
                    <td className="py-4 text-sm">
                      {getPaymentMethodLabel(transaction.payment_method)}
                    </td>
                    <td className={`py-4 text-right text-sm font-bold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </td>
                    <td className="py-4 text-sm">
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

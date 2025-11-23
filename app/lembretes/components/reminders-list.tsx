"use client";

import { useState } from "react";
import { Bell, BellOff, Trash2, Pencil, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { deleteReminderAction, markReminderAsSentAction } from "../actions";
import { useRouter } from "next/navigation";
import { EditReminderDialog } from "./edit-reminder-dialog";

type Reminder = {
  id: string;
  transaction_id: string;
  days_before: number;
  sent_at: string | null;
  created_at: string;
  transactions: {
    id: string;
    description: string;
    amount: number;
    due_date: string;
    type: string;
  } | null;
};

type Props = {
  reminders: Reminder[];
};

export function RemindersList({ reminders }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(reminderId: string) {
    const result = await deleteReminderAction(reminderId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erro ao deletar lembrete");
    }
    setDeletingId(null);
  }

  async function handleMarkAsSent(reminderId: string) {
    const result = await markReminderAsSentAction(reminderId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erro ao marcar lembrete como enviado");
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  const reminderToEdit = reminders.find((r) => r.id === editingId);

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Meus Lembretes</CardTitle>
          <CardDescription>
            {reminders.length} {reminders.length === 1 ? "lembrete" : "lembretes"} cadastrado{reminders.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <BellOff className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-medium text-card-foreground">
                Nenhum lembrete cadastrado ainda.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Crie lembretes para não perder o vencimento das suas transações.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const isSent = !!reminder.sent_at;
                const transaction = reminder.transactions;

                return (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-border bg-card transition-all hover:border-brand hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isSent ? "bg-gray-100 text-gray-600" : "bg-indigo-100 text-indigo-600"}`}>
                        {isSent ? (
                          <BellOff className="h-5 w-5" />
                        ) : (
                          <Bell className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {transaction?.description || "Transação removida"}
                          </p>
                          {isSent ? (
                            <Badge variant="secondary">Enviado</Badge>
                          ) : (
                            <Badge variant="default">Ativo</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {transaction && (
                            <>
                              <span>{formatCurrency(transaction.amount)}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Vencimento: {formatDate(transaction.due_date)}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Lembrar {reminder.days_before} {reminder.days_before === 1 ? "dia" : "dias"} antes
                          {isSent && ` • Enviado em ${formatDate(reminder.sent_at!)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSent && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(reminder.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsSent(reminder.id)}
                            title="Marcar como enviado"
                          >
                            <BellOff className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>

                    {deletingId === reminder.id && (
                      <AlertDialog
                        open={deletingId === reminder.id}
                        onOpenChange={(open) => !open && setDeletingId(null)}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar lembrete</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar este lembrete? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(reminder.id)}
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

      {reminderToEdit && (
        <EditReminderDialog
          reminder={reminderToEdit}
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
        />
      )}
    </>
  );
}

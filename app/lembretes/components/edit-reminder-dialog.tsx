"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateReminderAction } from "../actions";
import { useRouter } from "next/navigation";

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
  reminder: Reminder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditReminderDialog({ reminder, open, onOpenChange }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [daysBefore, setDaysBefore] = useState(reminder.days_before);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await updateReminderAction(reminder.id, {
      days_before: daysBefore,
    });

    if (result.success) {
      onOpenChange(false);
      router.refresh();
    } else {
      alert(result.error || "Erro ao atualizar lembrete");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Lembrete</DialogTitle>
            <DialogDescription>
              Altere o número de dias antes do vencimento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transação</Label>
              <p className="text-sm text-muted-foreground">
                {reminder.transactions?.description || "Transação removida"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days_before">Dias antes do vencimento</Label>
              <Input
                id="days_before"
                type="number"
                min="0"
                max="365"
                value={daysBefore}
                onChange={(e) => setDaysBefore(parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Você será notificado {daysBefore} {daysBefore === 1 ? "dia" : "dias"} antes do vencimento
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

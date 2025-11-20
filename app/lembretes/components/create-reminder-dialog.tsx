"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReminderAction } from "../actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Transaction = {
  id: string;
  description: string;
  due_date: string;
  amount: number;
};

export function CreateReminderDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState({
    transaction_id: "",
    days_before: 1,
  });

  useEffect(() => {
    if (open) {
      loadTransactions();
    }
  }, [open]);

  async function loadTransactions() {
    const supabase = createClient();

    const { data } = await supabase
      .from("transactions")
      .select("id, description, due_date, amount")
      .is("paid_at", null)
      .order("due_date", { ascending: true });

    if (data) {
      setTransactions(data);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await createReminderAction(formData);

    if (result.success) {
      setOpen(false);
      setFormData({ transaction_id: "", days_before: 1 });
      router.refresh();
    } else {
      alert(result.error || "Erro ao criar lembrete");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lembrete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Lembrete</DialogTitle>
            <DialogDescription>
              Configure um lembrete para uma transação pendente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_id">Transação</Label>
              <Select
                value={formData.transaction_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, transaction_id: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma transação" />
                </SelectTrigger>
                <SelectContent>
                  {transactions.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhuma transação pendente
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <SelectItem key={transaction.id} value={transaction.id}>
                        {transaction.description} - R$ {transaction.amount.toFixed(2)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days_before">Dias antes do vencimento</Label>
              <Input
                id="days_before"
                type="number"
                min="0"
                max="365"
                value={formData.days_before}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    days_before: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Você será notificado {formData.days_before} {formData.days_before === 1 ? "dia" : "dias"} antes do vencimento
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.transaction_id}>
              {loading ? "Criando..." : "Criar Lembrete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

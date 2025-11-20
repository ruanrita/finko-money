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
import { Checkbox } from "@/components/ui/checkbox";
import { updateBudgetAction } from "../actions";
import { useRouter } from "next/navigation";
import type { BudgetWithStats } from "@/src/modules/budgets";

type Props = {
  budget: BudgetWithStats;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditBudgetDialog({ budget, open, onOpenChange }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: budget.amount,
    rollover: budget.rollover,
    alert_80: budget.alert_80,
    alert_90: budget.alert_90,
    alert_100: budget.alert_100,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await updateBudgetAction(budget.id, formData);

    if (result.success) {
      onOpenChange(false);
      router.refresh();
    } else {
      alert(result.error || "Erro ao atualizar orçamento");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Orçamento</DialogTitle>
            <DialogDescription>
              Altere o orçamento de {budget.category.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor do Orçamento</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Alertas</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_alert_80"
                    checked={formData.alert_80}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, alert_80: !!checked }))
                    }
                  />
                  <label
                    htmlFor="edit_alert_80"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Alerta em 80%
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_alert_90"
                    checked={formData.alert_90}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, alert_90: !!checked }))
                    }
                  />
                  <label
                    htmlFor="edit_alert_90"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Alerta em 90%
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_alert_100"
                    checked={formData.alert_100}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, alert_100: !!checked }))
                    }
                  />
                  <label
                    htmlFor="edit_alert_100"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Alerta em 100%
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_rollover"
                checked={formData.rollover}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, rollover: !!checked }))
                }
              />
              <label
                htmlFor="edit_rollover"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Rollover (sobra passa para o próximo mês)
              </label>
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
            <Button type="submit" disabled={loading || formData.amount <= 0}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Checkbox } from "@/components/ui/checkbox";
import { createBudgetAction } from "../actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QuickCreateCategory } from "@/components/quick-create-category";
import { CategoryIcon } from "@/components/category-icon";

type Category = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
};

type Props = {
  selectedMonth: string;
};

export function CreateBudgetDialog({ selectedMonth }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: 0,
    rollover: false,
    alert_80: true,
    alert_90: true,
    alert_100: true,
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  async function loadCategories() {
    const supabase = createClient();

    const { data } = await supabase
      .from("categories")
      .select("id, name, color, icon")
      .order("name", { ascending: true });

    if (data) {
      setCategories(data);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await createBudgetAction({
      ...formData,
      month: selectedMonth,
    });

    if (result.success) {
      setOpen(false);
      setFormData({
        category_id: "",
        amount: 0,
        rollover: false,
        alert_80: true,
        alert_90: true,
        alert_100: true,
      });
      router.refresh();
    } else {
      alert(result.error || "Erro ao criar orçamento");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Orçamento</DialogTitle>
            <DialogDescription>
              Defina um orçamento mensal para uma categoria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category_id">Categoria</Label>
                <QuickCreateCategory
                  variant="compact"
                  onCategoryCreated={(newCategory) => {
                    setCategories((prev) => [...prev, newCategory]);
                    setFormData((prev) => ({ ...prev, category_id: newCategory.id }));
                  }}
                />
              </div>

              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category_id: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhuma categoria disponível
                    </div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            <CategoryIcon iconName={category.icon} className="h-4 w-4" />
                          </div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

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
                    id="alert_80"
                    checked={formData.alert_80}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, alert_80: !!checked }))
                    }
                  />
                  <label
                    htmlFor="alert_80"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Alerta em 80%
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="alert_90"
                    checked={formData.alert_90}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, alert_90: !!checked }))
                    }
                  />
                  <label
                    htmlFor="alert_90"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Alerta em 90%
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="alert_100"
                    checked={formData.alert_100}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, alert_100: !!checked }))
                    }
                  />
                  <label
                    htmlFor="alert_100"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Alerta em 100%
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rollover"
                checked={formData.rollover}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, rollover: !!checked }))
                }
              />
              <label
                htmlFor="rollover"
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.category_id || formData.amount <= 0}>
              {loading ? "Criando..." : "Criar Orçamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

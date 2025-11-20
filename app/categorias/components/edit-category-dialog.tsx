"use client";

import { useState } from "react";
import { Check, ShoppingCart, Home, Car, Coffee, Utensils, Heart, Plane, GraduationCap, Gamepad2, Shirt, Wrench, Smartphone, Gift, DollarSign } from "lucide-react";
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
import { updateCategoryAction } from "../actions";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#ef4444", // vermelho
  "#f97316", // laranja
  "#eab308", // amarelo
  "#22c55e", // verde
  "#3b82f6", // azul
  "#6366f1", // índigo
  "#a855f7", // roxo
  "#ec4899", // rosa
  "#6b7280", // cinza
  "#14b8a6", // teal
  "#f59e0b", // âmbar
  "#8b5cf6", // violeta
  "#06b6d4", // cyan
];

const PRESET_ICONS = [
  { name: "ShoppingCart", Icon: ShoppingCart, label: "Compras" },
  { name: "Home", Icon: Home, label: "Casa" },
  { name: "Car", Icon: Car, label: "Transporte" },
  { name: "Coffee", Icon: Coffee, label: "Café" },
  { name: "Utensils", Icon: Utensils, label: "Alimentação" },
  { name: "Heart", Icon: Heart, label: "Saúde" },
  { name: "Plane", Icon: Plane, label: "Viagem" },
  { name: "GraduationCap", Icon: GraduationCap, label: "Educação" },
  { name: "Gamepad2", Icon: Gamepad2, label: "Lazer" },
  { name: "Shirt", Icon: Shirt, label: "Vestuário" },
  { name: "Wrench", Icon: Wrench, label: "Manutenção" },
  { name: "Smartphone", Icon: Smartphone, label: "Tecnologia" },
  { name: "Gift", Icon: Gift, label: "Presentes" },
  { name: "DollarSign", Icon: DollarSign, label: "Outros" },
];

type Category = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
  onCategoryUpdated: (category: Category) => void;
};

export function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  onCategoryUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [icon, setIcon] = useState(category.icon || "ShoppingCart");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    setLoading(true);

    const result = await updateCategoryAction(category.id, {
      name: name.trim(),
      color,
      icon,
    });

    if (result.success) {
      toast.success("Categoria atualizada com sucesso!");
      onCategoryUpdated({
        ...category,
        name: name.trim(),
        color,
        icon,
      });
    } else {
      toast.error(result.error || "Erro ao atualizar categoria");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Atualize o nome, ícone e a cor da categoria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Nome da Categoria</Label>
              <Input
                id="edit-category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alimentação"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-7 gap-2">
                {PRESET_ICONS.map(({ name: iconName, Icon }) => (
                  <button
                    key={iconName}
                    type="button"
                    className={`h-10 w-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                      icon === iconName
                        ? "border-primary bg-primary/10 scale-110"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                    onClick={() => setIcon(iconName)}
                    title={PRESET_ICONS.find((i) => i.name === iconName)?.label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="grid grid-cols-7 gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-10 w-10 rounded-lg border-2 transition-all ${
                      color === c
                        ? "border-primary scale-110"
                        : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  >
                    {color === c && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
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
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

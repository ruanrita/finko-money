"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Target } from "lucide-react";
import { toast } from "sonner";

const goalTypes = [
  { value: "savings", label: "Poupança Geral", icon: "💰" },
  { value: "purchase", label: "Compra Específica", icon: "🛍️" },
  { value: "debt_payoff", label: "Quitar Dívida", icon: "💳" },
];

const priorities = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

const iconOptions = [
  "🎯", "💰", "🏠", "🚗", "✈️", "🎓", "💍", "📱", "💻", "🎮",
  "🎸", "🏋️", "🌴", "🎨", "📚", "🏖️", "🎭", "🎪", "🎬", "🎤",
];

export function CreateGoalForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "🎯",
    goal_type: "savings",
    priority: "medium",
    target_amount: "",
    target_date: "",
    monthly_target: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetAmount = parseFloat(formData.target_amount);

    if (!formData.name || targetAmount <= 0) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          target_amount: targetAmount,
          monthly_target: formData.monthly_target ? parseFloat(formData.monthly_target) : undefined,
          target_date: formData.target_date || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar meta");
      }

      const result = await response.json();

      toast.success("Meta criada com sucesso!", {
        description: `"${formData.name}" foi adicionada às suas metas`,
      });

      router.push(`/metas/${result.goal.id}`);
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      toast.error("Erro ao criar meta", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const targetAmount = parseFloat(formData.target_amount) || 0;
  const monthlyTarget = parseFloat(formData.monthly_target) || 0;
  const monthsToComplete = monthlyTarget > 0 ? Math.ceil(targetAmount / monthlyTarget) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle>Criar Outra Meta</CardTitle>
            <CardDescription>
              Defina uma meta personalizada para seus objetivos financeiros
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Nome */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome da Meta *</Label>
              <Input
                id="name"
                placeholder="Ex: Viagem para Paris, Carro Novo, MBA..."
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                disabled={isLoading}
                maxLength={100}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Adicione detalhes sobre sua meta..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isLoading}
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="goal_type">Tipo de Meta *</Label>
              <Select
                value={formData.goal_type}
                onValueChange={(value) => handleChange("goal_type", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="goal_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ícone */}
            <div className="space-y-2 md:col-span-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleChange("icon", icon)}
                    disabled={isLoading}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 text-2xl transition-all hover:scale-110 ${
                      formData.icon === icon
                        ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Valor Alvo */}
            <div className="space-y-2">
              <Label htmlFor="target_amount">Valor Alvo *</Label>
              <Input
                id="target_amount"
                type="number"
                placeholder="0.00"
                value={formData.target_amount}
                onChange={(e) => handleChange("target_amount", e.target.value)}
                min={1}
                step={0.01}
                required
                disabled={isLoading}
              />
              {targetAmount > 0 && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Meta: {formatCurrency(targetAmount)}
                </p>
              )}
            </div>

            {/* Data Alvo */}
            <div className="space-y-2">
              <Label htmlFor="target_date">Data Alvo (opcional)</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => handleChange("target_date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                disabled={isLoading}
              />
            </div>

            {/* Meta Mensal */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="monthly_target">Meta Mensal (opcional)</Label>
              <Input
                id="monthly_target"
                type="number"
                placeholder="0.00"
                value={formData.monthly_target}
                onChange={(e) => handleChange("monthly_target", e.target.value)}
                min={1}
                step={0.01}
                disabled={isLoading}
              />
              {monthsToComplete > 0 && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Você atingirá a meta em aproximadamente {monthsToComplete} meses
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/metas")}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Criar Meta
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

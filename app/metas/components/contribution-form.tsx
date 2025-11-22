"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContributionFormProps {
  goalId: string;
  goalName: string;
  isActive: boolean;
  isAchieved: boolean;
  currentAmount: number;
  targetAmount: number;
}

export function ContributionForm({
  goalId,
  goalName,
  isActive,
  isAchieved,
  currentAmount,
  targetAmount,
}: ContributionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const parseAmount = (value: string): number => {
    // Remove tudo exceto dígitos
    const digits = value.replace(/\D/g, "");
    // Converte para número dividindo por 100 (últimos 2 dígitos são centavos)
    return parseInt(digits || "0") / 100;
  };

  const formatInputValue = (value: string): string => {
    const numericValue = parseAmount(value);
    return formatCurrency(numericValue);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setAmount(formatInputValue(rawValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contributionAmount = parseAmount(amount);

    if (contributionAmount <= 0) {
      toast.error("Valor inválido", {
        description: "O valor da contribuição deve ser maior que zero",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/goals/${goalId}/contributions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: contributionAmount,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao registrar contribuição");
      }

      const result = await response.json();

      toast.success("Contribuição registrada!", {
        description: `Você contribuiu ${formatCurrency(contributionAmount)} para "${goalName}"`,
      });

      // Limpar formulário
      setAmount("");
      setNotes("");

      // Recarregar página para atualizar dados
      router.refresh();
    } catch (error) {
      console.error("Erro ao registrar contribuição:", error);
      toast.error("Erro ao registrar contribuição", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const remainingAmount = targetAmount - currentAmount;
  const canContribute = isActive && !isAchieved;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Contribuição
        </CardTitle>
        <CardDescription>
          {canContribute
            ? `Registre suas contribuições para "${goalName}"`
            : isAchieved
            ? "Meta já alcançada!"
            : "Meta inativa"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canContribute ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="text"
                placeholder="R$ 0,00"
                value={amount}
                onChange={handleAmountChange}
                disabled={isLoading}
                required
              />
              {remainingAmount > 0 && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Faltam {formatCurrency(remainingAmount)} para atingir a meta
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Ex: Salário de janeiro, bônus, venda de item..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Contribuição
                  </>
                )}
              </Button>
            </div>

            {/* Quick amount buttons */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                Valores rápidos:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(formatCurrency(value))}
                    disabled={isLoading}
                  >
                    {formatCurrency(value)}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {isAchieved
                ? "Parabéns por alcançar sua meta! 🎉"
                : "Ative a meta para começar a contribuir"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

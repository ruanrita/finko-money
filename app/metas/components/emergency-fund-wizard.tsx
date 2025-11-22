"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface EmergencyFundWizardProps {
  suggestion: {
    suggested_amount: number;
    monthly_expenses: number;
    months: number;
  };
}

export function EmergencyFundWizard({ suggestion }: EmergencyFundWizardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [targetAmount, setTargetAmount] = useState(suggestion.suggested_amount);
  const [monthlyTarget, setMonthlyTarget] = useState(
    Math.round(suggestion.suggested_amount / 12)
  );
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 12);
    return date.toISOString().split("T")[0];
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Reserva de Emergência",
          description: `Reserva para cobrir ${suggestion.months} meses de despesas (baseado em ${formatCurrency(
            suggestion.monthly_expenses
          )}/mês)`,
          icon: "🚨",
          goal_type: "emergency_fund",
          priority: "critical",
          target_amount: targetAmount,
          target_date: targetDate,
          monthly_target: monthlyTarget,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar meta");
      }

      const result = await response.json();

      toast.success("Reserva de Emergência criada!", {
        description: "Comece a contribuir para sua segurança financeira",
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

  const monthsToComplete = targetDate
    ? Math.max(1, Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 12;

  const suggestedMonthly = Math.round(targetAmount / monthsToComplete);

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-900/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <CardTitle>Criar Reserva de Emergência</CardTitle>
            <CardDescription>
              Meta recomendada baseada no seu histórico de despesas
            </CardDescription>
          </div>
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Prioridade Crítica
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações calculadas */}
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Despesa mensal média:
              </span>
              <span className="font-semibold">
                {formatCurrency(suggestion.monthly_expenses)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Período recomendado:
              </span>
              <span className="font-semibold">{suggestion.months} meses</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-sm font-medium">Valor sugerido:</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(suggestion.suggested_amount)}
              </span>
            </div>
          </div>

          {/* Customização */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Valor da Meta *</Label>
              <Input
                id="targetAmount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(parseFloat(e.target.value))}
                min={1000}
                step={100}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Você pode ajustar o valor sugerido conforme sua necessidade
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">
                <Calendar className="inline h-3.5 w-3.5 mr-1" />
                Data Alvo (opcional)
              </Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyTarget">
                <TrendingUp className="inline h-3.5 w-3.5 mr-1" />
                Meta Mensal Sugerida
              </Label>
              <Input
                id="monthlyTarget"
                type="number"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(parseFloat(e.target.value))}
                min={100}
                step={50}
                disabled={isLoading}
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Para atingir em {monthsToComplete} meses, contribua{" "}
                {formatCurrency(suggestedMonthly)}/mês
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              💡 Por que ter uma Reserva de Emergência?
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Protege você de imprevistos (demissão, emergências médicas)</li>
              <li>• Evita endividamento em situações de crise</li>
              <li>• Proporciona tranquilidade e segurança financeira</li>
              <li>• É a base para construir patrimônio</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando Reserva...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Criar Reserva de Emergência
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

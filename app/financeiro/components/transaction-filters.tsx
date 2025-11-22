"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Category = {
  id: string;
  name: string;
};

interface TransactionFiltersProps {
  categories: Category[];
}

export function TransactionFilters({ categories }: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "all";
  const category = searchParams.get("category") || "all";
  const status = searchParams.get("status") || "all";
  const installmentType = searchParams.get("installment") || "all";
  const paymentMethod = searchParams.get("method") || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/financeiro?${params.toString()}`);
  };

  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthYear = searchParams.get("month") || `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  const updateMonth = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", value);
    router.push(`/financeiro?${params.toString()}`);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = monthYear.split("-").map(Number);
    const date = new Date(year, month - 1, 1);

    if (direction === "prev") {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }

    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    updateMonth(newMonth);
  };

  // Generate month options (last 12 months from current date)
  const generateMonthOptions = () => {
    const options = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const value = `${year}-${String(month).padStart(2, "0")}`;
      const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
    });

    // Add selected month if not in list (for navigation to future/past months)
    if (!options.find(opt => opt.value === monthYear)) {
      const [year, month] = monthYear.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      options.push({
        value: monthYear,
        label: label.charAt(0).toUpperCase() + label.slice(1)
      });
      // Sort by date (newest first)
      options.sort((a, b) => b.value.localeCompare(a.value));
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {/* Período com Navegação */}
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium">Período</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                className="shrink-0"
              >
                ←
              </Button>
              <Select value={monthYear} onValueChange={updateMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                className="shrink-0"
              >
                →
              </Button>
            </div>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={type} onValueChange={(value) => updateFilter("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select value={category} onValueChange={(value) => updateFilter("category", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Forma</label>
            <Select value={installmentType} onValueChange={(value) => updateFilter("installment", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="a_vista">À Vista</SelectItem>
                <SelectItem value="parcelado">Parcelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Método</label>
            <Select value={paymentMethod} onValueChange={(value) => updateFilter("method", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="credito">Cartão de Crédito</SelectItem>
                <SelectItem value="debito">Cartão de Débito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

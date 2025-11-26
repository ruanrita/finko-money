"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [isOpen, setIsOpen] = useState(false);

  const type = searchParams.get("type") || "all";
  const category = searchParams.get("category") || "all";
  const status = searchParams.get("status") || "all";
  const installmentType = searchParams.get("installment") || "all";
  const paymentMethod = searchParams.get("method") || "all";

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (type !== "all") count++;
    if (category !== "all") count++;
    if (status !== "all") count++;
    if (installmentType !== "all") count++;
    if (paymentMethod !== "all") count++;
    return count;
  }, [type, category, status, installmentType, paymentMethod]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/financeiro?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    params.delete("category");
    params.delete("status");
    params.delete("installment");
    params.delete("method");
    router.push(`/financeiro?${params.toString()}`);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2 text-xs sm:text-sm">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="rounded-lg border border-gray-300 bg-card p-4 sm:p-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tipo */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Tipo</label>
              <Select value={type} onValueChange={(value) => updateFilter("type", value)}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs sm:text-sm">Todos</SelectItem>
                  <SelectItem value="income" className="text-xs sm:text-sm">Receitas</SelectItem>
                  <SelectItem value="expense" className="text-xs sm:text-sm">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Categoria</label>
              <Select value={category} onValueChange={(value) => updateFilter("category", value)}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs sm:text-sm">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs sm:text-sm">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(value) => updateFilter("status", value)}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs sm:text-sm">Todos</SelectItem>
                  <SelectItem value="paid" className="text-xs sm:text-sm">Pago</SelectItem>
                  <SelectItem value="pending" className="text-xs sm:text-sm">Pendente</SelectItem>
                  <SelectItem value="overdue" className="text-xs sm:text-sm">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Forma</label>
              <Select value={installmentType} onValueChange={(value) => updateFilter("installment", value)}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs sm:text-sm">Todas</SelectItem>
                  <SelectItem value="a_vista" className="text-xs sm:text-sm">À Vista</SelectItem>
                  <SelectItem value="parcelado" className="text-xs sm:text-sm">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Método</label>
              <Select value={paymentMethod} onValueChange={(value) => updateFilter("method", value)}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs sm:text-sm">Todos</SelectItem>
                  <SelectItem value="pix" className="text-xs sm:text-sm">PIX</SelectItem>
                  <SelectItem value="boleto" className="text-xs sm:text-sm">Boleto</SelectItem>
                  <SelectItem value="credito" className="text-xs sm:text-sm">Cartão de Crédito</SelectItem>
                  <SelectItem value="debito" className="text-xs sm:text-sm">Cartão de Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão para limpar filtros */}
            {activeFiltersCount > 0 && (
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="w-full text-xs sm:text-sm"
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

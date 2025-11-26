"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavigationProps {
  selectedMonth: string; // "2025-11"
  title: string;
}

export function MonthNavigation({ selectedMonth, title }: MonthNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);

    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth);
    router.push(`/financeiro?${params.toString()}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + 1);

    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth);
    router.push(`/financeiro?${params.toString()}`);
  };

  // Formatar mês para exibição (ex: "Novembro 2025")
  const getDisplayMonth = () => {
    const [year, monthNum] = selectedMonth.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1);
    const formatted = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const displayMonth = getDisplayMonth();

  return (
    <div className="flex items-center justify-between">
      <span className="text-lg font-semibold">{title}</span>

      <div className="flex items-center gap-1 rounded-lg bg-cyan-100 p-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8 hover:bg-gray-300 bg-white cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="px-3 text-sm font-medium whitespace-nowrap">
          {displayMonth}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8 hover:bg-gray-300 bg-white cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

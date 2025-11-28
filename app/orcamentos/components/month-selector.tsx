"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  selectedMonth: string;
};

export function MonthSelector({ selectedMonth }: Props) {
  const router = useRouter();

  // Parse da data garantindo interpretação local
  const [year, month] = selectedMonth.split('-').map(Number);
  const currentDate = new Date(year, month - 1, 1); // month - 1 porque JS é 0-indexed

  const monthName = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  function navigateMonth(direction: 'prev' | 'next') {
    const newDate = new Date(year, month - 1, 1);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-01`;

    // Use replace + refresh para forçar reload da página com novos dados
    router.replace(`/orcamentos?month=${newMonth}`);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateMonth('prev')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-lg sm:text-xl font-semibold capitalize min-w-[180px] sm:min-w-[200px] text-center">
        {monthName}
      </h2>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateMonth('next')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

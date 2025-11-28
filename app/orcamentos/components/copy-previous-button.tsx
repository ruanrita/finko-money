"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { copyFromPreviousMonthAction } from "../actions";

type Props = {
  selectedMonth: string;
};

export function CopyPreviousButton({ selectedMonth }: Props) {
  const router = useRouter();

  async function handleCopyPrevious() {
    const result = await copyFromPreviousMonthAction(selectedMonth);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erro ao copiar orçamentos");
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleCopyPrevious}
      className="w-full sm:w-auto"
    >
      <Copy className="h-4 w-4 mr-2" />
      Copiar do Mês Anterior
    </Button>
  );
}

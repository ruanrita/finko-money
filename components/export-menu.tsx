"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel, exportToPDF, generateFilename } from "@/lib/export-utils";
import { toast } from "sonner";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  installment_type: "a_vista" | "parcelado";
  installments_count: number | null;
  current_installment: number | null;
  is_recurring: boolean;
  recurrence_type: "monthly" | "weekly" | "yearly" | null;
  tags: string[] | null;
  category_id: string | null;
  categories: {
    name: string;
    color: string;
  } | null;
};

interface ExportMenuProps {
  transactions: Transaction[];
  month: string;
  disabled?: boolean;
}

export function ExportMenu({ transactions, month, disabled = false }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    if (transactions.length === 0) {
      toast.error("Não há transações para exportar");
      return;
    }

    setIsExporting(true);

    try {
      const filename = generateFilename(month, "transacoes");

      switch (format) {
        case "csv":
          exportToCSV(transactions, filename);
          toast.success("Arquivo CSV exportado com sucesso!");
          break;
        case "excel":
          exportToExcel(transactions, filename);
          toast.success("Arquivo Excel exportado com sucesso!");
          break;
        case "pdf":
          exportToPDF(transactions, filename);
          toast.success("Arquivo PDF exportado com sucesso!");
          break;
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar arquivo");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || transactions.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border-gray-300">
        <DropdownMenuLabel>Formato de exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")} disabled={isExporting}>
          <File className="mr-2 h-4 w-4" />
          <span>Exportar CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")} disabled={isExporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Exportar Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Exportar PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

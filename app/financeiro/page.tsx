"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FinancialChart } from "./components/financial-chart";
import { TransactionsTable } from "./components/transactions-table";
import { TransactionFilters } from "./components/transaction-filters";
import { TransactionDialog } from "./components/transaction-dialog";
import { createClient } from "@/lib/supabase/client";
import { generateRecurringOccurrences } from "@/lib/recurring-utils";

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

type Category = {
  id: string;
  name: string;
};

export default function FinanceiroPage() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [currentMonth, setCurrentMonth] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  async function fetchData() {
    setLoading(true);

    // Get current month
    const now = new Date();
    const monthParam = searchParams.get("month") || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [year, month] = monthParam.split("-").map(Number);

    setCurrentMonth(monthParam); // Salvar o mês atual no estado

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");

    if (categoriesData) {
      setCategories(categoriesData);
    }

    // Build query para transações do mês
    let query = supabase
      .from("transactions")
      .select("*, categories(name, color)")
      .gte("due_date", startDate)
      .lte("due_date", endDate)
      .eq("is_recurring", false) // Só buscar não-recorrentes aqui
      .order("due_date", { ascending: false });

    // Buscar transações recorrentes separadamente (todas, sem filtro de data)
    const recurringQuery = supabase
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("is_recurring", true)
      .order("due_date", { ascending: false });

    // Apply filters
    const type = searchParams.get("type");
    if (type && type !== "all") {
      query = query.eq("type", type);
      recurringQuery.eq("type", type);
    }

    const category = searchParams.get("category");
    if (category && category !== "all") {
      query = query.eq("category_id", category);
      recurringQuery.eq("category_id", category);
    }

    const status = searchParams.get("status");
    if (status && status !== "all") {
      if (status === "paid") {
        query = query.not("paid_at", "is", null);
        // Recorrentes: não aplicar filtro de pago (serão sempre pendentes)
      } else if (status === "pending") {
        query = query.is("paid_at", null).gte("due_date", new Date().toISOString().split("T")[0]);
      } else if (status === "overdue") {
        query = query.is("paid_at", null).lt("due_date", new Date().toISOString().split("T")[0]);
      }
    }

    const installment = searchParams.get("installment");
    if (installment && installment !== "all") {
      query = query.eq("installment_type", installment);
      recurringQuery.eq("installment_type", installment);
    }

    const method = searchParams.get("method");
    if (method && method !== "all") {
      query = query.eq("payment_method", method);
      recurringQuery.eq("payment_method", method);
    }

    // Executar ambas as queries
    const [{ data: normalData }, { data: recurringData }] = await Promise.all([
      query,
      recurringQuery,
    ]);

    // Gerar ocorrências virtuais das transações recorrentes para este mês
    const recurringOccurrences = recurringData
      ? generateRecurringOccurrences(recurringData as Transaction[], monthParam)
      : [];

    // Mesclar transações normais com ocorrências recorrentes
    const allTransactions = [
      ...(normalData || []),
      ...recurringOccurrences,
    ];

    // Ordenar por data de vencimento
    allTransactions.sort((a, b) => {
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      return dateB.getTime() - dateA.getTime();
    });

    const data = allTransactions;

    if (data) {
      setTransactions(data as Transaction[]);

      // Calculate totals
      const totalIncome = data
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = data
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setIncome(totalIncome);
      setExpenses(totalExpenses);
    }

    setLoading(false);
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Despesas e Receitas</h1>
            <Button onClick={() => setDialogOpen(true)}>
              Adicionar Lançamento
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Filters */}
          <TransactionFilters categories={categories} />

          {/* Chart */}
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-zinc-500">Carregando...</p>
            </div>
          ) : (
            <>
              <FinancialChart income={income} expenses={expenses} month={currentMonth} />

              {/* Table */}
              <TransactionsTable
                transactions={transactions}
                onEdit={handleEdit}
              />
            </>
          )}
        </div>
      </main>

      {/* Dialog */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        categories={categories}
        transaction={editingTransaction}
      />
    </div>
  );
}

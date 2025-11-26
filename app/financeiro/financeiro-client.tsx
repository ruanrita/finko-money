"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FinancialChart } from "./components/financial-chart";
import { CategoryPieChart } from "./components/category-pie-chart";
import { TransactionsTable } from "./components/transactions-table";
import { TransactionFilters } from "./components/transaction-filters";
import { TransactionDialog } from "./components/transaction-dialog";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { getTransactions, getCategories, getCategoryTotals } from "./actions";
import { generateRecurringOccurrences } from "@/lib/recurring-utils";
import { ThemeToggle } from "@/components/theme-toggle";
import type { BranchWithMembers } from "@/src/types/database";

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
  color?: string;
  icon?: string | null;
};

interface FinanceiroPageContentProps {
  currentBranch: BranchWithMembers;
}

export function FinanceiroPageContent({ currentBranch }: FinanceiroPageContentProps) {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [currentMonth, setCurrentMonth] = useState("");
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [incomesByCategory, setIncomesByCategory] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  async function fetchData() {
    setLoading(true);

    // Get current month
    const now = new Date();
    const monthParam = searchParams.get("month") || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    setCurrentMonth(monthParam);

    // Fetch categories via server action
    const { data: categoriesData, error: categoriesError } = await getCategories();
    if (categoriesData && !categoriesError) {
      setCategories(categoriesData);
    }

    // Build filters for transactions
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const installment = searchParams.get("installment");
    const method = searchParams.get("method");

    const filters: any = {
      month: monthParam,
    };

    if (type && type !== "all") {
      filters.type = type as "income" | "expense";
    }
    if (category && category !== "all") {
      filters.category_id = category;
    }
    if (status && status !== "all") {
      filters.status = status as "paid" | "pending" | "overdue";
    }
    if (installment && installment !== "all") {
      filters.installment_type = installment as "a_vista" | "parcelado";
    }
    if (method && method !== "all") {
      filters.payment_method = method;
    }

    // Fetch transactions via server action
    const { data: transactionsData, error: transactionsError } = await getTransactions(filters);

    if (transactionsData && !transactionsError) {
      // Separate recurring and normal transactions
      const normalTransactions = transactionsData.filter((t) => !t.is_recurring);
      const recurringTransactions = transactionsData.filter((t) => t.is_recurring);

      // Generate recurring occurrences for this month
      const recurringOccurrences = generateRecurringOccurrences(
        recurringTransactions as any,
        monthParam
      );

      // Merge and sort
      const allTransactions = [...normalTransactions, ...recurringOccurrences];
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        return dateB.getTime() - dateA.getTime();
      });

      setTransactions(allTransactions as Transaction[]);

      // Calculate totals
      // O banco já salva o valor da parcela (não o total), então basta somar diretamente
      const totalIncome = allTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = allTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setIncome(totalIncome);
      setExpenses(totalExpenses);
    }

    // Buscar dados de categorias para o gráfico de pizza
    const categoryTotals = await getCategoryTotals(monthParam);
    setExpensesByCategory(categoryTotals.expenses);
    setIncomesByCategory(categoryTotals.income);

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
    <AuthenticatedLayout currentBranch={currentBranch}>
      <div className="relative overflow-hidden border-b-2 border-border bg-header-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Despesas e Receitas</h1>
              <p className="mt-1 text-sm text-blue-100 sm:mt-2">
                Gerencie suas transações financeiras
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-white text-brand hover:bg-blue-50 shadow-md text-sm sm:text-base whitespace-nowrap"
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Filters */}
          <TransactionFilters categories={categories} />

          {/* Chart */}
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-zinc-500">Carregando...</p>
            </div>
          ) : (
            <>
              {/* Gráficos lado a lado */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <FinancialChart income={income} expenses={expenses} month={currentMonth} />
                <CategoryPieChart
                  expensesByCategory={expensesByCategory}
                  incomesByCategory={incomesByCategory}
                  month={currentMonth}
                />
              </div>

              {/* Table */}
              <TransactionsTable
                transactions={transactions}
                onEdit={handleEdit as any}
                selectedMonth={currentMonth}
              />
            </>
          )}
        </div>
      </div>

      {/* Dialog */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        categories={categories}
        transaction={editingTransaction}
      />
    </AuthenticatedLayout>
  );
}

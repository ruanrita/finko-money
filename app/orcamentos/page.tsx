import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { BudgetsList } from "./components/budgets-list";
import { BudgetSummary } from "./components/budget-summary";
import { MonthSelector } from "./components/month-selector";
import { CreateBudgetDialog } from "./components/create-budget-dialog";
import { getBudgetsAction, getMonthSummaryAction } from "./actions";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Usar mês atual se não especificado
  const params = await searchParams;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() é 0-indexed, então +1
  const defaultMonth = `${year}-${String(month).padStart(2, '0')}-01`;
  const selectedMonth = params.month || defaultMonth;

  const [budgets, summary] = await Promise.all([
    getBudgetsAction(selectedMonth),
    getMonthSummaryAction(selectedMonth),
  ]);

  return (
    <AuthenticatedLayout>
      <div className="relative overflow-hidden border-b-2 border-zinc-200 bg-gradient-to-r from-blue-600 to-sky-500 dark:border-zinc-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Orçamentos</h1>
              <p className="mt-2 text-sm text-blue-100">
                Controle seus gastos por categoria
              </p>
            </div>
            <CreateBudgetDialog selectedMonth={selectedMonth} />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl p-8 space-y-6">
        <MonthSelector selectedMonth={selectedMonth} />

        {summary && <BudgetSummary summary={summary} />}

        <BudgetsList budgets={budgets || []} selectedMonth={selectedMonth} />
      </div>
    </AuthenticatedLayout>
  );
}

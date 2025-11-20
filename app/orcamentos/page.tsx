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
      <div className="container mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
            <p className="text-muted-foreground mt-1">
              Controle seus gastos por categoria
            </p>
          </div>
          <CreateBudgetDialog selectedMonth={selectedMonth} />
        </div>

        <MonthSelector selectedMonth={selectedMonth} />

        {summary && <BudgetSummary summary={summary} />}

        <BudgetsList budgets={budgets || []} selectedMonth={selectedMonth} />
      </div>
    </AuthenticatedLayout>
  );
}

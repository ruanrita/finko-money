import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { BudgetsList } from "./components/budgets-list";
import { BudgetSummary } from "./components/budget-summary";
import { MonthSelector } from "./components/month-selector";
import { CreateBudgetDialog } from "./components/create-budget-dialog";
import { CopyPreviousButton } from "./components/copy-previous-button";
import { getBudgetsAction, getMonthSummaryAction } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";

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

  // Pegar branch atual do usuário
  const currentBranch = await getCurrentBranch(user.id);

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
    <AuthenticatedLayout currentBranch={currentBranch}>
      <div className="relative overflow-hidden border-b-2 border-border bg-header-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Orçamentos</h1>
              <p className="mt-1 text-sm text-blue-100 sm:mt-2">
                Controle seus gastos por categoria
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <CreateBudgetDialog selectedMonth={selectedMonth} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <CopyPreviousButton selectedMonth={selectedMonth} />
          <MonthSelector selectedMonth={selectedMonth} />
        </div>

        {summary && <BudgetSummary summary={summary} />}

        <BudgetsList budgets={budgets || []} selectedMonth={selectedMonth} />
      </div>
    </AuthenticatedLayout>
  );
}

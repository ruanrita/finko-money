import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { TransactionService } from "@/src/modules/transactions";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { SummaryMetrics } from "./components/summary-metrics";
import { EvolutionChart } from "./components/evolution-chart";
import { CategoryDistribution } from "./components/category-distribution";
import { MonthlyComparison } from "./components/monthly-comparison";
import { ThemeToggle } from "@/components/theme-toggle";
import { getUserPlanData } from "@/lib/user-plan-helper";
import { UserRepository } from "@/src/modules/user/user.repository";

export default async function RelatoriosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pegar branch atual do usuário
  const currentBranch = await getCurrentBranch(user.id);

  // Buscar dados do plano e admin
  const userProfile = await UserRepository.findById(user.id);
  const isAdmin = userProfile?.is_admin || false;
  const { userPlanName, isEarlyAdopter } = await getUserPlanData(user.id);

  // Calcular período: últimos 6 meses
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const startDate = sixMonthsAgo.toISOString().split("T")[0];
  const endDate = now.toISOString().split("T")[0];

  // Buscar dados para relatórios
  const [
    metrics,
    evolution,
    bestWorstMonths,
    expenseDistribution,
    incomeDistribution,
  ] = await Promise.all([
    TransactionService.getReportsMetrics(user.id, currentBranch.id, startDate, endDate),
    TransactionService.getMonthlyEvolution(user.id, currentBranch.id, 6),
    TransactionService.getBestWorstMonths(user.id, currentBranch.id, 12),
    TransactionService.getCategoryDistribution(user.id, currentBranch.id, startDate, endDate, 'expense'),
    TransactionService.getCategoryDistribution(user.id, currentBranch.id, startDate, endDate, 'income'),
  ]);

  return (
    <AuthenticatedLayout
      currentBranch={currentBranch}
      isAdmin={isAdmin}
      userPlanName={userPlanName}
      isEarlyAdopter={isEarlyAdopter}
    >
      <div className="relative overflow-hidden border-b-2 border-border bg-header-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Relatórios</h1>
              <p className="mt-2 text-sm text-blue-100">
                Análise detalhada das suas finanças
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Summary Metrics */}
        <SummaryMetrics metrics={metrics} />

        {/* Evolution Chart */}
        <EvolutionChart data={evolution} />

        {/* Two Column Layout */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Expense Distribution */}
          <CategoryDistribution
            title="Despesas por Categoria"
            description="Distribuição das suas despesas nos últimos 6 meses"
            data={expenseDistribution}
            type="expense"
          />

          {/* Income Distribution */}
          <CategoryDistribution
            title="Receitas por Categoria"
            description="Distribuição das suas receitas nos últimos 6 meses"
            data={incomeDistribution}
            type="income"
          />
        </div>

        {/* Monthly Comparison */}
        <MonthlyComparison bestWorstMonths={bestWorstMonths} />
      </div>
    </AuthenticatedLayout>
  );
}

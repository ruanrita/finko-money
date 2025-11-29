import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { TransactionService } from "@/src/modules/transactions";
import { GoalService, type GoalWithProgress } from "@/src/modules/goals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { formatCurrency } from "@/lib/utils";
import { SummaryCards } from "./components/summary-cards";
import { GoalsWidget } from "./components/goals-widget";
import { CategoryIcon } from "@/components/category-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { getUserProfileAction } from "./actions";
import { UserRepository } from "@/src/modules/user/user.repository";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pegar branch atual do usuário
  const currentBranch = await getCurrentBranch(user.id);

  // Fetch user data via server action
  const userData = await getUserProfileAction();

  // Check if user is admin
  const userProfile = await UserRepository.findById(user.id);
  const isAdmin = userProfile?.is_admin || false;

  // Fetch all transactions via service layer
  const allTransactions = await TransactionService.list(user.id, currentBranch.id);

  // Get recent transactions (next 10 by due date - only unpaid)
  const upcomingTransactions = allTransactions
    .filter((t) => !t.paid_at) // Only unpaid
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 10);

  // Calculate totals for this month (all transactions, not just unpaid)
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const monthStartDate = `${thisMonth}-01`;
  const monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const monthlyTotals = await TransactionService.calculateTotals(
    user.id,
    currentBranch.id,
    monthStartDate,
    monthEndDate
  );

  // Calculate yearly projection considering recurring transactions
  const yearlyTotals = await TransactionService.calculateYearlyProjection(
    user.id,
    currentBranch.id,
    now.getFullYear()
  );

  // Fetch active goals (com error handling)
  let goals: GoalWithProgress[] = [];
  try {
    goals = await GoalService.listGoals(user.id, currentBranch.id, { is_active: true });
  } catch (error) {
    console.error("Erro ao carregar metas:", error);
    // Continua sem as metas em caso de erro
  }

  // Format current month name
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <AuthenticatedLayout currentBranch={currentBranch} isAdmin={isAdmin}>
      <div className="relative overflow-hidden border-b-2 border-border bg-header-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-blue-100 sm:mt-2">
                Bem-vindo de volta, {userData?.full_name || user.email}!
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        {/* Summary Cards */}
        <SummaryCards
          monthName={monthName}
          monthlyIncome={monthlyTotals.income}
          monthlyExpenses={monthlyTotals.expense}
          monthlyBalance={monthlyTotals.balance}
          yearlyIncome={yearlyTotals.income}
          yearlyExpenses={yearlyTotals.expense}
          yearlyBalance={yearlyTotals.balance}
        />

        {/* Two Column Layout */}
        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
          {/* Goals Widget */}
          <GoalsWidget goals={goals} />

          {/* Recent Transactions */}
          <Card className="border-2 border-gray-300 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Próximas Transações</CardTitle>
            <CardDescription>
              Suas transações mais próximas do vencimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTransactions && upcomingTransactions.length > 0 ? (
              <div className="space-y-3">
                {upcomingTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-card p-4 transition-all hover:border-brand hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-card-foreground truncate">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {new Date(transaction.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      {transaction.categories && (
                        <Badge variant="secondary" className="flex items-center gap-1.5 shrink-0">
                          <div
                            className="h-4 w-4 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${transaction.categories.color}30`, color: transaction.categories.color }}
                          >
                            <CategoryIcon iconName={transaction.categories.icon} className="h-3 w-3" />
                          </div>
                          <span className="hidden sm:inline">{transaction.categories.name}</span>
                        </Badge>
                      )}
                      <p className={`text-lg font-bold whitespace-nowrap ${
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="font-medium text-card-foreground">Nenhuma transação encontrada</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comece adicionando suas primeiras transações!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

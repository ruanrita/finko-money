import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { TransactionService } from "@/src/modules/transactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { formatCurrency } from "@/lib/utils";
import { SummaryCards } from "./components/summary-cards";
import { CategoryIcon } from "@/components/category-icon";

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

  // Fetch user data
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

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

  // Format current month name
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <AuthenticatedLayout>
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Bem-vindo de volta, {userData?.full_name || user.email}!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
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

        {/* Recent Transactions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Próximas Transações</CardTitle>
            <CardDescription>
              Suas transações mais próximas do vencimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTransactions && upcomingTransactions.length > 0 ? (
              <div className="space-y-4">
                {upcomingTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-zinc-500">
                        Vencimento: {new Date(transaction.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {transaction.categories && (
                        <Badge variant="secondary" className="flex items-center gap-1.5">
                          <div
                            className="h-4 w-4 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${transaction.categories.color}30`, color: transaction.categories.color }}
                          >
                            <CategoryIcon iconName={transaction.categories.icon} className="h-3 w-3" />
                          </div>
                          {transaction.categories.name}
                        </Badge>
                      )}
                      <p className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
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
                <p className="text-zinc-500">
                  Nenhuma transação encontrada. Comece adicionando suas primeiras transações!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user data
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, categories(name, color)")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true })
    .limit(5);

  // Calculate totals
  const thisMonth = new Date().toISOString().slice(0, 7);
  const { data: monthlyTransactions } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .gte("due_date", `${thisMonth}-01`);

  const income = monthlyTransactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const expenses = monthlyTransactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const balance = income - expenses;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">FinkoMoney</h1>
            <div className="flex items-center gap-4">
              <Link href="/financeiro">
                <Button>Gerenciar Finanças</Button>
              </Link>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {userData?.full_name || user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Bem-vindo de volta! Aqui está um resumo das suas finanças.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/financeiro?type=income">
            <Card className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <CardHeader>
                <CardDescription>Receitas do Mês</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {formatCurrency(income)}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/financeiro?type=expense">
            <Card className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <CardHeader>
                <CardDescription>Despesas do Mês</CardDescription>
                <CardTitle className="text-3xl text-red-600">
                  {formatCurrency(expenses)}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/financeiro">
            <Card className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <CardHeader>
                <CardDescription>Saldo do Mês</CardDescription>
                <CardTitle className={`text-3xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Próximas Transações</CardTitle>
            <CardDescription>
              Suas transações mais próximas do vencimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
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
                        <Badge variant="secondary">
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
      </main>
    </div>
  );
}

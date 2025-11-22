import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { GoalService } from "@/src/modules/goals";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { GoalCard } from "./components/goal-card";
import { GoalStats } from "./components/goal-stats";
import { Plus } from "lucide-react";

export default async function MetasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pegar branch atual do usuário
  const currentBranch = await getCurrentBranch(user.id);

  // Buscar metas e estatísticas
  const [goals, stats] = await Promise.all([
    GoalService.listGoals(user.id, currentBranch.id, { is_active: true }),
    GoalService.getStats(user.id, currentBranch.id),
  ]);

  // Separar metas por prioridade
  const emergencyFund = goals.find((g) => g.goal_type === "emergency_fund");
  const otherGoals = goals.filter((g) => g.goal_type !== "emergency_fund");

  return (
    <AuthenticatedLayout>
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Metas Financeiras</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Defina e acompanhe suas metas de economia e gastos
              </p>
            </div>
            <Link href="/metas/criar">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Meta
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Estatísticas Gerais */}
        {stats.total_goals > 0 && <GoalStats stats={stats} />}

        {/* Reserva de Emergência */}
        {emergencyFund && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <span className="text-lg">🚨</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Reserva de Emergência</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Sua meta mais importante
                </p>
              </div>
            </div>
            <GoalCard goal={emergencyFund} priority />
          </div>
        )}

        {/* Outras Metas */}
        {otherGoals.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Minhas Metas</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {otherGoals.length} meta{otherGoals.length !== 1 ? "s" : ""} ativa
                {otherGoals.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Nenhuma meta criada
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                Comece criando sua reserva de emergência ou defina uma meta de economia para realizar seus sonhos.
              </p>
              <Link href="/metas/criar">
                <Button className="mt-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Meta
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

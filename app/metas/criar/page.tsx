import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { GoalService } from "@/src/modules/goals";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { CreateGoalForm } from "../components/create-goal-form";
import { EmergencyFundWizard } from "../components/emergency-fund-wizard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CreateGoalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pegar branch atual do usuário
  const currentBranch = await getCurrentBranch(user.id);

  // Verificar se usuário já tem reserva de emergência
  const [hasEmergencyFund, emergencyFundSuggestion] = await Promise.all([
    GoalService.hasEmergencyFund(user.id, currentBranch.id),
    GoalService.calculateEmergencyFundSuggestion(user.id, currentBranch.id),
  ]);

  return (
    <AuthenticatedLayout currentBranch={currentBranch}>
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/metas">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Nova Meta Financeira</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Defina uma nova meta de economia ou poupança
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          {!hasEmergencyFund ? (
            <>
              <div className="mb-8 p-6 rounded-lg border-2 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                      Recomendação: Comece com uma Reserva de Emergência
                    </h3>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                      Especialistas recomendam ter de 3 a 6 meses de despesas guardadas para
                      emergências. Esta é a meta mais importante para sua segurança financeira.
                    </p>
                  </div>
                </div>
              </div>
              <EmergencyFundWizard suggestion={emergencyFundSuggestion} />
              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
                <span className="text-sm text-zinc-500">ou</span>
                <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
              </div>
            </>
          ) : null}
          <CreateGoalForm />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

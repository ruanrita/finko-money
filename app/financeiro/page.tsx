import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { FinanceiroPageContent } from "./financeiro-client";
import { Loader2 } from "lucide-react";
import { getUserPlanData } from "@/lib/user-plan-helper";
import { AuthenticatedLayout } from "@/components/authenticated-layout";

export default async function FinanceiroPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pegar branch atual do usuário e dados do plano
  const currentBranch = await getCurrentBranch(user.id);
  const { userPlanName, isEarlyAdopter, isAdmin } = await getUserPlanData(user.id);

  return (
    <AuthenticatedLayout
      currentBranch={currentBranch}
      isAdmin={isAdmin}
      userPlanName={userPlanName}
      isEarlyAdopter={isEarlyAdopter}
    >
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="text-sm text-muted-foreground">Carregando transações...</p>
            </div>
          </div>
        }
      >
        <FinanceiroPageContent />
      </Suspense>
    </AuthenticatedLayout>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanFeaturesMatrix } from "./components/plan-features-matrix";
import { getPlanFeaturesMatrix } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Info } from "lucide-react";

export default async function AdminFeaturesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_admin) {
    redirect("/dashboard");
  }

  const { plans, features, matrix } = await getPlanFeaturesMatrix();

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Features
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Configure quais features estão disponíveis em cada plano de assinatura
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Como funciona:
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Features <strong>Core</strong> (Dashboard e Configurações) estão sempre disponíveis para todos os usuários</li>
                  <li>Features <strong>Premium</strong> podem ser atribuídas a planos específicos</li>
                  <li>Admins e Early Adopters têm acesso a todas as features independentemente do plano</li>
                  <li>Quando você remove uma feature de um plano, usuários daquele plano perdem acesso imediatamente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Card */}
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  ⚠️ Atenção
                </p>
                <p className="mt-1 text-yellow-800 dark:text-yellow-200">
                  Mudanças nas features afetam usuários imediatamente. Certifique-se de comunicar aos usuários antes de remover features de um plano.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Matrix */}
        <PlanFeaturesMatrix plans={plans} features={features} matrix={matrix} />
      </div>
  );
}

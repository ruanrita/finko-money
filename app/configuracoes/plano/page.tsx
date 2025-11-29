import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { UserRepository } from "@/src/modules/user/user.repository";
import { PlanManagementContent } from "./plan-management-content";
import { getUserPlanData } from "@/lib/user-plan-helper";

export default async function PlanManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentBranch = await getCurrentBranch(user.id);
  const userProfile = await UserRepository.findById(user.id);
  const isAdmin = userProfile?.is_admin || false;

  // Buscar dados do plano usando helper
  const { userPlanName, isEarlyAdopter } = await getUserPlanData(user.id);

  // Buscar informações detalhadas do plano do usuário
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      subscription_plan_id,
      subscription_status,
      is_early_adopter,
      subscription_plans!inner (
        id,
        name,
        display_name,
        max_transactions,
        max_categories,
        max_goals,
        max_budgets,
        max_team_members,
        max_branches,
        max_reminders,
        has_advanced_reports,
        export_formats,
        support_level,
        history_months
      )
    `)
    .eq('id', user.id)
    .single();

  if (userError) {
    console.error('Error fetching user plan:', userError);
  }

  // Garantir dados mínimos com fallback
  const safeUserData = userData || {
    subscription_plan_id: '',
    subscription_status: 'active',
    is_early_adopter: false,
    subscription_plans: {
      id: '',
      name: 'free',
      display_name: 'Plano Grátis',
      max_transactions: 50,
      max_categories: 5,
      max_goals: 3,
      max_budgets: 3,
      max_team_members: 2,
      max_branches: 2,
      max_reminders: 3,
      has_advanced_reports: true,
      export_formats: ['csv'],
      support_level: 'email',
      history_months: 6
    }
  };

  // Buscar todos os planos disponíveis
  const { data: availablePlans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return (
    <AuthenticatedLayout
      currentBranch={currentBranch}
      isAdmin={isAdmin}
      userPlanName={userPlanName}
      isEarlyAdopter={isEarlyAdopter}
    >
      <PlanManagementContent
        userData={safeUserData}
        availablePlans={availablePlans || []}
      />
    </AuthenticatedLayout>
  );
}

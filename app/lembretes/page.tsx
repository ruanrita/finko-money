import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { RemindersList } from "./components/reminders-list";
import { CreateReminderDialog } from "./components/create-reminder-dialog";
import { getRemindersAction } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { getUserPlanData } from "@/lib/user-plan-helper";
import { UserRepository } from "@/src/modules/user/user.repository";

export default async function RemindersPage() {
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

  const reminders = await getRemindersAction();

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
              <h1 className="text-3xl font-bold text-white">Lembretes</h1>
              <p className="mt-2 text-sm text-blue-100">
                Gerencie lembretes para suas transações
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <CreateReminderDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl p-8">
        {/* Reminders List */}
        <RemindersList reminders={reminders || []} />
      </div>
    </AuthenticatedLayout>
  );
}

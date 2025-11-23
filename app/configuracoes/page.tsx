import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch, getUserRoleInBranch } from "@/lib/supabase/branch-context";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { SettingsTabs } from "./components/settings-tabs";
import { SettingsWrapper } from "./components/settings-wrapper";
import { WorkspaceSettingsTab } from "./components/workspace-settings-tab";
import { AccountSettingsTab } from "./components/account-settings-tab";
import { TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentBranch = await getCurrentBranch(user.id);
  const userRole = await getUserRoleInBranch(user.id, currentBranch.id);

  return (
    <AuthenticatedLayout>
      <SettingsWrapper>
        <div className="relative overflow-hidden border-b-2 border-zinc-200 bg-gradient-to-r from-blue-600 to-sky-500 dark:border-zinc-800">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
          <div className="relative px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Configurações</h1>
                <p className="mt-2 text-sm text-blue-100">
                  Gerencie sua conta, workspace e preferências
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="p-8">
          <SettingsTabs>
            <TabsContent value="workspace">
              <WorkspaceSettingsTab
                userRole={userRole}
                branchId={currentBranch.id}
                branch={currentBranch}
              />
            </TabsContent>
            <TabsContent value="conta">
              <AccountSettingsTab user={user} />
            </TabsContent>
          </SettingsTabs>
        </div>
      </SettingsWrapper>
    </AuthenticatedLayout>
  );
}

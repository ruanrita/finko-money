import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch, getUserRoleInBranch } from "@/lib/supabase/branch-context";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { SettingsTabs } from "./components/settings-tabs";
import { SettingsWrapper } from "./components/settings-wrapper";
import { WorkspaceSettingsTab } from "./components/workspace-settings-tab";
import { AccountSettingsTab } from "./components/account-settings-tab";
import { TabsContent } from "@/components/ui/tabs";

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
        <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Gerencie sua conta, workspace e preferências
                </p>
              </div>
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

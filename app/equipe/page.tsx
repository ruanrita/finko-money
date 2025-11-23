import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch, getUserRoleInBranch } from "@/lib/supabase/branch-context";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { TeamMembersList } from "@/app/team/components/team-members-list";
import { InviteMemberDialog } from "@/app/team/components/invite-member-dialog";
import { getBranchMembersAction } from "@/app/team/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function EquipePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentBranch = await getCurrentBranch(user.id);
  const userRole = await getUserRoleInBranch(user.id, currentBranch.id);
  const members = await getBranchMembersAction(currentBranch.id);

  return (
    <AuthenticatedLayout>
      <div className="relative overflow-hidden border-b-2 border-border bg-header-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Equipe</h1>
              <p className="mt-2 text-sm text-blue-100">
                Gerencie os membros do workspace
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {userRole === "owner" && <InviteMemberDialog branchId={currentBranch.id} />}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Workspace Info */}
          <Card className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                  <Briefcase className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentBranch.name}</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {currentBranch.description || "Workspace colaborativo"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle>Membros da Equipe</CardTitle>
                  <CardDescription>
                    {members?.length || 0} {members?.length === 1 ? "membro" : "membros"} no workspace
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TeamMembersList
                members={(members || []) as any}
                currentUserId={user.id}
                userRole={userRole}
                branchId={currentBranch.id}
              />
            </CardContent>
          </Card>

          {/* Info Card for non-owners */}
          {userRole === "member" && (
            <Card className="border-blue-200 dark:border-blue-900">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    💡 Informação
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Apenas o dono do workspace pode convidar ou remover membros.
                    Se você precisa adicionar alguém à equipe, entre em contato com o dono.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Owner Info Card */}
          {userRole === "owner" && (
            <Card className="border-green-200 dark:border-green-900">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/10 p-4">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    👑 Você é o dono deste workspace
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Você pode convidar novos membros, gerenciar permissões e configurar o workspace.
                    Use o botão "Convidar Membro" acima para adicionar pessoas à sua equipe.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

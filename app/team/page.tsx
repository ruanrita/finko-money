import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch, getUserRoleInBranch } from "@/lib/supabase/branch-context";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { TeamMembersList } from "./components/team-members-list";
import { InviteMemberDialog } from "./components/invite-member-dialog";
import { BranchSettingsCard } from "./components/branch-settings-card";
import { getBranchMembersAction } from "./actions";

export default async function TeamPage() {
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
      <div className="container mx-auto max-w-5xl p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os membros do workspace <strong>{currentBranch.name}</strong>
            </p>
          </div>
          {userRole === "owner" && (
            <InviteMemberDialog branchId={currentBranch.id} />
          )}
        </div>

        {/* Members List */}
        <TeamMembersList
          members={members || []}
          currentUserId={user.id}
          userRole={userRole}
          branchId={currentBranch.id}
        />

        {/* Branch Settings (Owner only) */}
        {userRole === "owner" && (
          <BranchSettingsCard
            branch={currentBranch}
            branchId={currentBranch.id}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}

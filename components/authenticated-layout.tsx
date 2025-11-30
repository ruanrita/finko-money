import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import type { BranchWithMembers } from "@/src/types/database";
import { getUserFeaturesWithAccess, type UserFeatureAccess } from "@/lib/features-helper";
import { createClient } from "@/lib/supabase/server";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  currentBranch: BranchWithMembers;
  isAdmin?: boolean;
  userPlanName?: string;
  isEarlyAdopter?: boolean;
}

export async function AuthenticatedLayout({
  children,
  currentBranch,
  isAdmin = false,
  userPlanName = 'free',
  isEarlyAdopter = false
}: AuthenticatedLayoutProps) {
  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get features with access status
  const features: UserFeatureAccess[] = user
    ? await getUserFeaturesWithAccess(user.id)
    : [];
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          currentBranch={currentBranch}
          isAdmin={isAdmin}
          userPlanName={userPlanName}
          isEarlyAdopter={isEarlyAdopter}
          features={features}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Navigation - Only visible on mobile */}
      <MobileNav
        currentBranch={currentBranch}
        isAdmin={isAdmin}
        userPlanName={userPlanName}
        isEarlyAdopter={isEarlyAdopter}
        features={features}
      />
    </div>
  );
}

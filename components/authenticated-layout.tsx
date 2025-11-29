import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import type { BranchWithMembers } from "@/src/types/database";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  currentBranch: BranchWithMembers;
  isAdmin?: boolean;
}

export function AuthenticatedLayout({ children, currentBranch, isAdmin = false }: AuthenticatedLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar currentBranch={currentBranch} isAdmin={isAdmin} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Navigation - Only visible on mobile */}
      <MobileNav currentBranch={currentBranch} isAdmin={isAdmin} />
    </div>
  );
}

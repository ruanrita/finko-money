import { Sidebar } from "./sidebar";
import type { BranchWithMembers } from "@/src/types/database";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  currentBranch: BranchWithMembers;
}

export function AuthenticatedLayout({ children, currentBranch }: AuthenticatedLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar currentBranch={currentBranch} />
      <main className="flex-1 overflow-y-auto bg-muted">
        {children}
      </main>
    </div>
  );
}

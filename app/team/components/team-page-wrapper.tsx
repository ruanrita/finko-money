"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

interface TeamPageWrapperProps {
  children: React.ReactNode;
}

export function TeamPageWrapper({ children }: TeamPageWrapperProps) {
  const searchParams = useSearchParams();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [branchLimits, setBranchLimits] = useState<{
    currentCount?: number;
    maxBranches?: number;
  }>({});

  useEffect(() => {
    // Open dialog if action=create is in URL
    if (searchParams.get("action") === "create") {
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Load branch limits
    async function loadBranchLimits() {
      try {
        const response = await fetch('/api/user/branch-limits');
        if (response.ok) {
          const data = await response.json();
          setBranchLimits({
            currentCount: data.currentCount,
            maxBranches: data.maxBranches,
          });
        }
      } catch (error) {
        console.error('Failed to load branch limits:', error);
      }
    }
    loadBranchLimits();
  }, []);

  return (
    <>
      {children}
      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        currentCount={branchLimits.currentCount}
        maxBranches={branchLimits.maxBranches}
      />
    </>
  );
}

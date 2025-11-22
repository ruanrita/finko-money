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

  useEffect(() => {
    // Open dialog if action=create is in URL
    if (searchParams.get("action") === "create") {
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      {children}
      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}

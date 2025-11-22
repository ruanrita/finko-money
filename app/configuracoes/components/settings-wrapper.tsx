"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreateWorkspaceDialog } from "@/app/team/components/create-workspace-dialog";

interface SettingsWrapperProps {
  children: React.ReactNode;
}

export function SettingsWrapper({ children }: SettingsWrapperProps) {
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

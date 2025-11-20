"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { switchBranchAction, getUserBranchesAction, getCurrentBranchAction } from "@/app/actions/branch";
import { useRouter } from "next/navigation";

type Branch = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  branch_members: any[];
};

export function BranchSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    setLoading(true);
    try {
      const [branchesResult, currentResult] = await Promise.all([
        getUserBranchesAction(),
        getCurrentBranchAction(),
      ]);

      if (branchesResult.success) {
        setBranches(branchesResult.branches);
      }

      if (currentResult.success && currentResult.branch) {
        setCurrentBranch(currentResult.branch);
      }
    } catch (error) {
      console.error("Erro ao carregar branches:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectBranch(branchId: string) {
    if (branchId === currentBranch?.id) {
      setOpen(false);
      return;
    }

    const result = await switchBranchAction(branchId);

    if (result.success) {
      const selected = branches.find((b) => b.id === branchId);
      setCurrentBranch(selected || null);
      setOpen(false);
      router.refresh();
    } else {
      console.error("Erro ao trocar de branch:", result.error);
    }
  }

  function handleCreateBranch() {
    setOpen(false);
    router.push("/team?action=create");
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar workspace"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Briefcase className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentBranch?.name || "Selecione um workspace"}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar workspace..." />
          <CommandList>
            <CommandEmpty>Nenhum workspace encontrado.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {branches.map((branch) => (
                <CommandItem
                  key={branch.id}
                  onSelect={() => handleSelectBranch(branch.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Briefcase className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{branch.name}</span>
                      {branch.description && (
                        <span className="text-xs text-muted-foreground">
                          {branch.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentBranch?.id === branch.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleCreateBranch} className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Criar workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

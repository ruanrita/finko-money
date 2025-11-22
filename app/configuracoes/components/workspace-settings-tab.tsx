import { BranchSettingsCard } from "@/app/team/components/branch-settings-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface WorkspaceSettingsTabProps {
  userRole: "owner" | "member" | null;
  branchId: string;
  branch: any;
}

export function WorkspaceSettingsTab({
  userRole,
  branchId,
  branch,
}: WorkspaceSettingsTabProps) {
  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações do Workspace</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie o nome, descrição e outras configurações do workspace <strong>{branch.name}</strong>
        </p>
      </div>

      {/* Quick Link to Team Page */}
      <Card className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold">Gerenciar Equipe</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Veja e gerencie os membros do workspace
                </p>
              </div>
            </div>
            <Link href="/equipe">
              <Button variant="outline">
                Ir para Equipe
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Settings (Owner only) */}
      {userRole === "owner" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            <h3 className="text-lg font-semibold">Configurações Gerais</h3>
          </div>
          <BranchSettingsCard branch={branch} branchId={branchId} />
        </div>
      )}

      {/* Info for non-owners */}
      {userRole === "member" && (
        <Card>
          <CardHeader>
            <CardTitle>Permissões Limitadas</CardTitle>
            <CardDescription>
              Apenas o dono do workspace pode alterar as configurações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 Informação:</strong> Se você precisa alterar o nome, descrição ou excluir este workspace, entre em contato com o dono do workspace.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

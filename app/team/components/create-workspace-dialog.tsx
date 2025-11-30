"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Briefcase, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { createBranchAction } from "../actions";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCount?: number;
  maxBranches?: number;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  currentCount,
  maxBranches,
}: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const remaining = maxBranches && currentCount !== undefined
    ? maxBranches - currentCount
    : null;
  const isAtLimit = remaining !== null && remaining <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome obrigatório", {
        description: "Por favor, informe um nome para o workspace",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createBranchAction(formData.name, formData.description || undefined);

      if (result.success) {
        toast.success("Workspace criado!", {
          description: `"${formData.name}" foi criado com sucesso. Você já está nele!`,
        });

        // Limpar formulário
        setFormData({ name: "", description: "" });
        onOpenChange(false);

        // Redirecionar para configurações do workspace
        router.push("/configuracoes?tab=workspace");
        // Forçar reload completo para garantir que tudo seja atualizado
        setTimeout(() => {
          window.location.href = "/configuracoes?tab=workspace";
        }, 100);
      } else {
        const errorMessage = result.error || "Erro ao criar workspace";

        // Verificar se é erro de limite
        if (errorMessage.includes("Limite") && errorMessage.includes("atingido")) {
          toast.error("Limite de workspaces atingido", {
            description: errorMessage,
            action: {
              label: "Ver Planos",
              onClick: () => {
                router.push("/pricing");
              },
            },
            duration: 6000,
          });
        } else {
          toast.error("Erro ao criar workspace", {
            description: errorMessage,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao criar workspace:", error);
      const errorMessage = error instanceof Error ? error.message : "Tente novamente";

      // Verificar se é erro de limite
      if (errorMessage.includes("Limite") && errorMessage.includes("atingido")) {
        toast.error("Limite de workspaces atingido", {
          description: errorMessage,
          action: {
            label: "Ver Planos",
            onClick: () => {
              router.push("/pricing");
            },
          },
          duration: 6000,
        });
      } else {
        toast.error("Erro ao criar workspace", {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle>Criar Novo Workspace</DialogTitle>
              <DialogDescription>
                Crie um novo workspace para organizar suas finanças
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Workspace *</Label>
              <Input
                id="name"
                placeholder="Ex: Finanças Pessoais, Empresa, Família..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Adicione uma descrição para este workspace..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
                rows={3}
                maxLength={200}
              />
            </div>

            {/* Aviso de Limite */}
            {isAtLimit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você atingiu o limite de {maxBranches} workspaces do seu plano.{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/pricing")}
                    className="underline font-medium"
                  >
                    Faça upgrade
                  </button>{" "}
                  para criar mais workspaces.
                </AlertDescription>
              </Alert>
            )}

            {/* Info sobre Workspaces Disponíveis */}
            {!isAtLimit && remaining !== null && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 p-3 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  📊 Você tem <strong>{remaining}</strong> de <strong>{maxBranches}</strong> workspaces disponíveis
                </p>
              </div>
            )}

            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 O que é um Workspace?
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Um workspace permite organizar suas finanças separadamente. Por exemplo, você pode
                ter um workspace para finanças pessoais e outro para seu negócio. Cada workspace
                tem suas próprias transações, categorias e membros.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isAtLimit}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : isAtLimit ? (
                "Limite Atingido"
              ) : (
                <>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Criar Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

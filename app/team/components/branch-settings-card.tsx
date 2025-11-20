"use client";

import { useState } from "react";
import { Settings, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateBranchAction, deleteBranchAction } from "../actions";
import { useRouter } from "next/navigation";

type Props = {
  branch: {
    id: string;
    name: string;
    description: string | null;
  };
  branchId: string;
};

export function BranchSettingsCard({ branch, branchId }: Props) {
  const router = useRouter();
  const [name, setName] = useState(branch.name);
  const [description, setDescription] = useState(branch.description || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);

    const result = await updateBranchAction(branchId, name, description);

    setSaving(false);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erro ao atualizar workspace");
    }
  }

  async function handleDelete() {
    setDeleting(true);

    const result = await deleteBranchAction(branchId);

    setDeleting(false);

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      alert(result.error || "Erro ao deletar workspace");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Workspace
        </CardTitle>
        <CardDescription>
          Gerencie as informações e configurações do seu workspace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Workspace</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Finanças da Família"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste workspace..."
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Zona de Perigo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deletar este workspace irá remover todas as transações, categorias e dados associados.
            Esta ação não pode ser desfeita.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso irá permanentemente deletar o workspace{" "}
                  <strong>{branch.name}</strong> e remover todos os dados associados, incluindo:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Todas as transações (receitas e despesas)</li>
                    <li>Todas as categorias personalizadas</li>
                    <li>Todos os membros serão removidos</li>
                    <li>Todos os dados históricos</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? "Deletando..." : "Sim, deletar workspace"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuickCreateCategory } from "@/components/quick-create-category";
import { EditCategoryDialog } from "./edit-category-dialog";
import { CategoryIcon } from "@/components/category-icon";
import { deleteCategoryAction } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
};

type Props = {
  initialCategories: Category[];
};

export function CategoryList({ initialCategories }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(categoryId: string) {
    setIsDeleting(true);

    const result = await deleteCategoryAction(categoryId);

    if (result.success) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast.success("Categoria excluída com sucesso!");
      setDeletingCategoryId(null);
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao excluir categoria");
    }

    setIsDeleting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Suas Categorias</h2>
        <QuickCreateCategory
          triggerText="Nova Categoria"
          onCategoryCreated={(newCategory) => {
            setCategories((prev) => [...prev, newCategory]);
            router.refresh();
          }}
        />
      </div>

      {categories.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhuma Categoria
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Crie sua primeira categoria para começar a organizar suas transações.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Ícone</TableHead>
                <TableHead className="w-[60px]">Cor</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <CategoryIcon iconName={category.icon} className="h-5 w-5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="h-6 w-6 rounded-full border border-zinc-200 dark:border-zinc-700"
                      style={{ backgroundColor: category.color }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCategoryId(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
          onCategoryUpdated={(updatedCategory) => {
            setCategories((prev) =>
              prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
            );
            setEditingCategory(null);
            router.refresh();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCategoryId}
        onOpenChange={(open) => !open && setDeletingCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita
              e pode afetar transações e orçamentos associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCategoryId && handleDelete(deletingCategoryId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

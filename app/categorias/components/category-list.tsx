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
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <span className="text-2xl">🏷️</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Nenhuma Categoria
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie sua primeira categoria para começar a organizar suas transações.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border-2 border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-sky-50 border-gray-300 hover:from-blue-50 hover:to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
                <TableHead className="w-[80px] font-semibold text-zinc-700 dark:text-zinc-300">Ícone</TableHead>
                <TableHead className="w-[80px] font-semibold text-zinc-700 dark:text-zinc-300">Cor</TableHead>
                <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300">Nome</TableHead>
                <TableHead className="w-[120px] font-semibold text-zinc-700 dark:text-zinc-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow
                  key={category.id}
                  className={`
                    transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20 border-border
                    ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'}
                  `}
                >
                  <TableCell>
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center shadow-sm transition-transform hover:scale-110"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <CategoryIcon iconName={category.icon} className="h-5 w-5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="h-8 w-8 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCategory(category)}
                        className="hover:bg-brand hover:text-white transition-all"
                        title="Editar categoria"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCategoryId(category.id)}
                        className="hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all"
                        title="Excluir categoria"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-500" />
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

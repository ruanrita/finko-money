import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { getCategoriesAction } from "./actions";
import { CategoryList } from "./components/category-list";

export default async function CategoriasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const categories = await getCategoriesAction();

  return (
    <AuthenticatedLayout>
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Categorias</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Gerencie as categorias das suas transações
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <CategoryList initialCategories={categories} />
      </div>
    </AuthenticatedLayout>
  );
}

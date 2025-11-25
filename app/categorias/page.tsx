import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBranch } from "@/lib/supabase/branch-context";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { getCategoriesAction } from "./actions";
import { CategoryList } from "./components/category-list";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function CategoriasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pegar branch atual do usuário
  const currentBranch = await getCurrentBranch(user.id);

  const categories = await getCategoriesAction();

  return (
    <AuthenticatedLayout currentBranch={currentBranch}>
      <div className="relative overflow-hidden border-b-2 border-border bg-header-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Categorias</h1>
              <p className="mt-2 text-sm text-blue-100">
                Gerencie as categorias das suas transações
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-8">
        <CategoryList initialCategories={categories} />
      </div>
    </AuthenticatedLayout>
  );
}

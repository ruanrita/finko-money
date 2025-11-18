import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthenticatedLayout } from "@/components/authenticated-layout";

export default async function LembretesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthenticatedLayout>
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lembretes</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Configure alertas para não perder vencimentos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Página em Desenvolvimento
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              A funcionalidade de lembretes e notificações está sendo desenvolvida.
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

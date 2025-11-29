import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/src/modules/user/user.helpers";
import { AdminDashboardContent } from "./components/admin-dashboard-content";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Dashboard Admin",
  description: "Painel administrativo do FinkoMoney",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/dashboard?error=unauthorized");
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <p className="text-sm text-muted-foreground">
              Carregando dashboard...
            </p>
          </div>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "./components/admin-sidebar";
import { isCurrentUserAdmin } from "@/src/modules/user/user.helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Double-check admin status (middleware should handle this, but good to be safe)
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/dashboard?error=unauthorized");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}

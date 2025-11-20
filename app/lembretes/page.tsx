import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { RemindersList } from "./components/reminders-list";
import { CreateReminderDialog } from "./components/create-reminder-dialog";
import { getRemindersAction } from "./actions";

export default async function RemindersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const reminders = await getRemindersAction();

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto max-w-5xl p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lembretes</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie lembretes para suas transações
            </p>
          </div>
          <CreateReminderDialog />
        </div>

        {/* Reminders List */}
        <RemindersList reminders={reminders || []} />
      </div>
    </AuthenticatedLayout>
  );
}

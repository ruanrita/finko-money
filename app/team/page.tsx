import { redirect } from "next/navigation";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: { action?: string };
}) {
  // Redirect to settings page with workspace tab for create action
  // Otherwise redirect to team page
  const action = searchParams.action;
  if (action === "create") {
    redirect("/configuracoes?tab=workspace&action=create");
  }

  redirect("/equipe");
}

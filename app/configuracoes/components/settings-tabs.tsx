"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsTabsProps {
  children: React.ReactNode;
}

export function SettingsTabs({ children }: SettingsTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "workspace";

  const handleTabChange = (value: string) => {
    router.push(`/configuracoes?tab=${value}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="workspace">Workspace</TabsTrigger>
        <TabsTrigger value="conta">Conta</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}

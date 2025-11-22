import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";

interface AccountSettingsTabProps {
  user: User;
}

export function AccountSettingsTab({ user }: AccountSettingsTabProps) {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações da Conta</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Suas informações de conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {user.email}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              ID do Usuário
            </label>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-mono">
              {user.id}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future settings */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>
            Configurações adicionais estarão disponíveis em breve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Em desenvolvimento: configurações de notificações, tema, idioma e mais.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Loader2 } from "lucide-react";

export default function RelatoriosLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm text-muted-foreground">Carregando relatórios...</p>
      </div>
    </div>
  );
}

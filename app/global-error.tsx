"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
          <div className="w-full max-w-md text-center space-y-8">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-6">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Erro Crítico
              </h1>
              <p className="text-lg text-gray-600">
                Desculpe, ocorreu um erro crítico no aplicativo. Por favor, recarregue a página.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === "development" && error.message && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Detalhes do erro (apenas em desenvolvimento)
                  </summary>
                  <div className="mt-2 rounded-lg bg-gray-100 p-4">
                    <code className="text-xs text-red-600 break-all">
                      {error.message}
                    </code>
                    {error.digest && (
                      <p className="mt-2 text-xs text-gray-500">
                        Digest: {error.digest}
                      </p>
                    )}
                  </div>
                </details>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 justify-center">
              <Button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 justify-center"
              >
                <RefreshCcw className="h-4 w-4" />
                Recarregar Aplicação
              </Button>
              <Button
                onClick={() => window.location.href = "/"}
                variant="outline"
              >
                Ir para Home
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500">
              Se o problema persistir, limpe o cache do navegador ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

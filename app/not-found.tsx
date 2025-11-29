import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-20 w-20 text-blue-600/20 animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Página não encontrada
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="btn-brand"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Ir para Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Home
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Se você acredita que isto é um erro, entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}

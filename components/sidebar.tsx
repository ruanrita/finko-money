"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Bell,
  Target,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BranchSwitcher } from "./branch-switcher";
import { signOut } from "@/app/login/actions";
import type { BranchWithMembers } from "@/src/types/database";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Despesas e Receitas", href: "/financeiro", icon: Receipt },
  { name: "Orçamentos", href: "/orcamentos", icon: Wallet },
  { name: "Categorias", href: "/categorias", icon: Tags },
  { name: "Lembretes", href: "/lembretes", icon: Bell },
  { name: "Metas", href: "/metas", icon: Target },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Equipe", href: "/equipe", icon: Users },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

interface SidebarProps {
  currentBranch: BranchWithMembers;
  isAdmin?: boolean;
}

export function Sidebar({ currentBranch, isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r-2 border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b-2 border-border px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-sm">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-brand">FinkoMoney</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto transition-transform hover:scale-110">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-sm">
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </Link>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="border-b-2 border-border p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="w-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Expandir menu"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Branch Switcher */}
      {!collapsed && (
        <div className="border-b border-border p-2">
          <BranchSwitcher initialBranch={currentBranch} />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {/* Admin Panel Link */}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-2",
              pathname.startsWith("/admin")
                ? "bg-red-100 text-red-700 shadow-sm dark:bg-red-900/30 dark:text-red-400"
                : "text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            )}
            title={collapsed ? "Painel Admin" : undefined}
          >
            <Shield className={cn("h-5 w-5 shrink-0", pathname.startsWith("/admin") && "drop-shadow-sm")} />
            {!collapsed && <span>Painel Admin</span>}
          </Link>
        )}

        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm"
                  : "text-card-foreground hover:bg-blue-50 hover:text-brand dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow-sm")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t-2 border-border">
        {!collapsed && (
          <div className="p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="font-medium">Sair</span>
            </Button>
          </div>
        )}
        {collapsed && (
          <div className="p-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleSignOut}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
        {!collapsed && (
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 pt-3 dark:from-blue-950/20 dark:to-sky-950/20">
            <p className="text-xs font-medium text-brand">
              FinkoMoney v1.0
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Controle fácil, escolhas melhores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

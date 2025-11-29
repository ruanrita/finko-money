"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  CreditCard,
  Grid3x3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signOut } from "@/app/login/actions";

const adminNavigation = [
  { name: "Dashboard Admin", href: "/admin", icon: LayoutDashboard },
  { name: "Planos", href: "/admin/plans", icon: CreditCard },
  { name: "Features", href: "/admin/features", icon: Grid3x3 },
  { name: "Gerenciar Admins", href: "/admin/admins", icon: Shield },
  { name: "Logs de Emails", href: "/admin/logs", icon: Mail },
];

export function AdminSidebar() {
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
          <Link
            href="/admin"
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-red-600">Admin Panel</span>
          </Link>
        )}
        {collapsed && (
          <Link
            href="/admin"
            className="mx-auto transition-transform hover:scale-110"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </Link>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20"
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
            className="w-full hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Expandir menu"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-red-100 text-red-700 shadow-sm dark:bg-red-900/30 dark:text-red-400"
                  : "text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t-2 border-border p-2 space-y-1">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-muted-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
          )}
          title={collapsed ? "Voltar ao Dashboard" : undefined}
        >
          <Home className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Voltar ao Dashboard</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}

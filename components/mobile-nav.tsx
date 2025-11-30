"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
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
  Menu,
  LogOut,
  DollarSign,
  Shield,
  Lock,
  FolderTree,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BranchSwitcher } from "./branch-switcher";
import { signOut } from "@/app/login/actions";
import type { BranchWithMembers } from "@/src/types/database";
import type { UserFeatureAccess } from "@/lib/features-helper";

// Icon mapping from string to lucide component
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags: FolderTree,
  Bell,
  Target,
  BarChart3,
  Settings,
  Users,
};

interface MobileNavProps {
  currentBranch: BranchWithMembers;
  isAdmin?: boolean;
  userPlanName?: string;
  isEarlyAdopter?: boolean;
  subscriptionsEnabled?: boolean;
  features: UserFeatureAccess[];
}

export function MobileNav({
  currentBranch,
  isAdmin = false,
  userPlanName = 'free',
  isEarlyAdopter = false,
  subscriptionsEnabled = false,
  features = []
}: MobileNavProps) {
  const pathname = usePathname();
  const handleSignOut = async () => {
    await signOut();
  };
  const [open, setOpen] = useState(false);

  // Build navigation from features
  const navigation = useMemo(() => {
    return features.map(({ feature, hasAccess }) => ({
      name: feature.display_name,
      href: feature.path,
      icon: iconMap[feature.icon || ''] || LayoutDashboard,
      hasAccess,
      isCore: feature.is_core
    }));
  }, [features]);

  return (
    <>
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t-2 border-gray-300 dark:border-gray-700 bg-card shadow-lg">
        <div className="flex items-center justify-around py-3 px-4">
          {/* Dashboard Button */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center justify-center p-3 rounded-lg transition-all",
              pathname === "/dashboard"
                ? "text-brand bg-blue-50 dark:bg-blue-900/20"
                : "text-muted-foreground hover:text-brand hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
            )}
          >
            <LayoutDashboard className="h-6 w-6" />
          </Link>

          {/* Financeiro Button (Center) */}
          <Link
            href="/financeiro"
            className="relative"
          >
            <div className={cn(
              "flex items-center justify-center rounded-full p-4 transition-all shadow-lg",
              pathname === "/financeiro" || pathname?.startsWith("/financeiro/")
                ? "bg-gradient-to-r from-blue-600 to-sky-500 scale-110"
                : "bg-gradient-to-r from-blue-500 to-sky-400 scale-105"
            )}>
              <DollarSign className="h-7 w-7 text-white" />
            </div>
          </Link>

          {/* Menu Button */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center p-3 rounded-lg text-muted-foreground hover:text-brand hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de Navegação</SheetTitle>
          </SheetHeader>

          {/* Header */}
          <div className="flex h-16 items-center border-b-2 border-border px-6">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-sm">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-brand">FinkoMoney</span>
            </Link>
          </div>

          {/* Branch Switcher */}
          <div className="border-b border-border p-4">
            <BranchSwitcher initialBranch={currentBranch} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
            {/* Admin Panel Link */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all mb-2",
                  pathname.startsWith("/admin")
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                )}
              >
                <Shield className="h-5 w-5 shrink-0" />
                <span>Painel Admin</span>
              </Link>
            )}

            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              const hasAccess = item.hasAccess;

              return (
                <Link
                  key={item.name}
                  href={hasAccess ? item.href : "#"}
                  onClick={(e) => {
                    if (!hasAccess) {
                      e.preventDefault();
                      // TODO: Mostrar modal de upgrade
                    } else {
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all relative",
                    isActive && hasAccess
                      ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm"
                      : hasAccess
                      ? "text-card-foreground hover:bg-blue-50 hover:text-brand dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                      : "text-muted-foreground/40 hover:bg-muted/50 cursor-not-allowed opacity-60"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive && hasAccess && "drop-shadow-sm")} />
                  {!hasAccess && <Lock className="h-3 w-3 absolute left-2 top-2 text-muted-foreground" />}
                  <span className="flex-1">{item.name}</span>
                  {!hasAccess && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                      Upgrade
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t-2 border-border mt-auto">
            <div className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="font-medium">Sair</span>
              </Button>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 pt-3 dark:from-blue-950/20 dark:to-sky-950/20">
              <p className="text-xs font-medium text-brand">
                FinkoMoney v1.0
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Controle fácil, escolhas melhores.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

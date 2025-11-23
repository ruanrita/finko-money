"use client";

import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-white/10 transition-all"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-2 bg-white dark:bg-zinc-900 min-w-[160px]"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 mb-1"
        >
          <Sun className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="flex-1">Claro</span>
          {theme === "light" && <Check className="h-4 w-4 text-brand" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-900/50 dark:to-blue-900/50 mb-1"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="flex-1">Escuro</span>
          {theme === "dark" && <Check className="h-4 w-4 text-brand" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer bg-gradient-to-r from-zinc-100 to-gray-100 dark:from-zinc-900/50 dark:to-gray-900/50"
        >
          <Monitor className="mr-2 h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          <span className="flex-1">Sistema</span>
          {theme === "system" && <Check className="h-4 w-4 text-brand" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

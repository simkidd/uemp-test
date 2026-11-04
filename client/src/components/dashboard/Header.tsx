"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "next-themes";
import { ROLE_LABELS } from "@/constants";
import { Sun, Moon, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLogout } from "@/hooks/useLogout";

export function Header({ onOpenMobile }: { onOpenMobile?: () => void }) {
  const { user } = useAuthStore();
  const { handleLogout } = useLogout();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between sticky top-0 z-30 md:rounded-t-2xl">
      {/* Left: Mobile & Desktop sidebar trigger */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" />
      </div>

      {/* Right: Role Badge, Theme Toggle, Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Portal Role Indicator */}
        <span className="hidden sm:inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-burgundy-50 dark:bg-burgundy-950/60 border border-burgundy-200/70 dark:border-burgundy-900 text-burgundy-800 dark:text-burgundy-300">
          {ROLE_LABELS[user.role] || user.role}
        </span>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
          title="Toggle light/dark theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer outline-none">
              <div className="w-8 h-8 rounded-lg bg-burgundy-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="hidden md:flex flex-col text-left leading-none">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[120px] truncate">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                  {user.role === "STUDENT"
                    ? user.studentProfile?.matricNumber || "Student"
                    : ROLE_LABELS[user.role]}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-1.5">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300">
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {user.role === "STUDENT" && (
              <DropdownMenuItem asChild>
                <Link href="/student/profile" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  My Student Profile
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => handleLogout()}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

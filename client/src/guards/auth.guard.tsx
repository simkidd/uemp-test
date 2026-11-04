"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useCurrentUser } from "@/hooks/queries";
import { UserRole } from "@/interfaces";
import { GraduationCap } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ROLE_ROUTES: Record<UserRole, string> = {
  STUDENT: "/student",
  LECTURER: "/lecturer",
  DEPARTMENT_ADMIN: "/dept-admin",
  SUPER_ADMIN: "/admin",
};

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, updateUser, clearAuth } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Live session query against /api/v1/auth/me to keep user profile & role synced
  const { data: serverUser, error: sessionError } = useCurrentUser();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync fresh server user state to client store
  useEffect(() => {
    if (serverUser) {
      updateUser(serverUser);
    }
  }, [serverUser, updateUser]);

  // Handle server-side session revocation
  useEffect(() => {
    if (sessionError && isAuthenticated) {
      clearAuth();
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [sessionError, isAuthenticated, clearAuth, router, pathname]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        const targetRoute = ROLE_ROUTES[user.role] || "/auth/login";
        router.replace(targetRoute);
      }
    }
  }, [isHydrated, isAuthenticated, user, allowedRoles, router, pathname]);

  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 selection:bg-burgundy-700 selection:text-white">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-burgundy-700 text-white flex items-center justify-center shadow-lg shadow-burgundy-900/20 animate-pulse">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="absolute -inset-2 rounded-3xl border border-burgundy-200/50 dark:border-burgundy-900/40 animate-ping opacity-25" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Verifying Session Access
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Lead Web Praxis University Portal
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;

"use client";

import React, { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthGuard } from "@/guards/auth.guard";

export function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={true}>
        <div className="h-screen w-full flex bg-zinc-100/75 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans selection:bg-burgundy-700 selection:text-white">
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>

          {/* Floating Main Content Island */}
          <SidebarInset className="overflow-hidden flex flex-col min-w-0 transition-all duration-200 ease-linear">
            <Suspense fallback={null}>
              <Header />
            </Suspense>

            <div className="flex-1 overflow-y-auto flex flex-col justify-between bg-zinc-50/50 dark:bg-zinc-950/40 md:rounded-b-2xl">
              <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                <Suspense fallback={null}>{children}</Suspense>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

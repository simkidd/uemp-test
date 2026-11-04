"use client";

import React from "react";
import Link from "next/link";
import {
  useAdminUsers,
  useAdminFaculties,
  useAdminDepartments,
  useAdminProgrammes,
} from "@/hooks/queries";
import {
  Users,
  Building2,
  Calendar,
  FolderTree,
  FileSpreadsheet,
  ArrowRight,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AdminDashboardView() {
  const { data: usersData, isLoading: loadingUsers } = useAdminUsers({ limit: 1 });
  const { data: faculties = [], isLoading: loadingFaculties } = useAdminFaculties();
  const { data: depts = [], isLoading: loadingDepts } = useAdminDepartments();
  const { data: programmes = [], isLoading: loadingProgrammes } = useAdminProgrammes();

  const userCount = usersData?.pagination?.total || 0;
  const facultyCount = faculties.length;
  const deptCount = depts.length;
  const programmeCount = programmes.length;

  const isLoading = loadingUsers || loadingFaculties || loadingDepts || loadingProgrammes;

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading university administration metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            University Administration
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Central governance and academic operations console &bull; Lead Web Praxis University
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs">
            <Link href="/admin/users">
              <Users className="w-4 h-4 mr-1.5" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/admin/academic">
              <Calendar className="w-4 h-4 mr-1.5 text-burgundy-700" />
              Academic Sessions
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Accounts
            </CardTitle>
            <Users className="w-4 h-4 text-burgundy-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {userCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Registered university accounts</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Faculties
            </CardTitle>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {facultyCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Academic divisions</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Departments
            </CardTitle>
            <FolderTree className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {deptCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Teaching departments</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Degree Programmes
            </CardTitle>
            <GraduationCap className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {programmeCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Accredited curricula</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-burgundy-50 dark:bg-burgundy-950/50 flex items-center justify-center text-burgundy-700 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold">User Management</CardTitle>
            <CardDescription className="text-xs">
              Manage student, lecturer, and administrator accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/admin/users">
                Manage Accounts
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold">Academic Calendar</CardTitle>
            <CardDescription className="text-xs">
              Configure academic sessions and registration windows.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/admin/academic">
                Manage Calendar
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 mb-1">
              <FolderTree className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold">University Structure</CardTitle>
            <CardDescription className="text-xs">
              Configure faculties, departments, and degree programmes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/admin/structure">
                View Hierarchy
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 mb-1">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold">Security Audit Trail</CardTitle>
            <CardDescription className="text-xs">
              Immutable ledger of grade submissions and approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/admin/reports">
                View Audit Trail
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

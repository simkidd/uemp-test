"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import {
  useDeptCourses,
  useDeptPendingResults,
  useDeptStudents,
} from "@/hooks/queries";
import {
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DeptAdminDashboardView() {
  const { user } = useAuthStore();
  const { data: courses = [], isLoading: loadingCourses } = useDeptCourses();
  const { data: pendingResults = [], isLoading: loadingPending } = useDeptPendingResults();
  const { data: students = [], isLoading: loadingStudents } = useDeptStudents();

  const isLoading = loadingCourses || loadingPending || loadingStudents;

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading department overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {user?.department?.name || "Department"} Administration
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Department Code:{" "}
            <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
              {user?.department?.code || "—"}
            </span>{" "}
            &bull; Administrator: {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingResults.length > 0 && (
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs">
              <Link href="/dept-admin/approvals">
                <Clock className="w-4 h-4 mr-1.5" />
                Review Approvals ({pendingResults.length})
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/dept-admin/courses">
              <BookOpen className="w-4 h-4 mr-1.5 text-burgundy-700" />
              Manage Courses
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Department Students
            </CardTitle>
            <Users className="w-4 h-4 text-burgundy-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {students.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Enrolled undergraduates</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Active Courses
            </CardTitle>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {courses.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Curriculum course offerings</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Pending Approvals
            </CardTitle>
            <Clock className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingResults.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Lecturer submissions in queue</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-burgundy-50 dark:bg-burgundy-950/50 flex items-center justify-center text-burgundy-700 mb-1">
              <CheckCircle className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold">Grade Approvals</CardTitle>
            <CardDescription className="text-xs">
              Verify and approve lecturer score submissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/dept-admin/approvals">
                Open Queue
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mb-1">
              <ClipboardList className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold">Course Allocations</CardTitle>
            <CardDescription className="text-xs">
              Assign departmental courses to lecturers.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/dept-admin/allocations">
                Manage Allocations
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 mb-1">
              <BookOpen className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold">Course Catalog</CardTitle>
            <CardDescription className="text-xs">
              Create and manage department courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/dept-admin/courses">
                View Courses
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold">Department Students</CardTitle>
            <CardDescription className="text-xs">
              View enrolled students and matriculation records.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/dept-admin/students">
                View Students
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

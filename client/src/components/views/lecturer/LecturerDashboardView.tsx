"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useAssignedCourses } from "@/hooks/queries";
import {
  BookOpen,
  FileSpreadsheet,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LecturerDashboardView() {
  const { user } = useAuthStore();
  const { data: allocations = [], isLoading } = useAssignedCourses();

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading course allocations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Lecturer Workspace
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {user?.firstName} {user?.lastName} &bull;{" "}
            <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
              {user?.staffProfile?.staffId || "Staff ID: Pending"}
            </span>
            {user?.department?.name && ` \u2022 Department of ${user.department.name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs">
            <Link href="/lecturer/scores">
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Manage Score Sheets
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Allocated Courses
            </CardTitle>
            <BookOpen className="w-4 h-4 text-burgundy-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {allocations.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Active course assignments</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Grading Schema
            </CardTitle>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              40 / 70 Max
            </div>
            <p className="text-xs text-zinc-500 mt-1">Continuous assessment (40) &amp; exam (70)</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Grading Standard
            </CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">5.0 Scale</div>
            <p className="text-xs text-zinc-500 mt-1">A &ndash; F credit-weighted computation</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Courses Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Course Allocations
            </CardTitle>
            <CardDescription className="text-xs">
              Courses assigned to you for score entry and grade submission.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            {allocations.length} Courses
          </Badge>
        </CardHeader>

        <CardContent>
          {allocations.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No Course Allocations Found
              </p>
              <p className="text-xs text-zinc-500">
                Your Department Administrator has not yet allocated courses for this academic session.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="py-2.5 px-3 w-10 text-center">S/N</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-3 text-center">Units</th>
                    <th className="py-2.5 px-3 text-center">Level</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {allocations.map((alloc, idx) => (
                    <tr key={alloc._id || idx} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-3 text-center text-zinc-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-burgundy-700 dark:text-burgundy-400">
                        {alloc.course?.code}
                      </td>
                      <td className="py-3 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {alloc.course?.title}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-zinc-700 dark:text-zinc-300">
                        {alloc.course?.creditUnits}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {alloc.course?.level} Level
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button asChild size="sm" variant="outline" className="text-xs h-7 gap-1">
                          <Link href={`/lecturer/scores/${alloc.course?._id}`}>
                            Score Sheet
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useAssignedCourses } from "@/hooks/queries";
import {
  BookOpen,
  FileSpreadsheet,
  Users,
  ArrowRight,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LecturerDashboardView() {
  const { user } = useAuthStore();
  const { data: allocations = [], isLoading } = useAssignedCourses();

  // Compute grading overview pipeline
  const stats = useMemo(() => {
    let totalStudents = 0;
    let totalUnits = 0;
    let drafts = 0;
    let submitted = 0;
    let approved = 0;
    let rejected = 0;

    allocations.forEach((alloc) => {
      totalUnits += alloc.course?.creditUnit || 0;
      totalStudents += alloc.enrolledCount || 0;

      const status = alloc.resultStatus;
      if (status === "DRAFT") drafts++;
      else if (status === "SUBMITTED") submitted++;
      else if (status === "APPROVED") approved++;
      else if (status === "REJECTED") rejected++;
    });

    return {
      totalCourses: allocations.length,
      totalUnits,
      totalStudents,
      drafts,
      submitted,
      approved,
      rejected,
    };
  }, [allocations]);

  // Find any courses needing revision
  const rejectedAllocations = useMemo(() => {
    return allocations.filter((a) => a.resultStatus === "REJECTED");
  }, [allocations]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs font-medium">Loading lecturer workspace...</span>
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
              {user?.staffProfile?.staffId || "Staff ID: Active"}
            </span>
            {user?.department?.name && ` \u2022 Department of ${user.department.name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs"
          >
            <Link href="/lecturer/scores">
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Manage Score Sheets
            </Link>
          </Button>
        </div>
      </div>

      {/* Action Needed Banner: Rejection Feedback */}
      {rejectedAllocations.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Revision Required: {rejectedAllocations.length} Course Result Submission{rejectedAllocations.length === 1 ? "" : "s"} Returned
            </h4>
            <p className="text-xs text-rose-800 dark:text-rose-300">
              Your Department Administrator returned score submissions for:{" "}
              <span className="font-semibold">
                {rejectedAllocations.map((a) => a.course?.code).join(", ")}
              </span>
              . Please review administrator remarks on the score sheet, adjust marks, and re-submit.
            </p>
          </div>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Teaching Load
            </CardTitle>
            <BookOpen className="w-4 h-4 text-burgundy-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {stats.totalCourses}{" "}
              <span className="text-sm font-normal text-zinc-500">Courses</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {stats.totalUnits} Cumulative Credit Units
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Enrolled Students
            </CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {stats.totalStudents}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Active candidates across class rosters
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Grading Pipeline
            </CardTitle>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 pt-1">
              {stats.approved > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {stats.approved} Published
                </span>
              )}
              {stats.submitted > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  {stats.submitted} Under Review
                </span>
              )}
              {stats.drafts > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {stats.drafts} Draft
                </span>
              )}
              {stats.rejected > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  {stats.rejected} Revision
                </span>
              )}
              {stats.approved === 0 &&
                stats.submitted === 0 &&
                stats.drafts === 0 &&
                stats.rejected === 0 && (
                  <span className="text-xs text-zinc-500 font-medium">All pending scoring</span>
                )}
            </div>
            <p className="text-xs text-zinc-500 mt-2">Continuous assessment (40) &bull; Exam (70)</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Allocations Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Allocated Courses &amp; Grading Status
            </CardTitle>
            <CardDescription className="text-xs">
              Courses assigned to you for score recording, verification, and departmental submission.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            {allocations.length} Assigned Course{allocations.length === 1 ? "" : "s"}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {allocations.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No Course Allocations Found
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Your Department Administrator has not yet allocated courses for this academic session.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="py-3 px-4 w-10 text-center">S/N</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4 text-center">Units</th>
                    <th className="py-3 px-4 text-center">Level &amp; Semester</th>
                    <th className="py-3 px-4 text-center">Enrolled</th>
                    <th className="py-3 px-4 text-center">Grading Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {allocations.map((alloc, idx) => {
                    const status = alloc.resultStatus || "NOT_STARTED";
                    return (
                      <tr
                        key={alloc._id || idx}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-center text-zinc-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-burgundy-700 dark:text-burgundy-400">
                          {alloc.course?.code}
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {alloc.course?.title}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-zinc-700 dark:text-zinc-300">
                          {alloc.course?.creditUnit}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            {alloc.course?.level}L &bull; {alloc.course?.semester}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-zinc-800 dark:text-zinc-200">
                          {alloc.enrolledCount ?? 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={`text-[10px] font-semibold ${
                              status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                : status === "SUBMITTED"
                                ? "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300"
                                : status === "REJECTED"
                                ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                                : status === "DRAFT"
                                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {status === "SUBMITTED"
                              ? "UNDER REVIEW"
                              : status === "REJECTED"
                              ? "REVISION NEEDED"
                              : status === "NOT_STARTED"
                              ? "NOT STARTED"
                              : status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            asChild
                            size="sm"
                            className="bg-burgundy-700 hover:bg-burgundy-800 text-white text-xs h-7 gap-1 font-medium shadow-xs"
                          >
                            <Link href={`/lecturer/scores/${alloc.course?._id}`}>
                              {status === "APPROVED"
                                ? "View Grades"
                                : status === "SUBMITTED"
                                ? "View Sheet"
                                : "Score Sheet"}
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

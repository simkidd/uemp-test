"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useRegisteredCourses, useStudentResults } from "@/hooks/queries";
import {
  ClipboardList,
  Award,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StudentDashboardView() {
  const { user } = useAuthStore();
  const { data: registration, isLoading: loadingReg } = useRegisteredCourses();
  const { data: resultsData, isLoading: loadingResults } = useStudentResults();

  const loading = loadingReg || loadingResults;

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading portal overview...</span>
      </div>
    );
  }

  const totalRegisteredUnits =
    registration?.totalCreditUnits ?? registration?.totalUnits ?? 0;

  const cgpaValue =
    resultsData?.cgpa !== undefined ? resultsData.cgpa.toFixed(2) : "0.00";

  const totalApprovedCourses =
    resultsData?.semesters?.reduce((sum, s) => sum + s.courses.length, 0) || 0;

  const registeredCourseItems = registration?.courses || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
              {user?.studentProfile?.matricNumber || "Matric: Pending"}
            </span>
            {user?.department?.name && ` \u2022 Department of ${user.department.name}`}
            {user?.studentProfile?.level && ` \u2022 ${user.studentProfile.level} Level`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs">
            <Link href="/student/register">
              <ClipboardList className="w-4 h-4 mr-1.5" />
              {registration ? "Registration Slip" : "Register Courses"}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/student/results">
              <Award className="w-4 h-4 mr-1.5 text-burgundy-700" />
              Official Results
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Registered Load
            </CardTitle>
            <BookOpen className="w-4 h-4 text-burgundy-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {totalRegisteredUnits}{" "}
              <span className="text-xs font-normal text-zinc-500">/ 24 Units</span>
            </div>
            <p className="text-xs mt-1">
              {registration ? (
                <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Finalized
                </span>
              ) : (
                <span className="text-amber-600 font-medium inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Pending Registration
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Cumulative GPA
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {cgpaValue}{" "}
              <span className="text-xs font-normal text-zinc-500">/ 5.00</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {resultsData?.classification || "In Good Standing"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Passed Courses
            </CardTitle>
            <Award className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {totalApprovedCourses}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Confirmed examination results</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Enrolled Courses
            </CardTitle>
            <CardDescription className="text-xs">
              Semester course enrollment and credit unit allocation.
            </CardDescription>
          </div>
          {registration && (
            <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs">
              {totalRegisteredUnits} Units Confirmed
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {registeredCourseItems.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs text-zinc-500">No courses registered for this semester yet.</p>
              <Button asChild size="sm" className="bg-burgundy-700 hover:bg-burgundy-800 text-white text-xs">
                <Link href="/student/register">Register Courses</Link>
              </Button>
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
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {registeredCourseItems.map((item: any, idx: number) => {
                    const c = typeof item.course === "object" ? item.course : item;
                    return (
                      <tr key={c._id || idx} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                        <td className="py-2.5 px-3 text-center text-zinc-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-burgundy-700 dark:text-burgundy-400">
                          {c.code}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                          {c.title}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-zinc-700 dark:text-zinc-300">
                          {c.creditUnit ?? item.creditUnit}
                        </td>

                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              c.isElective
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                : "bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300"
                            }`}
                          >
                            {c.isElective ? "Elective" : "Core"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                          </span>
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

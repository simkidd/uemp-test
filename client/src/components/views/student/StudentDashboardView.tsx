"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth.store";
import { useRegisteredCourses, useAvailableCourses } from "@/hooks/queries";
import {
  ClipboardList,
  BookOpen,
  Loader2,
  ArrowRight,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StudentDashboardView() {
  const { user } = useAuthStore();
  const { data: registration, isLoading: loadingReg } = useRegisteredCourses();
  const { data: availData, isLoading: loadingAvail } = useAvailableCourses();

  const loading = loadingReg || loadingAvail;

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-7 h-7 animate-spin text-burgundy-700" />
        <span className="text-xs font-medium">Loading student portal...</span>
      </div>
    );
  }

  // Academic Credentials (Assessment Requirement: Faculty, Department, Programme, Matric No, Level)
  const matricNumber =
    user?.studentProfile?.matricNumber ||
    availData?.studentInfo?.matricNumber ||
    "Matric: Pending";

  const studentLevel =
    user?.studentProfile?.level || availData?.studentInfo?.level || 200;

  const departmentName =
    user?.department?.name ||
    availData?.studentInfo?.department?.name ||
    (typeof user?.department === "string" ? user.department : "Computer Science");

  const facultyName =
    user?.faculty?.name ||
    (user?.department?.faculty as any)?.name ||
    "Faculty of Natural & Applied Sciences";

  const programmeName =
    (user?.studentProfile?.programme as any)?.name ||
    (typeof user?.studentProfile?.programme === "string"
      ? user.studentProfile.programme
      : null) ||
    availData?.studentInfo?.programme?.name ||
    "B.Sc. Computer Science";

  const activeSessionName =
    availData?.activeSession?.name || "2025/2026 Academic Session";

  const activeSemesterName =
    availData?.activeSemester?.name || "First Semester";

  const hasRegistered = Boolean(registration || availData?.hasRegistered);
  const totalRegisteredUnits =
    registration?.totalCreditUnits ?? registration?.totalUnits ?? 0;
  const registeredCourseItems = registration?.courses || [];

  const avatarUrl =
    typeof user?.avatar === "object" && user?.avatar?.url
      ? user.avatar.url
      : typeof user?.avatar === "string" && user.avatar
      ? user.avatar
      : (user?.studentProfile as any)?.passportPhoto || null;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Official Student Identity & Bio-Data Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden py-0 gap-0">
        <div className="h-1.5 bg-gradient-to-r from-burgundy-800 via-burgundy-600 to-rose-700" />
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
            {/* Student Passport Photograph */}
            <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-lg overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0 shadow-xs flex flex-col items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-burgundy-50 dark:bg-burgundy-950/60 text-burgundy-800 dark:text-burgundy-300 flex flex-col items-center justify-center p-2 text-center">
                  <span className="font-bold text-2xl font-serif">
                    {user?.firstName?.[0] || "S"}{user?.lastName?.[0] || ""}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 mt-1">
                    Passport Photo
                  </span>
                </div>
              )}
            </div>

            {/* Academic Information Grid */}
            <div className="flex-1 space-y-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {user?.firstName} {user?.lastName} {user?.otherName || ""}
                  </h1>
                  <p className="font-mono text-xs font-bold text-burgundy-700 dark:text-burgundy-400 mt-0.5">
                    {matricNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
                    {studentLevel} Level
                  </Badge>
                  {!hasRegistered && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold">
                      Registration Pending
                    </Badge>
                  )}
                </div>
              </div>

              {/* Institutional Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Faculty</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                    {facultyName}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Department</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                    {departmentName}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Degree Programme</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                    {programmeName}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Academic Session</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 block truncate">
                    {activeSessionName}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Current Semester</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 block truncate">
                    {activeSemesterName}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Student Institutional Email</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 block truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semester Course Enrollment Section */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden py-0 gap-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Registered Semester Courses
            </CardTitle>
            <CardDescription className="text-xs">
              Official courses registered for {activeSemesterName} &bull; {activeSessionName}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {hasRegistered ? (
              <>
                <Badge variant="outline" className="text-xs font-semibold text-emerald-700 border-emerald-300 dark:text-emerald-300">
                  {totalRegisteredUnits} Credit Units Confirmed
                </Badge>
                <Button asChild size="sm" variant="outline" className="text-xs h-8 gap-1.5 font-medium shadow-2xs">
                  <Link href="/student/register">
                    <Printer className="w-3.5 h-3.5 text-burgundy-700" />
                    Print Course Slip
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="bg-burgundy-700 hover:bg-burgundy-800 text-white text-xs h-8 font-semibold shadow-xs">
                <Link href="/student/register">
                  <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                  Register Semester Courses
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {registeredCourseItems.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <BookOpen className="w-8 h-8 text-zinc-400 mx-auto mb-1" />
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                No Courses Registered for this Semester
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Semester course registration is currently active. Select and submit your required courses to establish your official study syllabus.
              </p>
              <Button asChild size="sm" className="bg-burgundy-700 hover:bg-burgundy-800 text-white text-xs shadow-xs">
                <Link href="/student/register">
                  <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                  Begin Course Registration
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="py-3 px-4 w-12 text-center">S/N</th>
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4 text-center">Type</th>
                    <th className="py-3 px-4 text-right">Credit Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {registeredCourseItems.map((item: any, idx: number) => {
                    const c = typeof item.course === "object" ? item.course : item;
                    const unit = c.creditUnit ?? item.creditUnit ?? 0;
                    return (
                      <tr
                        key={c._id || idx}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-center text-zinc-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-burgundy-700 dark:text-burgundy-400">
                          {c.code}
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {c.title}
                        </td>
                        <td className="py-3 px-4 text-center">
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
                        <td className="py-3 px-4 text-right font-bold text-zinc-700 dark:text-zinc-300">
                          {unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Footer */}
              <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-zinc-500">
                  Total Registered Courses:{" "}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {registeredCourseItems.length}
                  </span>{" "}
                  &bull; Total Credit Units:{" "}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {totalRegisteredUnits}
                  </span>
                </span>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1 font-medium"
                >
                  <Link href="/student/register">
                    View Full Slip
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

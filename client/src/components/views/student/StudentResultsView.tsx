"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useStudentResults } from "@/hooks/queries";
import { GRADING_SCALE } from "@/constants";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import {
  Award,
  Printer,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  FileText,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { A4DocumentModal } from "@/components/common/A4DocumentModal";

export function StudentResultsView() {
  const { user } = useAuthStore();
  const { data: resultsData, isLoading: loading } = useStudentResults();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
      case "B":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300";
      case "C":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
      case "D":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300";
      case "E":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300";
      default:
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-7 h-7 animate-spin text-burgundy-700" />
        <span className="text-sm font-medium">Loading approved academic examination results...</span>
      </div>
    );
  }

  const semesters = resultsData?.semesters || [];
  const hasResults = semesters.length > 0;
  const totalCoursesCount = semesters.reduce((sum, s) => sum + s.courses.length, 0);
  const totalUnitsAccumulated = semesters.reduce((sum, s) => sum + s.totalUnits, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Academic Results &amp; Statement
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Official confirmed examination grades for {user?.firstName} {user?.lastName} &bull;{" "}
            {user?.studentProfile?.level || 200} Level Computer Science
          </p>
        </div>

        {hasResults && (
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 shadow-2xs font-semibold"
          >
            <Printer className="w-4 h-4 text-burgundy-700" />
            Print Statement of Results
          </Button>
        )}
      </div>

      {/* Cumulative GPA & Academic Standing Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-burgundy-200/80 dark:border-burgundy-900/60 bg-gradient-to-br from-burgundy-800 to-rose-950 text-white shadow-md md:col-span-2">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-rose-100 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-300" />
                Cumulative Grade Point Average (CGPA)
              </span>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 text-xs">
                5.0 Scale
              </Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {resultsData?.cgpa !== undefined ? resultsData.cgpa.toFixed(2) : "0.00"}
              </span>
              <span className="text-rose-200 text-sm font-semibold">/ 5.00 Maximum</span>
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
              <span className="text-rose-100">Degree Classification:</span>
              <span className="font-bold text-amber-200 bg-black/20 px-2.5 py-0.5 rounded-full">
                {resultsData?.classification || "Good Standing"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-burgundy-700" />
              Completed Units
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{totalUnitsAccumulated} Units</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-zinc-500">
              Across {semesters.length} official completed semester(s).
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Passed Courses
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{totalCoursesCount} Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-zinc-500">
              All departmental core and elective results verified.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* No Results Fallback */}
      {!hasResults && (
        <Card className="border-dashed border-zinc-300 dark:border-zinc-800 text-center py-16">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
              No Approved Examination Results Yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Examination grades will be displayed here once officially submitted by lecturers and approved by the Department.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Semester Results Tables */}
      {semesters.map((sem) => (
        <Card key={sem.sessionAndSemester} className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-burgundy-700" />
                  {sem.sessionAndSemester}
                </CardTitle>
                <CardDescription className="text-xs">
                  Official published semester grades &bull; Total Units: {sem.totalUnits}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Semester GPA:</span>
                <Badge className="bg-burgundy-700 text-white font-bold text-xs px-2.5 py-0.5">
                  {sem.gpa.toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="py-2.5 px-3 w-10 text-center">S/N</th>
                    <th className="py-2.5 px-3">Course Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-3 text-center">Credit Units</th>
                    <th className="py-2.5 px-3 text-center">CA (0-40)</th>
                    <th className="py-2.5 px-3 text-center">Exam (0-70)</th>
                    <th className="py-2.5 px-3 text-center font-bold">Total (100)</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {sem.courses.map((c, i) => (
                    <tr key={c.courseCode + i} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-3 text-center text-zinc-400">{i + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-burgundy-700 dark:text-burgundy-400">
                        {c.courseCode}
                      </td>
                      <td className="py-3 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {c.courseTitle}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-zinc-700 dark:text-zinc-300">
                        {c.creditUnit}
                      </td>
                      <td className="py-3 px-3 text-center text-zinc-600 dark:text-zinc-400">
                        {c.caScore}
                      </td>
                      <td className="py-3 px-3 text-center text-zinc-600 dark:text-zinc-400">
                        {c.examScore}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-zinc-900 dark:text-zinc-100">
                        {c.totalScore}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getGradeBadge(
                            c.grade
                          )}`}
                        >
                          {c.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {(c.gradePoint * c.creditUnit).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Standard Nigerian 5.0 Grading System Guide */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            University 5.0 Point Grading Scale Matrix
          </CardTitle>
          <CardDescription className="text-xs">
            Standard Credit-Unit-Weighted calculation formula adopted across all academic faculties.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            {GRADING_SCALE.map((g) => (
              <div
                key={g.grade}
                className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-1"
              >
                <span
                  className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs border ${getGradeBadge(
                    g.grade
                  )}`}
                >
                  Grade {g.grade}
                </span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">{g.points.toFixed(1)} Points</p>
                <p className="text-[10px] text-zinc-500">
                  {g.min} &ndash; {g.max}% ({g.remark})
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* A4 Document Modal Preview for Statement of Results */}
      {hasResults && (
        <A4DocumentModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Official Statement of Academic Results"
          subtitle={`Issued to: ${user?.firstName} ${user?.lastName} • Matric: ${user?.studentProfile?.matricNumber || "UEMP/2024/001"}`}
        >
          {/* Institutional Letterhead */}
          <div className="text-center border-b border-zinc-300 pb-5 space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-burgundy-700 text-white mb-2 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black tracking-tight uppercase text-zinc-900">
              LEAD WEB PRAXIS UNIVERSITY (UEMP)
            </h3>
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              OFFICE OF THE REGISTRAR &bull; OFFICIAL STATEMENT OF ACADEMIC RESULTS
            </p>
            <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider border border-zinc-300">
                CONFIDENTIAL TRANSCRIPT OF ACADEMIC PERFORMANCE
              </span>
              <span className="text-[11px] font-mono text-zinc-500 font-medium">
                Issued: {formatDate(new Date(), DATE_FORMATS.DATE_FULL)}
              </span>
            </div>
          </div>

          {/* Student Biodata Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
            <div>
              <span className="text-zinc-500 font-medium">Student Full Name:</span>
              <p className="font-bold text-zinc-900 text-sm">
                {user?.firstName} {user?.lastName} {user?.otherName || ""}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Matriculation Number:</span>
              <p className="font-mono font-bold text-burgundy-800 text-sm">
                {user?.studentProfile?.matricNumber || "UEMP/2024/001"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Faculty:</span>
              <p className="font-semibold text-zinc-800">
                {user?.faculty?.name || "Faculty of Science"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Department:</span>
              <p className="font-semibold text-zinc-800">
                {user?.department?.name || "Computer Science"} (B.Sc.)
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Academic Level:</span>
              <p className="font-semibold text-zinc-800">
                {user?.studentProfile?.level || 200} Level
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Cumulative GPA:</span>
              <p className="font-bold text-burgundy-800 text-sm">
                {resultsData?.cgpa !== undefined ? resultsData.cgpa.toFixed(2) : "0.00"} / 5.00
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Degree Classification:</span>
              <p className="font-bold text-amber-700 text-sm">
                {resultsData?.classification || "First Class Honours"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Total Units Completed:</span>
              <p className="font-bold text-emerald-700 text-sm">{totalUnitsAccumulated} Units</p>
            </div>
          </div>

          {/* Transcript Course Results Table */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 border-b border-zinc-200 font-bold text-zinc-700">
                <tr>
                  <th className="py-2 px-3">Session &amp; Semester</th>
                  <th className="py-2 px-3">Course Code</th>
                  <th className="py-2 px-3">Course Title</th>
                  <th className="py-2 px-3 text-center">Units</th>
                  <th className="py-2 px-3 text-center">Total Score</th>
                  <th className="py-2 px-3 text-center">Grade</th>
                  <th className="py-2 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {semesters.flatMap((s) =>
                  s.courses.map((c, idx) => (
                    <tr key={s.sessionAndSemester + c.courseCode + idx}>
                      <td className="py-2 px-3 text-zinc-600 font-medium">{s.sessionAndSemester}</td>
                      <td className="py-2 px-3 font-mono font-bold text-burgundy-800">{c.courseCode}</td>
                      <td className="py-2 px-3 font-medium text-zinc-900">{c.courseTitle}</td>
                      <td className="py-2 px-3 text-center font-bold">{c.creditUnit}</td>
                      <td className="py-2 px-3 text-center font-bold">{c.totalScore}</td>
                      <td className="py-2 px-3 text-center font-bold">{c.grade}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {(c.gradePoint * c.creditUnit).toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Verification & Registrar Signature */}
          <div className="pt-6 border-t border-zinc-300 space-y-6">
            <p className="text-[11px] text-zinc-500 italic text-center">
              This statement of results is an official university academic document. Any erasure or alteration renders this document completely invalid.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 text-xs text-zinc-700">
              <div className="text-center space-y-2">
                <div className="border-b border-zinc-400 h-8 flex items-end justify-center font-serif italic text-sm text-zinc-800">
                  Prof. Adeyemi Adeleke
                </div>
                <span className="font-semibold block">University Registrar &amp; Secretary</span>
              </div>

              <div className="text-center space-y-2">
                <div className="border-b border-zinc-400 h-8 flex items-end justify-center font-mono text-xs text-zinc-600">
                  UEMP-ACAD-VERIFIED-2026
                </div>
                <span className="font-semibold block">Official Verification Stamp / Security Code</span>
              </div>
            </div>
          </div>
        </A4DocumentModal>
      )}
    </div>
  );
}

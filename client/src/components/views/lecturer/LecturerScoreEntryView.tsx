"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAssignedCourses,
  useCourseStudents,
  useCourseResults,
  useSaveDraftResults,
  useSubmitResults,
} from "@/hooks/queries";
import { ICourse, ICourseAllocation, ResultStatus } from "@/interfaces";
import { toast } from "sonner";
import {
  Save,
  Send,
  ArrowLeft,
  Clock,
  ShieldAlert,
  Loader2,
  Users,
  Search,
  CheckCircle2,
  TrendingUp,
  Award,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StudentScoreRow {
  studentId: string;
  studentName: string;
  matricNumber: string;
  caScore: number | string;
  examScore: number | string;
  totalScore: number;
  grade: string;
  status?: ResultStatus;
  rejectionRemarks?: string;
}

export function LecturerScoreEntryView({ courseId }: { courseId: string }) {
  const router = useRouter();

  const { data: allocations = [], isLoading: loadingAlloc } = useAssignedCourses();
  const { data: courseStudentsData, isLoading: loadingStudents } = useCourseStudents(courseId);
  const { data: existingResults = [], isLoading: loadingResults } = useCourseResults(courseId);

  const saveDraftMutation = useSaveDraftResults();
  const submitMutation = useSubmitResults();

  const [course, setCourse] = useState<ICourse | null>(null);
  const [rows, setRows] = useState<StudentScoreRow[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [overallStatus, setOverallStatus] = useState<ResultStatus>("DRAFT");
  const [rejectionRemarks, setRejectionRemarks] = useState<string>("");

  const computeGrade = (total: number) => {
    if (total >= 70) return "A";
    if (total >= 60) return "B";
    if (total >= 50) return "C";
    if (total >= 45) return "D";
    if (total >= 40) return "E";
    return "F";
  };

  useEffect(() => {
    if (allocations.length > 0) {
      const currentAlloc = allocations.find((a: ICourseAllocation) => a.course?._id === courseId);
      if (currentAlloc) {
        setCourse(currentAlloc.course);
      }
    }
  }, [allocations, courseId]);

  useEffect(() => {
    if (courseStudentsData) {
      const studentsList = courseStudentsData.students || [];
      const initialRows: StudentScoreRow[] = studentsList.map((student: any) => {
        const studentId = student._id || student.studentId;
        const existing = existingResults.find((r: any) => {
          const sId = typeof r.student === "object" ? r.student?._id : (r.student || r.studentId);
          return sId === studentId;
        });

        const ca = existing?.caScore !== undefined ? existing.caScore : (student.caScore !== undefined ? student.caScore : "");
        const exam = existing?.examScore !== undefined ? existing.examScore : (student.examScore !== undefined ? student.examScore : "");
        const total = (Number(ca) || 0) + (Number(exam) || 0);

        return {
          studentId: studentId,
          studentName: student.studentName || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student",
          matricNumber: student.studentProfile?.matricNumber || student.matricNumber || "UEMP/Pending",
          caScore: ca,
          examScore: exam,
          totalScore: total,
          grade: existing?.grade || (student.grade && student.grade !== "-" ? student.grade : (ca !== "" || exam !== "" ? computeGrade(total) : "-")),
          status: existing?.status || (courseStudentsData.resultStatus as ResultStatus) || "DRAFT",
          rejectionRemarks: existing?.rejectionRemarks || courseStudentsData.rejectionReason,
        };
      });

      setRows(initialRows);

      if (courseStudentsData.resultStatus && courseStudentsData.resultStatus !== "NOT_STARTED") {
        setOverallStatus(courseStudentsData.resultStatus as ResultStatus);
        if (courseStudentsData.resultStatus === "REJECTED") {
          setRejectionRemarks(courseStudentsData.rejectionReason || "");
        }
      } else if (existingResults.length > 0) {
        const firstStatus = existingResults[0].status;
        setOverallStatus(firstStatus);
        if (firstStatus === "REJECTED") {
          setRejectionRemarks(existingResults[0].rejectionRemarks || "");
        }
      }
    }
  }, [courseStudentsData, existingResults]);

  // Real-time performance metrics (Assessment Requirement: Course & Student Performance Summaries)
  const performanceStats = useMemo(() => {
    const scoredList = rows.filter((r) => r.caScore !== "" || r.examScore !== "");
    const totalScored = scoredList.length;

    if (totalScored === 0) {
      return {
        totalCandidates: rows.length,
        scoredCandidates: 0,
        averageScore: "0.0",
        passRate: 0,
        highestScore: 0,
        lowestScore: 0,
        gradeCounts: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 } as Record<string, number>,
      };
    }

    const totalSum = scoredList.reduce((acc, r) => acc + r.totalScore, 0);
    const avg = (totalSum / totalScored).toFixed(1);
    const passCount = scoredList.filter((r) => r.totalScore >= 40).length;
    const passRate = Math.round((passCount / totalScored) * 100);
    const scores = scoredList.map((r) => r.totalScore);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    scoredList.forEach((r) => {
      if (gradeCounts[r.grade] !== undefined) {
        gradeCounts[r.grade]++;
      }
    });

    return {
      totalCandidates: rows.length,
      scoredCandidates: totalScored,
      averageScore: avg,
      passRate,
      highestScore: highest,
      lowestScore: lowest,
      gradeCounts,
    };
  }, [rows]);

  // Filtered rows for fast in-class searching
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.matricNumber.toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  const handleScoreChange = (
    studentId: string,
    field: "caScore" | "examScore",
    val: string,
  ) => {
    setRows((prevRows) => {
      return prevRows.map((row) => {
        if (row.studentId !== studentId) return row;

        const updated = { ...row };

        if (val === "") {
          updated[field] = "";
        } else {
          const num = Number(val);
          if (isNaN(num)) return row;

          if (field === "caScore" && (num < 0 || num > 40)) {
            toast.warning("Continuous Assessment (CA) score must be between 0 and 40.");
            return row;
          }
          if (field === "examScore" && (num < 0 || num > 70)) {
            toast.warning("Examination score must be between 0 and 70.");
            return row;
          }
          updated[field] = num;
        }

        const ca = Number(updated.caScore) || 0;
        const exam = Number(updated.examScore) || 0;
        const total = ca + exam;

        if (total > 100) {
          toast.error(`Combined total cannot exceed 100 (Currently ${total}).`);
          return row;
        }

        updated.totalScore = total;
        updated.grade =
          updated.caScore !== "" || updated.examScore !== ""
            ? computeGrade(total)
            : "-";
        return updated;
      });
    });
  };

  const isFormLocked = overallStatus === "SUBMITTED" || overallStatus === "APPROVED";
  const isLoading = loadingAlloc || loadingStudents || loadingResults;

  const handleSaveDraft = async () => {
    try {
      const scoresPayload = rows.map((r) => ({
        studentId: r.studentId,
        caScore: Number(r.caScore) || 0,
        examScore: Number(r.examScore) || 0,
      }));

      await saveDraftMutation.mutateAsync({ courseId, results: scoresPayload });

      toast.success("Draft Saved", {
        description: "Student scores saved successfully in draft status.",
      });
      setOverallStatus("DRAFT");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save draft";
      toast.error("Save Draft Failed", { description: errorMsg });
    }
  };

  const handleSubmitFinal = async () => {
    for (const r of rows) {
      if (r.caScore === "" || r.examScore === "") {
        toast.warning("Incomplete Scores", {
          description: `All enrolled students must have valid CA & Exam scores before submission (${r.studentName}).`,
        });
        return;
      }
    }

    try {
      const scoresPayload = rows.map((r) => ({
        studentId: r.studentId,
        caScore: Number(r.caScore) || 0,
        examScore: Number(r.examScore) || 0,
      }));

      await submitMutation.mutateAsync({ courseId, results: scoresPayload });

      toast.success("Scores Submitted", {
        description: "Course results forwarded to Department Administrator for verification and approval.",
      });
      setOverallStatus("SUBMITTED");
      router.push("/lecturer/scores");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Submission failed";
      toast.error("Submission Failed", { description: errorMsg });
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs font-medium">Loading course roster and scores...</span>
      </div>
    );
  }

  const isMutating = saveDraftMutation.isPending || submitMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Course Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <Link href="/lecturer/scores">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Score Sheets
            </Link>
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {course?.code}: {course?.title}
            </h1>
            <Badge
              className={
                overallStatus === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                  : overallStatus === "SUBMITTED"
                  ? "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300"
                  : overallStatus === "REJECTED"
                  ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                  : overallStatus === "DRAFT"
                  ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300"
              }
            >
              {overallStatus === "SUBMITTED" ? "UNDER REVIEW" : overallStatus}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500">
            {course?.creditUnit} Credit Unit{course?.creditUnit === 1 ? "" : "s"} &bull;{" "}
            {course?.level} Level &bull; {course?.semester} &bull;{" "}
            {rows.length} Enrolled Student{rows.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isFormLocked && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isMutating}
                className="text-xs font-medium border-zinc-300 dark:border-zinc-700"
              >
                {saveDraftMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-burgundy-700" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                )}
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitFinal}
                disabled={isMutating}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                )}
                Submit for Approval
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Review Feedback Banners */}
      {overallStatus === "REJECTED" && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Result Submission Returned by Department Administrator
            </h4>
            <p className="text-xs text-rose-800 dark:text-rose-300">
              <span className="font-semibold">Reviewer Remarks:</span>{" "}
              {rejectionRemarks ||
                "Discrepancies identified during departmental review. Please adjust the continuous assessment or exam scores and re-submit."}
            </p>
          </div>
        </div>
      )}

      {overallStatus === "SUBMITTED" && (
        <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 flex items-center gap-3">
          <Clock className="w-5 h-5 text-sky-700 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-sky-900 dark:text-sky-200">
              Results Under Departmental Review
            </p>
            <p className="text-xs text-sky-800 dark:text-sky-300">
              This score sheet has been submitted to your Department Administrator and is locked against further edits.
            </p>
          </div>
        </div>
      )}

      {overallStatus === "APPROVED" && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              Results Approved &amp; Published
            </p>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              These final grades have been verified by the Department Administrator and published to student portals.
            </p>
          </div>
        </div>
      )}

      {/* Performance Summary Strip (Assessment Requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Class Average</span>
              <BarChart2 className="w-4 h-4 text-burgundy-700" />
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {performanceStats.averageScore}
              <span className="text-xs font-normal text-zinc-400 ml-1">/ 100</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Across {performanceStats.scoredCandidates} scored student{performanceStats.scoredCandidates === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Pass Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {performanceStats.passRate}%
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Score &ge; 40 (Grades A &ndash; E)
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Score Range</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {performanceStats.highestScore}
              <span className="text-xs font-normal text-zinc-400 mx-1">/</span>
              <span className="text-zinc-600 dark:text-zinc-400">{performanceStats.lowestScore}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Highest &bull; Lowest marks
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Grade Breakdown</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                A:{performanceStats.gradeCounts.A}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                B:{performanceStats.gradeCounts.B}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                C:{performanceStats.gradeCounts.C}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                D:{performanceStats.gradeCounts.D}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                F:{performanceStats.gradeCounts.F}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">5.0 grading scale</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Score Entry Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Continuous Assessment &amp; Examination Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                CA Max: 40 &bull; Exam Max: 70 &bull; Combined Total Max: 100
              </CardDescription>
            </div>

            {/* Quick Student Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search matric number or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Users className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No Registered Students Found
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No students have completed semester course registration for {course?.code} yet.
              </p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No students matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-semibold">
                    <th className="py-3 px-4 w-10 text-center">#</th>
                    <th className="py-3 px-4">Matric Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 w-32">CA Score (0-40)</th>
                    <th className="py-3 px-4 w-32">Exam Score (0-70)</th>
                    <th className="py-3 px-4 text-center w-24">Total (100)</th>
                    <th className="py-3 px-4 text-center w-20">Grade</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={row.studentId}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-zinc-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {row.matricNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                        {row.studentName}
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min={0}
                          max={40}
                          step={1}
                          value={row.caScore}
                          disabled={isFormLocked}
                          placeholder="0 - 40"
                          onChange={(e) =>
                            handleScoreChange(row.studentId, "caScore", e.target.value)
                          }
                          className="h-8 text-xs font-semibold w-24 focus-visible:ring-burgundy-700"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min={0}
                          max={70}
                          step={1}
                          value={row.examScore}
                          disabled={isFormLocked}
                          placeholder="0 - 70"
                          onChange={(e) =>
                            handleScoreChange(row.studentId, "examScore", e.target.value)
                          }
                          className="h-8 text-xs font-semibold w-24 focus-visible:ring-burgundy-700"
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-sm">
                        <span
                          className={
                            row.totalScore >= 50
                              ? "text-emerald-600 dark:text-emerald-400"
                              : row.totalScore >= 40
                              ? "text-amber-600 dark:text-amber-400"
                              : row.caScore !== "" || row.examScore !== ""
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-zinc-400"
                          }
                        >
                          {row.caScore !== "" || row.examScore !== "" ? row.totalScore : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block w-6 py-0.5 text-center font-bold rounded text-xs ${
                            row.grade === "A"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : row.grade === "B"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                              : row.grade === "C"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : row.grade === "D" || row.grade === "E"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                              : row.grade === "F"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {row.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold"
                        >
                          {row.status || overallStatus}
                        </Badge>
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

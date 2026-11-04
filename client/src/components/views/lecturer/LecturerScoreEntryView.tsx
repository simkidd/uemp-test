"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAssignedCourses,
  useCourseStudents,
  useCourseResults,
  useSaveDraftResults,
  useSubmitResults,
} from "@/hooks/queries";
import { ICourse, ICourseAllocation, IUser, IResult, ResultStatus } from "@/interfaces";
import { toast } from "sonner";
import {
  Save,
  Send,
  ArrowLeft,
  Clock,
  ShieldAlert,
  Loader2,
  Users,
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
      const initialRows: StudentScoreRow[] = studentsList.map((student: IUser) => {
        const existing = existingResults.find((r: IResult) => {
          const sId = typeof r.student === "object" ? r.student._id : r.student;
          return sId === student._id;
        });
        const ca = existing ? existing.caScore : "";
        const exam = existing ? existing.examScore : "";
        const total = (Number(ca) || 0) + (Number(exam) || 0);

        return {
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          matricNumber: student.studentProfile?.matricNumber || "UEMP/Pending",
          caScore: ca,
          examScore: exam,
          totalScore: total,
          grade: existing ? existing.grade : ca !== "" || exam !== "" ? computeGrade(total) : "-",
          status: existing?.status || "DRAFT",
          rejectionRemarks: existing?.rejectionRemarks,
        };
      });

      setRows(initialRows);

      if (existingResults.length > 0) {
        const firstStatus = existingResults[0].status;
        setOverallStatus(firstStatus);
        if (firstStatus === "REJECTED") {
          setRejectionRemarks(existingResults[0].rejectionRemarks || "");
        }
      }
    }
  }, [courseStudentsData, existingResults]);

  const handleScoreChange = (
    index: number,
    field: "caScore" | "examScore",
    val: string,
  ) => {
    const newRows = [...rows];
    const row = { ...newRows[index] };

    if (val === "") {
      row[field] = "";
    } else {
      const num = Number(val);
      if (isNaN(num)) return;

      if (field === "caScore" && (num < 0 || num > 40)) {
        toast.warning("Continuous Assessment (CA) score must be between 0 and 40.");
        return;
      }
      if (field === "examScore" && (num < 0 || num > 70)) {
        toast.warning("Examination score must be between 0 and 70.");
        return;
      }
      row[field] = num;
    }

    const ca = Number(row.caScore) || 0;
    const exam = Number(row.examScore) || 0;
    const total = ca + exam;

    if (total > 100) {
      toast.error(`Combined total cannot exceed 100 (Currently ${total}).`);
      return;
    }

    row.totalScore = total;
    row.grade = row.caScore !== "" || row.examScore !== "" ? computeGrade(total) : "-";
    newRows[index] = row;
    setRows(newRows);
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
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading course roster and scores...</span>
      </div>
    );
  }

  const isMutating = saveDraftMutation.isPending || submitMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-3 text-zinc-500 hover:text-zinc-900">
            <Link href="/lecturer/scores">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Score Sheets
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {course?.code}: {course?.title}
            </h1>
            <Badge
              className={
                overallStatus === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : overallStatus === "SUBMITTED"
                  ? "bg-burgundy-100 text-burgundy-800 border-burgundy-300 dark:bg-burgundy-950 dark:text-burgundy-300"
                  : overallStatus === "REJECTED"
                  ? "bg-rose-100 text-rose-800 border-rose-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }
            >
              {overallStatus}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500">
            {course?.creditUnits} Credit Units &bull; {course?.level} Level &bull; {rows.length} Enrolled Students
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
                className="text-xs font-medium"
              >
                {saveDraftMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
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

      {overallStatus === "REJECTED" && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Submission Returned by Department Admin
            </h4>
            <p className="text-xs text-rose-800 dark:text-rose-300">
              Remarks: {rejectionRemarks || "Please correct the indicated continuous assessment or exam discrepancies and resubmit."}
            </p>
          </div>
        </div>
      )}

      {isFormLocked && (
        <div className="p-4 rounded-xl bg-burgundy-50 dark:bg-burgundy-950/40 border border-burgundy-200 dark:border-burgundy-900 flex items-center gap-3">
          <Clock className="w-5 h-5 text-burgundy-700 shrink-0" />
          <p className="text-xs text-burgundy-900 dark:text-burgundy-200">
            {overallStatus === "SUBMITTED"
              ? "This score sheet has been submitted to the Department Administrator for review and is locked against further edits."
              : "This score sheet has been approved and published to student portals."}
          </p>
        </div>
      )}

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold">Continuous Assessment &amp; Examination Matrix</CardTitle>
              <CardDescription className="text-xs">
                CA Max: 40 &bull; Exam Max: 70 &bull; Combined Total Max: 100
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <Users className="w-4 h-4 text-burgundy-700" />
              <span>{rows.length} Candidates Enrolled</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-semibold">
                  <th className="py-3 px-4">#</th>
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
                {rows.map((row, idx) => (
                  <tr key={row.studentId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                    <td className="py-3 px-4 text-zinc-400">{idx + 1}</td>
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
                        onChange={(e) => handleScoreChange(idx, "caScore", e.target.value)}
                        className="h-8 text-xs font-semibold"
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
                        onChange={(e) => handleScoreChange(idx, "examScore", e.target.value)}
                        className="h-8 text-xs font-semibold"
                      />
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-sm">
                      <span className={row.totalScore >= 50 ? "text-emerald-600" : "text-amber-600"}>
                        {row.totalScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block w-6 py-0.5 text-center font-bold rounded text-xs ${
                          row.grade === "A"
                            ? "bg-emerald-100 text-emerald-800"
                            : row.grade === "B"
                            ? "bg-sky-100 text-sky-800"
                            : row.grade === "C"
                            ? "bg-amber-100 text-amber-800"
                            : row.grade === "D" || row.grade === "E"
                            ? "bg-purple-100 text-purple-800"
                            : row.grade === "F"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {row.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="outline" className="text-[10px]">
                        {row.status || overallStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

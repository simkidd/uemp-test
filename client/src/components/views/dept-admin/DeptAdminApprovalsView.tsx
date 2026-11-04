"use client";

import React, { useMemo, useState } from "react";
import {
  useDeptPendingResults,
  useApproveDeptResults,
  useRejectDeptResults,
} from "@/hooks/queries";
import { ICourse, IStudentScore, IUser } from "@/interfaces";
import { formatRelativeTime } from "@/lib/date";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Search,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubmissionItem {
  _id: string;
  course: ICourse;
  lecturer?: IUser;
  session?: any;
  semester?: any;
  scores: IStudentScore[];
  submittedAt?: string;
}

export function DeptAdminApprovalsView() {
  const { data: list = [], isLoading, refetch } = useDeptPendingResults();
  const approveMutation = useApproveDeptResults();
  const rejectMutation = useRejectDeptResults();

  // Modal review state
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [scoreSearch, setScoreSearch] = useState("");

  const submissions: SubmissionItem[] = useMemo(() => {
    return (list as any[]).map((item: any) => {
      const rawScores: IStudentScore[] = Array.isArray(item.scores)
        ? item.scores
        : item.student
          ? [item]
          : [];

      return {
        _id: item._id,
        course: item.course,
        lecturer: item.lecturer,
        session: item.session,
        semester: item.semester,
        scores: rawScores,
        submittedAt: item.submittedAt || item.updatedAt,
      };
    });
  }, [list]);

  const handleApprove = async (sub: SubmissionItem) => {
    try {
      await approveMutation.mutateAsync(sub._id || sub.course._id);
      toast.success("Results Approved", {
        description: `All ${sub.scores.length} candidate results for ${sub.course.code} have been verified and approved.`,
      });
      setSelectedSubmission(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to approve results";
      toast.error("Approval Failed", { description: errorMsg });
    }
  };

  const handleOpenReject = (sub: SubmissionItem) => {
    setSelectedSubmission(sub);
    setRejectRemarks("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedSubmission) return;
    if (!rejectRemarks.trim()) {
      toast.warning("Remarks Required", {
        description:
          "Please specify the correction reason for returning these scores to the lecturer.",
      });
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        courseId: selectedSubmission._id || selectedSubmission.course._id,
        remarks: rejectRemarks.trim(),
      });

      toast.info("Results Returned", {
        description: `Scores for ${selectedSubmission.course.code} returned to lecturer with correction feedback.`,
      });

      setRejectModalOpen(false);
      setSelectedSubmission(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to reject results";
      toast.error("Rejection Failed", { description: errorMsg });
    }
  };

  const isActionLoading = approveMutation.isPending || rejectMutation.isPending;

  const filteredScores = useMemo(() => {
    if (!selectedSubmission) return [];
    if (!scoreSearch.trim()) return selectedSubmission.scores;

    const query = scoreSearch.toLowerCase().trim();
    return selectedSubmission.scores.filter((s) => {
      const student = s.student as IUser;
      const matric =
        student?.studentProfile?.matricNumber || s.matricNumber || "";
      const name = `${student?.firstName || ""} ${student?.lastName || ""} ${
        student?.otherName || ""
      }`.toLowerCase();
      return matric.toLowerCase().includes(query) || name.includes(query);
    });
  }, [selectedSubmission, scoreSearch]);

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
      case "B":
        return "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300";
      case "C":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
      case "D":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300";
      case "E":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300";
      default:
        return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300";
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading pending approval queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Department Result Approvals
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Audit Continuous Assessment &amp; Examination scores submitted by
            lecturers before official publication to student transcripts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="text-xs shadow-2xs font-medium"
        >
          Refresh Queue
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs py-0 gap-0 overflow-hidden">
          <CardContent className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Approval Queue is Empty
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No course results are currently awaiting departmental sign-off.
                All submitted score sheets have been reviewed.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const candidateCount = sub.scores.length;
            const avgScore =
              candidateCount > 0
                ? (
                    sub.scores.reduce(
                      (acc, r) => acc + (r.totalScore || 0),
                      0,
                    ) / candidateCount
                  ).toFixed(1)
                : "0.0";
            const passCount = sub.scores.filter(
              (r) => (r.totalScore || 0) >= 40,
            ).length;
            const passRate =
              candidateCount > 0
                ? ((passCount / candidateCount) * 100).toFixed(0)
                : "0";

            return (
              <Card
                key={sub._id || sub.course._id}
                className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors py-0 gap-0 overflow-hidden"
              >
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-burgundy-50 dark:bg-burgundy-950/50 text-burgundy-700 dark:text-burgundy-300 font-mono font-bold text-sm shrink-0 border border-burgundy-200 dark:border-burgundy-900">
                        {sub.course.code}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {sub.course.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {sub.course.level} Level &bull;{" "}
                          {sub.course.creditUnit ?? 0} Credit Unit &bull;{" "}
                          <strong className="text-zinc-700 dark:text-zinc-300">
                            {candidateCount} Candidates
                          </strong>
                          {sub.lecturer && (
                            <>
                              {" "}
                              &bull; Examiner: {sub.lecturer.firstName}{" "}
                              {sub.lecturer.lastName}
                            </>
                          )}
                          {sub.submittedAt && (
                            <>
                              {" "}
                              &bull; Submitted{" "}
                              {formatRelativeTime(sub.submittedAt)}
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setScoreSearch("");
                        }}
                        className="text-xs shadow-2xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-burgundy-700" />
                        View Scores
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenReject(sub)}
                        disabled={isActionLoading}
                        className="text-xs font-semibold shadow-2xs"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(sub)}
                        disabled={isActionLoading}
                        className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs"
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        )}
                        Approve &amp; Publish
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-0">
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-100 dark:border-zinc-800/80">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                          Total Candidates:
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {candidateCount} Students
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                          Class Average:
                        </span>
                        <span className="font-semibold text-burgundy-700 dark:text-burgundy-400">
                          {avgScore} / 100
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                          Pass Rate:
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {passRate}% ({passCount}/{candidateCount || 1} Passed)
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                          Audit Status:
                        </span>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-semibold">
                          Pending Sign-off
                        </Badge>
                      </div>
                    </div>

                    {/* Grade Distribution Bar */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-zinc-400 text-[10px] uppercase font-semibold">
                        Grade Breakdown:
                      </span>
                      {["A", "B", "C", "D", "E", "F"].map((grade) => {
                        const count = sub.scores.filter(
                          (s) => s.grade === grade,
                        ).length;
                        return (
                          <span
                            key={grade}
                            className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400"
                          >
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">
                              {grade}
                            </span>
                            : {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Scores Review Modal */}
      {selectedSubmission && (
        <Dialog
          open={!!selectedSubmission}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedSubmission(null);
              setScoreSearch("");
            }
          }}
        >
          <DialogContent className=" sm:w-[92vw] max-w-5xl! max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
            <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-200 dark:border-zinc-800 pr-10 sm:pr-12 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedSubmission.course.code}:{" "}
                      {selectedSubmission.course.title}
                    </DialogTitle>
                    <Badge className="bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300 text-xs font-semibold">
                      {selectedSubmission.scores.length} Candidates
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs">
                    Official score sheet submitted by examiner{" "}
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {selectedSubmission.lecturer?.firstName}{" "}
                      {selectedSubmission.lecturer?.lastName}
                    </strong>{" "}
                    &bull; Review CA and exam scores before granting
                    departmental approval.
                  </DialogDescription>
                </div>

                <div className="relative w-full md:w-64 shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Search candidate or matric..."
                    value={scoreSearch}
                    onChange={(e) => setScoreSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-zinc-50 dark:bg-zinc-900"
                  />
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-auto min-h-0 w-full">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Matric Number</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 text-center">CA (40)</th>
                    <th className="py-2.5 px-3 text-center">Exam (70)</th>
                    <th className="py-2.5 px-3 text-center font-bold">
                      Total (100)
                    </th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredScores.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-zinc-400"
                      >
                        {scoreSearch
                          ? `No candidates matching "${scoreSearch}"`
                          : "No candidate scores recorded for this submission."}
                      </td>
                    </tr>
                  ) : (
                    filteredScores.map((score, i) => {
                      const student = score.student as IUser;
                      const matric =
                        student?.studentProfile?.matricNumber ||
                        score.matricNumber ||
                        "UEMP/Pending";
                      const fullName =
                        student?.firstName || student?.lastName
                          ? `${student.firstName || ""} ${
                              student.lastName || ""
                            } ${student.otherName || ""}`.trim()
                          : score.studentName || "Candidate";

                      return (
                        <tr
                          key={student?._id || score._id || i}
                          className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center text-zinc-400">
                            {i + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-burgundy-800 dark:text-burgundy-400">
                            {matric}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {fullName}
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium text-zinc-700 dark:text-zinc-300">
                            {score.caScore ?? 0}
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium text-zinc-700 dark:text-zinc-300">
                            {score.examScore ?? 0}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-zinc-900 dark:text-zinc-100">
                            {score.totalScore ?? 0}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge
                              variant="outline"
                              className={`text-xs font-bold px-2 py-0.5 border ${getGradeBadge(
                                score.grade,
                              )}`}
                            >
                              {score.grade || "-"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                            {score.gradePoint !== undefined
                              ? score.gradePoint.toFixed(1)
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <DialogFooter className="border-t border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div className="text-xs text-zinc-500 text-center sm:text-left">
                  Auditing:{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {selectedSubmission.scores.length}
                  </strong>{" "}
                  Candidates &bull; Verified 100-Point Grading Scale
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSubmission(null)}
                    className="text-xs font-medium flex-1 sm:flex-none"
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleOpenReject(selectedSubmission)}
                    disabled={isActionLoading}
                    className="text-xs font-semibold shadow-2xs flex-1 sm:flex-none"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject Submission
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(selectedSubmission)}
                    disabled={isActionLoading}
                    className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs w-full sm:w-auto"
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    )}
                    Approve &amp; Publish
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Modal with Remarks */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg p-5 gap-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Return Course Submission
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide feedback for returning scores of{" "}
              <strong>{selectedSubmission?.course.code}</strong> to the course
              lecturer for correction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Rejection Remarks / Correction Instructions:
            </label>
            <textarea
              rows={3}
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="e.g., Continuous assessment scores for candidates 002 and 004 do not match submitted assessment sheets. Please rectify and resubmit."
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 p-2.5 text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-burgundy-600"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={isActionLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              disabled={isActionLoading}
              className="text-xs font-semibold"
            >
              {rejectMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              )}
              Confirm Rejection &amp; Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

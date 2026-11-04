"use client";

import React, { useMemo, useState } from "react";
import {
  useDeptPendingResults,
  useApproveDeptResults,
  useRejectDeptResults,
} from "@/hooks/queries";
import { ICourse, IResult, IUser } from "@/interfaces";
import { formatRelativeTime, formatDateTime } from "@/lib/date";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Users,
  Eye,
  AlertTriangle,
  Loader2,
  CheckCircle2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GroupedSubmission {
  course: ICourse;
  lecturer?: IUser;
  results: IResult[];
  submittedAt?: string;
}

export function DeptAdminApprovalsView() {
  const { data: list = [], isLoading, refetch } = useDeptPendingResults();
  const approveMutation = useApproveDeptResults();
  const rejectMutation = useRejectDeptResults();

  // Modal review state
  const [selectedSubmission, setSelectedSubmission] =
    useState<GroupedSubmission | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const submissions = useMemo(() => {
    const map = new Map<string, GroupedSubmission>();
    list.forEach((item) => {
      const cId = item.course._id || (item.course as unknown as string);
      if (!map.has(cId)) {
        map.set(cId, {
          course: item.course,
          results: [],
          submittedAt: item.updatedAt,
        });
      }
      map.get(cId)!.results.push(item);
    });
    return Array.from(map.values());
  }, [list]);

  const handleApprove = async (sub: GroupedSubmission) => {
    try {
      await approveMutation.mutateAsync(sub.course._id);
      toast.success("Results Approved", {
        description: `All ${sub.results.length} result grades for ${sub.course.code} have been verified and approved.`,
      });
      setSelectedSubmission(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to approve results";
      toast.error("Approval Failed", { description: errorMsg });
    }
  };

  const handleOpenReject = (sub: GroupedSubmission) => {
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
        courseId: selectedSubmission.course._id,
        remarks: rejectRemarks.trim(),
      });

      toast.info("Results Returned", {
        description: `Scores for ${selectedSubmission.course.code} returned to lecturer with remarks.`,
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
            lecturers before publication to student transcripts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="text-xs"
        >
          Refresh Queue
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
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
          {submissions.map((sub) => (
            <Card
              key={sub.course._id}
              className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 transition-colors"
            >
              <CardHeader className="pb-3">
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
                        {sub.course.level} Level &bull; {sub.course.creditUnit ?? 0}{" "}
                        Units &bull; {sub.results.length} Candidates Submitted
                        {sub.submittedAt && (
                          <> &bull; Submitted {formatRelativeTime(sub.submittedAt)}</>
                        )}
                      </CardDescription>


                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSubmission(sub)}
                      className="text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View Scores
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenReject(sub)}
                      disabled={isActionLoading}
                      className="text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(sub)}
                      disabled={isActionLoading}
                      className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs"
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

              <CardContent className="pt-0">
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">
                        Total Candidates:
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {sub.results.length} Students
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">
                        Average Total Score:
                      </span>
                      <span className="font-semibold text-burgundy-700 dark:text-burgundy-400">
                        {(
                          sub.results.reduce(
                            (acc, r) => acc + (r.totalScore || 0),
                            0,
                          ) / (sub.results.length || 1)
                        ).toFixed(1)}{" "}
                        / 100
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">
                        Pass Rate:
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {(
                          (sub.results.filter((r) => r.totalScore >= 40)
                            .length /
                            (sub.results.length || 1)) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">
                        Status:
                      </span>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px]">
                        Pending Sign-off
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <Dialog
          open={!!selectedSubmission}
          onOpenChange={() => setSelectedSubmission(null)}
        >
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold">
                  {selectedSubmission.course.code}:{" "}
                  {selectedSubmission.course.title}
                </DialogTitle>
                <Badge className="bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300 text-[10px]">
                  {selectedSubmission.results.length} Students
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Review scores recorded by the course examiner before approving
                or rejecting.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Matric Number</th>
                    <th className="py-2 px-2">Student Name</th>
                    <th className="py-2 px-2 text-center">CA (40)</th>
                    <th className="py-2 px-2 text-center">Exam (70)</th>
                    <th className="py-2 px-2 text-center">Total (100)</th>
                    <th className="py-2 px-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {selectedSubmission.results.map((res, i) => {
                    const student = res.student as IUser;
                    return (
                      <tr key={res._id || i}>
                        <td className="py-2 px-2 text-zinc-400">{i + 1}</td>
                        <td className="py-2 px-2 font-mono font-bold">
                          {student?.studentProfile?.matricNumber ||
                            "UEMP/Pending"}
                        </td>
                        <td className="py-2 px-2">
                          {student?.firstName} {student?.lastName}
                        </td>
                        <td className="py-2 px-2 text-center font-medium">
                          {res.caScore}
                        </td>
                        <td className="py-2 px-2 text-center font-medium">
                          {res.examScore}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-burgundy-700">
                          {res.totalScore}
                        </td>
                        <td className="py-2 px-2 text-center font-bold">
                          {res.grade}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <DialogFooter className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubmission(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleOpenReject(selectedSubmission)}
                disabled={isActionLoading}
                className="text-xs"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Reject Submission
              </Button>
              <Button
                size="sm"
                onClick={() => handleApprove(selectedSubmission)}
                disabled={isActionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              >
                {isActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                )}
                Approve &amp; Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Modal with Remarks */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Return Course Submission
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide feedback for returning scores of{" "}
              {selectedSubmission?.course.code} to the course lecturer.
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

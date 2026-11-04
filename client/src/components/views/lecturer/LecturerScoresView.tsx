"use client";

import React from "react";
import Link from "next/link";
import { useAssignedCourses } from "@/hooks/queries";
import {
  FileSpreadsheet,
  ArrowRight,
  Loader2,
  BookOpen,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LecturerScoresView() {
  const { data: allocations = [], isLoading } = useAssignedCourses();

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs font-medium">Loading assigned score sheets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Score Entry Sheets
          </h1>
          <Badge
            variant="outline"
            className="text-xs font-semibold text-burgundy-700 border-burgundy-200 dark:text-burgundy-300 dark:border-burgundy-900"
          >
            {allocations.length} Assigned Course{allocations.length === 1 ? "" : "s"}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Record Continuous Assessment (CA) and Examination marks, save drafts, and submit finalized scores for departmental review.
        </p>
      </div>

      {allocations.length === 0 ? (
        <Card className="border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No Score Sheets Available
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You do not currently have any active course allocations for grading. Please contact your Department Administrator.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allocations.map((item) => {
            const course = item.course;
            const status = item.resultStatus || "NOT_STARTED";
            const isApproved = status === "APPROVED";
            const isSubmitted = status === "SUBMITTED";
            const isRejected = status === "REJECTED";

            return (
              <Card
                key={item._id}
                className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/60 dark:text-burgundy-300 border border-burgundy-200 dark:border-burgundy-900">
                      {course?.code}
                    </span>
                    <Badge
                      className={`text-[10px] font-semibold ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                          : isSubmitted
                          ? "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300"
                          : isRejected
                          ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                          : status === "DRAFT"
                          ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {isSubmitted
                        ? "UNDER REVIEW"
                        : isRejected
                        ? "REVISION NEEDED"
                        : isApproved
                        ? "PUBLISHED"
                        : status === "NOT_STARTED"
                        ? "NOT STARTED"
                        : status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold mt-2 text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {course?.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {course?.level} Level &bull; {course?.semester} &bull; {course?.creditUnit} Unit{course?.creditUnit === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {isRejected && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-md border border-rose-200 dark:border-rose-900">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1 font-medium">
                        Returned: {item.rejectionReason || "Check administrator remarks"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-zinc-500 py-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      {item.enrolledCount ?? 0} Enrolled Candidates
                    </span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      CA: 40 &bull; Exam: 70
                    </span>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs"
                  >
                    <Link href={`/lecturer/scores/${course?._id}`}>
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                      {isApproved
                        ? "View Approved Scores"
                        : isSubmitted
                        ? "View Submitted Sheet"
                        : "Enter Student Scores"}
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

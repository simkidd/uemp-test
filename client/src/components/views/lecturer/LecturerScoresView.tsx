"use client";

import React from "react";
import Link from "next/link";
import { useAssignedCourses } from "@/hooks/queries";
import {
  FileSpreadsheet,
  ArrowRight,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LecturerScoresView() {
  const { data: allocations = [], isLoading } = useAssignedCourses();

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading assigned course roster...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Score Entry Sheets
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Select an assigned course to record continuous assessment (CA) and examination marks.
        </p>
      </div>

      {allocations.length === 0 ? (
        <Card className="border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No Score Sheets Available
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You do not currently have any active course allocations for grading.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allocations.map((item) => (
            <Card
              key={item._id}
              className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/60 dark:text-burgundy-300 border border-burgundy-200 dark:border-burgundy-900">
                    {item.course?.code}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {item.course?.creditUnit} Units
                  </Badge>

                </div>
                <CardTitle className="text-base font-bold mt-2 text-zinc-900 dark:text-zinc-100">
                  {item.course?.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {item.course?.level} Level &bull; {item.course?.semester} Semester
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between text-xs text-zinc-500 py-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Grading Scheme:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    CA (0-40) + Exam (0-70) = Max 100
                  </span>
                </div>

                <Button
                  asChild
                  className="w-full bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs"
                >
                  <Link href={`/lecturer/scores/${item.course?._id}`}>
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                    Enter Student Scores
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

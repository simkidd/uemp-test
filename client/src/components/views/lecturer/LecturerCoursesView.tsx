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

export function LecturerCoursesView() {
  const { data: allocations = [], isLoading } = useAssignedCourses();

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading teaching allocations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Assigned Courses &amp; Classes
            </h1>
            <Badge variant="outline" className="text-xs font-semibold text-burgundy-700 border-burgundy-200 dark:text-burgundy-300 dark:border-burgundy-900">
              {allocations.length} Courses
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Teaching duties assigned by the Department Administrator for the current semester.
          </p>
        </div>
      </div>

      {allocations.length === 0 ? (
        <Card className="border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No Teaching Allocations
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You do not currently have any courses allocated for instruction. Please consult your Department Administrator.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allocations.map((item) => {
            const course = item.course;
            return (
              <Card
                key={item._id}
                className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/60 dark:text-burgundy-300 border border-burgundy-200 dark:border-burgundy-900">
                      {course.code}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {course.creditUnits} Units
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold mt-2 text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {course.description || "Core departmental course syllabus."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 py-2 border-y border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Academic Level:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {course.level} Level
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Semester:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {course.semester}
                      </span>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs"
                  >
                    <Link href={`/lecturer/scores/${course._id}`}>
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                      Open Score Sheet
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

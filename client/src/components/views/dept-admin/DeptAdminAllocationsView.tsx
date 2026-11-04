"use client";

import React, { useState } from "react";
import {
  useDeptAllocations,
  useDeptCourses,
  useDeptLecturers,
  useCreateDeptAllocation,
  useRemoveDeptAllocation,
} from "@/hooks/queries";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function DeptAdminAllocationsView() {
  const { data: allocations = [], isLoading: loadingAlloc } = useDeptAllocations();
  const { data: courses = [], isLoading: loadingCourses } = useDeptCourses();
  const { data: lecturers = [], isLoading: loadingLecturers } = useDeptLecturers();

  const createMutation = useCreateDeptAllocation();
  const removeMutation = useRemoveDeptAllocation();

  // New allocation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLecturerId, setSelectedLecturerId] = useState("");

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedLecturerId) {
      toast.warning("Incomplete Selection", {
        description: "Please choose both a course and an assigned lecturer.",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        courseId: selectedCourseId,
        lecturerId: selectedLecturerId,
      });

      toast.success("Course Allocated", {
        description: "Teaching duties assigned successfully.",
      });

      setIsModalOpen(false);
      setSelectedCourseId("");
      setSelectedLecturerId("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to assign course";
      toast.error("Allocation Failed", { description: errorMsg });
    }
  };

  const handleRemoveAllocation = async (id: string, courseCode: string) => {
    if (!confirm(`Are you sure you want to de-allocate teaching duties for ${courseCode}?`)) {
      return;
    }

    try {
      await removeMutation.mutateAsync(id);
      toast.success("Allocation Removed", {
        description: `Teaching assignment for ${courseCode} removed.`,
      });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to remove allocation";
      toast.error("Action Failed", { description: errorMsg });
    }
  };

  const isLoading = loadingAlloc || loadingCourses || loadingLecturers;

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading course allocations and academic staff...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Department Course Allocations
            </h1>
            <Badge className="bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300">
              {allocations.length} Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Designate primary instructors and examiners for departmental courses.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Assign Course to Lecturer
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-base font-bold">Current Teaching Assignments</CardTitle>
          <CardDescription className="text-xs">
            Assigned lecturers gain exclusive privileges to record continuous assessments and submit final scores.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {allocations.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No courses allocated yet. Click &apos;Assign Course to Lecturer&apos; to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-semibold">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Credit Units</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Assigned Lecturer</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {allocations.map((alloc, idx) => (
                    <tr key={alloc._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-4 text-zinc-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-burgundy-700 dark:text-burgundy-400">
                        {alloc.course?.code}
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                        {alloc.course?.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          {alloc.course?.creditUnit ?? 0} {alloc.course?.creditUnit === 1 ? "Unit" : "Units"}
                        </span>
                      </td>

                      <td className="py-3 px-4">{alloc.course?.level}L</td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-burgundy-100 dark:bg-burgundy-950 text-burgundy-700 dark:text-burgundy-300 flex items-center justify-center font-bold text-[10px]">
                            {alloc.lecturer?.firstName?.[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                              {alloc.lecturer?.firstName} {alloc.lecturer?.lastName}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {alloc.lecturer?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAllocation(alloc._id, alloc.course?.code)}
                          className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Revoke Assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateAllocation}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-burgundy-700" />
                Assign Course Instructor
              </DialogTitle>
              <DialogDescription className="text-xs">
                Select a department course and link it to an authorized academic lecturer.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Select Course</Label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  required
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.title} ({c.creditUnit} Units, {c.level}L)
                    </option>
                  ))}


                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Select Lecturer</Label>
                <select
                  value={selectedLecturerId}
                  onChange={(e) => setSelectedLecturerId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  required
                >
                  <option value="">-- Choose Academic Staff --</option>
                  {lecturers.map((lec) => (
                    <option key={lec._id} value={lec._id}>
                      {lec.firstName} {lec.lastName} ({lec.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={createMutation.isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs"
              >
                {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                Confirm Allocation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

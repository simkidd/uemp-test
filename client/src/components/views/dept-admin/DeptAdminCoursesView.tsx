"use client";

import React, { useState } from "react";
import { useDeptCourses, useCreateDeptCourse } from "@/hooks/queries";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function DeptAdminCoursesView() {
  const { data: courses = [], isLoading } = useDeptCourses();
  const createMutation = useCreateDeptCourse();

  const [search, setSearch] = useState("");

  // Create course modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [creditUnits, setCreditUnits] = useState(3);
  const [level, setLevel] = useState<100 | 200 | 300 | 400 | 500 | 600>(100);
  const [semester, setSemester] = useState<"First Semester" | "Second Semester">("First Semester");
  const [isElective, setIsElective] = useState(false);
  const [description, setDescription] = useState("");

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) {
      toast.warning("Missing Fields", { description: "Course code and title are required." });
      return;
    }

    try {
      await createMutation.mutateAsync({
        code: code.trim().toUpperCase(),
        title: title.trim(),
        creditUnits: Number(creditUnits),
        level: level,
        semester,
        isElective,
        description: description.trim(),
      });

      toast.success("Course Created", {
        description: `${code.toUpperCase()} added to curriculum catalog.`,
      });

      setIsModalOpen(false);
      setCode("");
      setTitle("");
      setDescription("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create course";
      toast.error("Creation Failed", { description: errorMsg });
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading departmental course catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Department Course Catalog
            </h2>
            <Badge className="bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300">
              {courses.length} Courses
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Curriculum course specifications, credit unit weighting, and syllabus definitions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Department Course
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by course code or title..."
          className="pl-9 h-9 text-xs max-w-md"
        />
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-base font-bold">Curriculum Offerings</CardTitle>
          <CardDescription className="text-xs">
            Showing {filteredCourses.length} of {courses.length} departmental courses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No courses found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-semibold">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 text-center">Credit Units</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredCourses.map((c, idx) => (
                    <tr key={c._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-4 text-zinc-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-burgundy-700 dark:text-burgundy-400">
                        {c.code}
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                        {c.title}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{c.creditUnits} Units</td>
                      <td className="py-3 px-4">{c.level} Level</td>
                      <td className="py-3 px-4">{c.semester}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                          {c.isElective ? "Elective" : "Core"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Course Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateCourse}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-burgundy-700" />
                Add Department Course
              </DialogTitle>
              <DialogDescription className="text-xs">
                Define a new undergraduate course to include in registration slips and score matrices.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Course Code</Label>
                  <Input
                    placeholder="e.g. CSC 401"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Credit Units</Label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={creditUnits}
                    onChange={(e) => setCreditUnits(Number(e.target.value))}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Course Title</Label>
                <Input
                  placeholder="e.g. Artificial Intelligence and Expert Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Academic Level</Label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value) as 100 | 200 | 300 | 400 | 500 | 600)}
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  >
                    <option value={100}>100 Level</option>
                    <option value={200}>200 Level</option>
                    <option value={300}>300 Level</option>
                    <option value={400}>400 Level</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Semester</Label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as "First Semester" | "Second Semester")}
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  >
                    <option value="First Semester">First Semester</option>
                    <option value="Second Semester">Second Semester</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Course Description</Label>
                <Input
                  placeholder="Overview of syllabus, prerequisites, and learning objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-8 text-xs"
                />
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
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs"
              >
                {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                Create Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

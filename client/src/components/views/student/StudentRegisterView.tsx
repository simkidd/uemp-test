"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  useRegisteredCourses,
  useAvailableCourses,
  STUDENT_QUERY_KEYS,
} from "@/hooks/queries";
import { studentApi } from "@/lib/api";
import { ICourse } from "@/interfaces";
import { COURSE_REGISTRATION_LIMITS } from "@/constants";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle2,
  Printer,
  AlertCircle,
  Loader2,
  GraduationCap,
  Search,
  Lock,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { A4DocumentModal } from "@/components/common/A4DocumentModal";

export function StudentRegisterView() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: regData, isLoading: loadingReg } = useRegisteredCourses();
  const { data: availData, isLoading: loadingAvail } = useAvailableCourses();
  const loading = loadingReg || loadingAvail;

  const registration = regData || availData?.existingRegistration || null;
  const availableCourses = availData?.availableCourses || [];
  const sessionInfo = {
    sessionName: availData?.activeSession?.name,
    semesterName: availData?.activeSemester?.name,
    isOpen: availData?.isRegistrationOpen,
  };

  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (registration?.courses && selectedCourseIds.length === 0) {
      setSelectedCourseIds(
        registration.courses.map((c: any) =>
          typeof c.course === "object" ? c.course._id : c.course
        )
      );
    }
  }, [registration]);

  const getCourseUnits = (c: ICourse) => c.creditUnit ?? c.creditUnits ?? 0;

  const totalSelectedUnits = availableCourses
    .filter((c) => selectedCourseIds.includes(c._id))
    .reduce((sum, c) => sum + getCourseUnits(c), 0);

  const isMinMet = totalSelectedUnits >= COURSE_REGISTRATION_LIMITS.MIN_UNITS;
  const isMaxExceeded = totalSelectedUnits > COURSE_REGISTRATION_LIMITS.MAX_UNITS;
  const isValidRange = isMinMet && !isMaxExceeded;

  const handleToggleCourse = (courseId: string) => {
    if (registration) {
      toast.info("Registration is already finalized for this semester.");
      return;
    }
    if (selectedCourseIds.includes(courseId)) {
      setSelectedCourseIds(selectedCourseIds.filter((id) => id !== courseId));
    } else {
      setSelectedCourseIds([...selectedCourseIds, courseId]);
    }
  };

  const registerMutation = useMutation({
    mutationFn: (courseIds: string[]) => studentApi.registerCourses(courseIds),
    onSuccess: (regResult) => {
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
      setShowConfirmModal(false);
      toast.success("Course Registration Submitted Successfully!", {
        description: `Total registered units: ${regResult.totalCreditUnits ?? regResult.totalUnits ?? totalSelectedUnits}`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Registration Failed", {
        description: (err as Error).message || "Could not register courses.",
      });
    },
  });

  const submitting = registerMutation.isPending;

  const handleConfirmSubmit = () => {
    if (!isValidRange) {
      toast.error(
        `Course registration must be between ${COURSE_REGISTRATION_LIMITS.MIN_UNITS} and ${COURSE_REGISTRATION_LIMITS.MAX_UNITS} credit units.`
      );
      return;
    }

    registerMutation.mutate(selectedCourseIds);
  };

  const handlePrintSlip = () => {
    setIsPrintModalOpen(true);
  };

  const filteredCourses = availableCourses.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-7 h-7 animate-spin text-burgundy-700" />
        <span className="text-sm font-medium">Loading course registration catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Course Registration
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Credit Unit Range: {COURSE_REGISTRATION_LIMITS.MIN_UNITS} &ndash; {COURSE_REGISTRATION_LIMITS.MAX_UNITS} Units
            {sessionInfo.sessionName ? ` \u2022 ${sessionInfo.sessionName}` : ""}
            {sessionInfo.semesterName ? ` \u2022 ${sessionInfo.semesterName}` : ""}
          </p>
        </div>

        {registration && (
          <Button
            onClick={handlePrintSlip}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 shadow-2xs font-semibold text-xs"
          >
            <Printer className="w-4 h-4 text-burgundy-700" />
            Print Registration Slip
          </Button>
        )}
      </div>

      {/* Registration Status Banner */}
      {sessionInfo.isOpen === false && !registration && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Registration Window Closed</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Course registration is currently closed. Contact your Department Administrator for approval.
            </p>
          </div>
        </div>
      )}

      {/* Credit Units Indicator */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-burgundy-700" />
                Credit Unit Load
              </span>
              <p className="text-xs text-zinc-500">
                Minimum: {COURSE_REGISTRATION_LIMITS.MIN_UNITS} Units &bull; Maximum: {COURSE_REGISTRATION_LIMITS.MAX_UNITS} Units
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-left sm:text-right">
                <div className="text-2xl font-extrabold text-burgundy-700 dark:text-burgundy-400">
                  {totalSelectedUnits}
                  <span className="text-xs font-normal text-zinc-500 ml-1">/ 24 Units</span>
                </div>
                <div className="text-[11px] font-medium">
                  {isMaxExceeded ? (
                    <span className="text-destructive font-semibold">
                      Exceeds limit by {totalSelectedUnits - 24} units
                    </span>
                  ) : !isMinMet ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {12 - totalSelectedUnits} more units required to reach minimum
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 sm:justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid Credit Load Range
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Progress
              value={Math.min(100, (totalSelectedUnits / 24) * 100)}
              className="h-2.5 bg-burgundy-200/50 dark:bg-burgundy-950"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>0 Units</span>
              <span className="font-semibold text-burgundy-700 dark:text-burgundy-400">12 Units (Min)</span>
              <span>24 Units (Max)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmed Registration Banner */}
      {registration && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Official Semester Registration Confirmed</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                You have officially registered {registration.totalCreditUnits ?? registration.totalUnits} credit units for this semester. Courses are locked against duplicate registration.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 w-fit">
            <Lock className="w-3 h-3 mr-1" />
            Finalized &amp; Locked
          </Badge>
        </div>
      )}

      {/* Available Courses Table Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">
                {registration ? "Registered Course List" : "Available Department Courses"}
              </CardTitle>
              <CardDescription className="text-xs">
                {registration
                  ? "Courses locked for your current academic session and semester."
                  : "Check the courses you wish to register for this semester. Click rows to select."}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Filter courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-zinc-50/50 dark:bg-zinc-950/50"
                />
              </div>

              {!registration && (
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={!isValidRange || submitting || sessionInfo.isOpen === false}
                  className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold shadow-xs text-xs h-8"
                >
                  <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                  Submit Registration ({totalSelectedUnits} Units)
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="py-2.5 px-3 w-10 text-center">Select</th>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3 text-center">Credit Units</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Semester</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-zinc-400">
                      No matching courses found in the catalogue.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => {
                    const isSelected = selectedCourseIds.includes(course._id);
                    const units = getCourseUnits(course);
                    return (
                      <tr
                        key={course._id}
                        onClick={() => !registration && handleToggleCourse(course._id)}
                        className={`transition-colors ${
                          !registration ? "cursor-pointer" : ""
                        } ${
                          isSelected
                            ? "bg-burgundy-50/60 dark:bg-burgundy-950/30"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                        }`}
                      >
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            disabled={!!registration || sessionInfo.isOpen === false}
                            checked={isSelected}
                            onChange={() => handleToggleCourse(course._id)}
                            className="w-4 h-4 rounded text-burgundy-700 focus:ring-burgundy-600 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-burgundy-700 dark:text-burgundy-400">
                          {course.code}
                        </td>
                        <td className="py-3 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                          {course.title}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-zinc-800 dark:text-zinc-200">
                          {units}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              course.isElective
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                : "bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300"
                            }`}
                          >
                            {course.isElective ? "Elective" : "Core"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-500">{course.semester}</td>
                        <td className="py-3 px-3 text-right">
                          {isSelected ? (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {registration ? "Registered" : "Selected"}
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-[11px]">Available</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* A4 Document Modal Preview for Registration Slip */}
      {registration && (
        <A4DocumentModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Official Course Registration Slip (CRF)"
          subtitle={`${sessionInfo.sessionName || "2025/2026 Session"} • ${sessionInfo.semesterName || "First Semester"}`}
        >
          {/* Institutional Crest & Letterhead */}
          <div className="text-center border-b border-zinc-300 pb-5 space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-burgundy-700 text-white mb-2 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black tracking-tight uppercase text-zinc-900">
              LEAD WEB PRAXIS UNIVERSITY (UEMP)
            </h3>
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              OFFICE OF THE REGISTRAR &bull; ACADEMIC AFFAIRS DIVISION
            </p>
            <div className="pt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider border border-zinc-300">
                OFFICIAL SEMESTER COURSE REGISTRATION FORM
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
              <span className="text-zinc-500 font-medium">Department &amp; Programme:</span>
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
              <span className="text-zinc-500 font-medium">Academic Session:</span>
              <p className="font-semibold text-zinc-800">
                {sessionInfo.sessionName || "2025/2026 Session"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Semester:</span>
              <p className="font-semibold text-zinc-800">
                {sessionInfo.semesterName || "First Semester"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Total Credit Load:</span>
              <p className="font-bold text-emerald-700 text-sm">
                {registration.totalCreditUnits ?? registration.totalUnits} Units Registered
              </p>
            </div>
          </div>

          {/* Registered Courses Table */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 border-b border-zinc-200 font-bold text-zinc-700">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">S/N</th>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3 text-center">Units</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {registration.courses && registration.courses.length > 0 ? (
                  registration.courses.map((item: any, idx: number) => {
                    const c = typeof item.course === "object" ? item.course : item;
                    return (
                      <tr key={c._id || idx}>
                        <td className="py-2 px-3 text-center text-zinc-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-burgundy-800">{c.code}</td>
                        <td className="py-2 px-3 font-medium text-zinc-900">{c.title}</td>
                        <td className="py-2 px-3 text-center font-bold">
                          {c.creditUnit ?? c.creditUnits ?? item.creditUnit}
                        </td>
                        <td className="py-2 px-3 text-zinc-600">{c.isElective ? "Elective" : "Core"}</td>
                        <td className="py-2 px-3 text-right text-emerald-700 font-semibold">
                          Confirmed
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-zinc-500">
                      No courses recorded on registration slip.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Institutional Attestation & Signature Lines */}
          <div className="pt-6 border-t border-zinc-300 space-y-6">
            <p className="text-[11px] text-zinc-500 italic text-center">
              I hereby certify that the courses registered above are strictly in compliance with my departmental degree requirements and credit load guidelines.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-xs text-zinc-700">
              <div className="text-center space-y-2">
                <div className="border-b border-zinc-400 h-8 flex items-end justify-center font-serif italic text-sm text-zinc-800">
                  {user?.firstName} {user?.lastName}
                </div>
                <span className="font-semibold block">Student&apos;s Signature &amp; Date</span>
              </div>

              <div className="text-center space-y-2">
                <div className="border-b border-zinc-400 h-8" />
                <span className="font-semibold block">Course Advisor&apos;s Signature &amp; Date</span>
              </div>

              <div className="text-center space-y-2">
                <div className="border-b border-zinc-400 h-8" />
                <span className="font-semibold block">Head of Department (HOD) Signature &amp; Date</span>
              </div>
            </div>
          </div>
        </A4DocumentModal>
      )}

      {/* Confirmation Modal Before Submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-burgundy-100 dark:bg-burgundy-950 flex items-center justify-center text-burgundy-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Confirm Course Registration?
                </h3>
                <p className="text-xs text-zinc-500">Total Credit Load: {totalSelectedUnits} Units</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">Important University Policy:</span> Once submitted, your course registration is permanently recorded for this semester and duplicate registrations are strictly prohibited.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                Go Back &amp; Edit
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Yes, Submit & Lock Registration"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

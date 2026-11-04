"use client";

import React, { useState, useMemo } from "react";
import {
  useAdminSessions,
  useAdminSemesters,
  useCreateSession,
  useSetCurrentSession,
  useSetCurrentSemester,
  useToggleRegistrationWindow,
} from "@/hooks/queries";
import { ISession, ISemester } from "@/interfaces";
import { formatDateRange } from "@/lib/date";
import { toast } from "sonner";
import {
  Calendar,
  Plus,
  Lock,
  Unlock,
  Loader2,
  CalendarRange,
  GraduationCap,
  Search,
  Radio,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Action Confirmation Type
type ConfirmAction =
  | {
      type: "SET_SESSION";
      session: ISession;
      newStatus: boolean;
    }
  | {
      type: "SET_SEMESTER";
      semester: ISemester;
      sessionName?: string;
    }
  | {
      type: "TOGGLE_REGISTRATION";
      semesterId: string;
      semesterName: string;
      currentStatus: boolean;
    }
  | null;

// Segmented Active Term Selector for Table Rows
function ActiveTermSelector({
  firstSemester,
  secondSemester,
  session,
  onRequestSetActive,
  isSettingActive,
}: {
  firstSemester?: ISemester;
  secondSemester?: ISemester;
  session: ISession;
  onRequestSetActive: (sem: ISemester, sessionName: string) => void;
  isSettingActive: boolean;
}) {
  const isFirstActive = Boolean(firstSemester?.isCurrent);
  const isSecondActive = Boolean(secondSemester?.isCurrent);

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-zinc-800 gap-1">
      {/* First Semester Segment */}
      {firstSemester ? (
        <button
          type="button"
          onClick={() => {
            if (!isFirstActive) onRequestSetActive(firstSemester, session.name);
          }}
          disabled={isSettingActive || isFirstActive}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            isFirstActive
              ? "bg-burgundy-700 text-white shadow-2xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/70 dark:hover:bg-zinc-800/70 cursor-pointer"
          }`}
          title={isFirstActive ? "Currently active term" : "Switch to First Semester"}
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span>First Semester</span>
          {isFirstActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>
      ) : (
        <span className="text-[10px] text-zinc-400 px-2 italic">1st Term</span>
      )}

      {/* Second Semester Segment */}
      {secondSemester ? (
        <button
          type="button"
          onClick={() => {
            if (!isSecondActive) onRequestSetActive(secondSemester, session.name);
          }}
          disabled={isSettingActive || isSecondActive}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            isSecondActive
              ? "bg-burgundy-700 text-white shadow-2xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/70 dark:hover:bg-zinc-800/70 cursor-pointer"
          }`}
          title={isSecondActive ? "Currently active term" : "Switch to Second Semester"}
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span>Second Semester</span>
          {isSecondActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>
      ) : (
        <span className="text-[10px] text-zinc-400 px-2 italic">2nd Term</span>
      )}
    </div>
  );
}

export function AdminAcademicView() {
  const { data: sessions = [], isLoading: loadingSessions } =
    useAdminSessions();
  const { data: semesters = [], isLoading: loadingSemesters } =
    useAdminSemesters();

  const createSessionMutation = useCreateSession();
  const setCurrentSessionMutation = useSetCurrentSession();
  const setCurrentSemesterMutation = useSetCurrentSemester();
  const toggleRegMutation = useToggleRegistrationWindow();

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Confirmation modal state for sensitive operations
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmAction>(null);

  // Create session modal state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState("2026/2027");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2027-07-31");
  const [isCurrentSession, setIsCurrentSession] = useState(false);

  // Operational Context computation
  const activeSession = useMemo(
    () => sessions.find((s: ISession) => s.isCurrent),
    [sessions],
  );

  const activeSemester = useMemo(
    () => semesters.find((s: ISemester) => s.isCurrent),
    [semesters],
  );

  // Helper to format semester name
  const formatSemesterName = (name: string) => {
    if (name === "FIRST") return "First Semester";
    if (name === "SECOND") return "Second Semester";
    return name;
  };

  // Group semesters by session ID
  const semestersBySession = useMemo(() => {
    const map = new Map<string, ISemester[]>();
    semesters.forEach((sem: ISemester) => {
      const sessId =
        typeof sem.session === "object" && sem.session !== null
          ? sem.session._id
          : (sem.session as string);
      if (sessId) {
        const list = map.get(sessId) || [];
        list.push(sem);
        map.set(sessId, list);
      }
    });
    return map;
  }, [semesters]);

  // Filtered sessions (current active first, then chronological)
  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sorted = [...sessions].sort((a: ISession, b: ISession) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return b.name.localeCompare(a.name);
    });

    if (!query) return sorted;
    return sorted.filter((s: ISession) =>
      s.name.toLowerCase().includes(query),
    );
  }, [sessions, searchQuery]);

  // Handler: Request toggle session active status
  const requestToggleSession = (session: ISession, newStatus: boolean) => {
    setPendingConfirm({
      type: "SET_SESSION",
      session,
      newStatus,
    });
  };

  // Handler: Request set current semester
  const requestSetCurrentSemester = (
    semester: ISemester,
    sessionName?: string,
  ) => {
    if (semester.isCurrent) return;
    setPendingConfirm({
      type: "SET_SEMESTER",
      semester,
      sessionName,
    });
  };

  // Handler: Request toggle course registration window (used by Command Hero)
  const requestToggleRegistration = (
    semesterId: string,
    semesterName: string,
    currentStatus: boolean,
  ) => {
    setPendingConfirm({
      type: "TOGGLE_REGISTRATION",
      semesterId,
      semesterName,
      currentStatus,
    });
  };

  // Handler: Execute Confirmed Action
  const handleExecuteConfirmedAction = async () => {
    if (!pendingConfirm) return;

    if (pendingConfirm.type === "SET_SESSION") {
      try {
        await setCurrentSessionMutation.mutateAsync({
          id: pendingConfirm.session._id,
          isCurrent: pendingConfirm.newStatus,
        });
        toast.success(
          pendingConfirm.newStatus
            ? "Operational Session Activated"
            : "Academic Session Deactivated",
          {
            description: pendingConfirm.newStatus
              ? `${pendingConfirm.session.name} is now the university's active operational session.`
              : `${pendingConfirm.session.name} has been set to inactive.`,
          },
        );
        setPendingConfirm(null);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to update session status";
        toast.error("Action Failed", { description: errorMsg });
      }
    } else if (pendingConfirm.type === "SET_SEMESTER") {
      try {
        await setCurrentSemesterMutation.mutateAsync(
          pendingConfirm.semester._id,
        );
        const displayTitle = formatSemesterName(pendingConfirm.semester.name);
        toast.success("Active Term Updated", {
          description: `${displayTitle} is now the active operational semester.`,
        });
        setPendingConfirm(null);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to activate semester";
        toast.error("Action Failed", { description: errorMsg });
      }
    } else if (pendingConfirm.type === "TOGGLE_REGISTRATION") {
      try {
        await toggleRegMutation.mutateAsync({
          semesterId: pendingConfirm.semesterId,
          registrationOpen: !pendingConfirm.currentStatus,
        });
        toast.success("Registration Window Updated", {
          description: !pendingConfirm.currentStatus
            ? `Course registration is now OPEN for ${pendingConfirm.semesterName}.`
            : `Course registration is now CLOSED for ${pendingConfirm.semesterName}.`,
        });
        setPendingConfirm(null);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to update registration status";
        toast.error("Action Failed", { description: errorMsg });
      }
    }
  };

  // Handler: Create Session (First & Second Semesters auto-provisioned by backend)
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSessionMutation.mutateAsync({
        name: sessionName.trim(),
        startDate,
        endDate,
        isCurrent: isCurrentSession,
      });

      toast.success("Academic Session Created", {
        description: `Session ${sessionName} added with First & Second Semesters auto-configured.`,
      });

      setIsSessionModalOpen(false);
      setSessionName("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create academic session";
      toast.error("Creation Failed", { description: errorMsg });
    }
  };

  const isExecutingConfirm =
    setCurrentSessionMutation.isPending ||
    setCurrentSemesterMutation.isPending ||
    toggleRegMutation.isPending;

  const isLoading = loadingSessions || loadingSemesters;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-7 h-7 animate-spin text-burgundy-700" />
        <span className="text-xs font-medium">
          Loading institutional academic calendar...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Academic Operations &amp; Calendar
            </h1>
            <Badge className="bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/60 dark:text-burgundy-300 border-burgundy-200 dark:border-burgundy-900">
              Term Control
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Govern academic session lifecycles, active semester terms, and
            student course registration access.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSessionName("2026/2027");
              setStartDate("2026-10-01");
              setEndDate("2027-07-31");
              setIsCurrentSession(false);
              setIsSessionModalOpen(true);
            }}
            className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Academic Session
          </Button>
        </div>
      </div>

      {/* ================= COMMAND CENTER HERO: LIVE OPERATIONAL CONTEXT ================= */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden py-0 gap-0">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-burgundy-950 text-white relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Operational Overview */}
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CalendarRange className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-burgundy-200 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Live Institutional Context
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px]">
                    Active Academic Term
                  </Badge>
                </div>

                <div className="mt-1 flex items-baseline gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {activeSession ? activeSession.name : "No Session Active"}
                  </h2>
                  <span className="text-zinc-300 text-sm">&bull;</span>
                  <span className="text-lg font-semibold text-zinc-100">
                    {activeSemester
                      ? formatSemesterName(activeSemester.name)
                      : "No Semester Active"}
                  </span>
                </div>

                <p className="text-xs text-zinc-200/90 mt-1 max-w-xl">
                  {activeSession &&
                  (activeSession.startDate || activeSession.endDate)
                    ? `Operational cycle: ${formatDateRange(
                        activeSession.startDate,
                        activeSession.endDate,
                      )}. This active state governs student course registration, result approval pipelines, and fee assessments.`
                    : "The active session and semester dictate portal-wide access across departments, courses, and fee schedules."}
                </p>
              </div>
            </div>

            {/* Right: Registration Window Dedicated Controller */}
            {activeSemester && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:min-w-[340px]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {activeSemester.registrationOpen ? (
                      <Unlock className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-300" />
                    )}
                    <span className="text-xs font-bold text-white">
                      Course Registration Window
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-200">
                    {activeSemester.registrationOpen
                      ? "Enrolment is active for students"
                      : "Window is currently locked"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      activeSemester.registrationOpen
                        ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/30 text-[10px]"
                        : "bg-amber-500/30 text-amber-200 border-amber-400/30 text-[10px]"
                    }
                  >
                    {activeSemester.registrationOpen ? "Open" : "Closed"}
                  </Badge>

                  <Switch
                    checked={Boolean(activeSemester.registrationOpen)}
                    onCheckedChange={() =>
                      requestToggleRegistration(
                        activeSemester._id,
                        formatSemesterName(activeSemester.name),
                        Boolean(activeSemester.registrationOpen),
                      )
                    }
                    disabled={isExecutingConfirm}
                    aria-label="Toggle student registration"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Micro stats strip */}
          <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-6 text-xs text-zinc-200 flex-wrap">
            <div>
              <span className="text-[11px] text-zinc-300 block">
                Total Sessions
              </span>
              <strong className="text-base text-white">
                {sessions.length}
              </strong>
            </div>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div>
              <span className="text-[11px] text-zinc-300 block">
                Total Semesters
              </span>
              <strong className="text-base text-white">
                {semesters.length}
              </strong>
            </div>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div>
              <span className="text-[11px] text-zinc-300 block">
                Active Term Registration
              </span>
              <strong className="text-base text-white">
                {activeSemester?.registrationOpen ? "Unlocked" : "Locked"}
              </strong>
            </div>
          </div>
        </div>
      </Card>

      {/* ================= OPTION A COMPACT TABLE: SESSIONS WITH DURATION & ACTIVE TERM ================= */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs py-0 gap-0 overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-burgundy-50 dark:bg-burgundy-950/60 text-burgundy-700 dark:text-burgundy-300 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Academic Sessions &amp; Terms Directory
                </CardTitle>
                <CardDescription className="text-xs">
                  Institutional academic sessions, operational calendar durations,
                  and active semester term selectors.
                </CardDescription>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search session year (e.g. 2026)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-zinc-50/50 dark:bg-zinc-900/50"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredSessions.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <p>
                {searchQuery
                  ? "No academic sessions match your search query."
                  : "No academic sessions configured in the calendar yet."}
              </p>
              <Button
                size="sm"
                onClick={() => setIsSessionModalOpen(true)}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add First Session
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 text-zinc-500 font-semibold select-none">
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-4 min-w-[150px]">Academic Session</th>
                    <th className="py-3 px-4 min-w-[190px]">Operational Period</th>
                    <th className="py-3 px-4 min-w-[310px]">Active Term</th>
                    <th className="py-3 px-4 text-right min-w-[130px]">
                      Session Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredSessions.map((sess: ISession, idx: number) => {
                    const sessionSemesters =
                      semestersBySession.get(sess._id) || [];

                    const firstSemester = sessionSemesters.find(
                      (s) => s.name === "FIRST" || s.name === "First Semester",
                    );
                    const secondSemester = sessionSemesters.find(
                      (s) =>
                        s.name === "SECOND" || s.name === "Second Semester",
                    );

                    const isCurrent = sess.isCurrent;

                    return (
                      <tr
                        key={sess._id}
                        className={`transition-colors ${
                          isCurrent
                            ? "bg-burgundy-50/30 dark:bg-burgundy-950/20"
                            : "hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40"
                        }`}
                      >
                        {/* Index */}
                        <td className="py-3.5 px-3 text-center text-zinc-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Session Name */}
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          <div className="flex items-center gap-2">
                            <span>{sess.name}</span>
                            {isCurrent && (
                              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[9px] py-0 px-1.5 font-semibold">
                                Current
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Operational Period / Duration Column */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                          {formatDateRange(sess.startDate, sess.endDate)}
                        </td>

                        {/* Active Term Segmented Selector Column */}
                        <td className="py-3.5 px-4">
                          <ActiveTermSelector
                            firstSemester={firstSemester}
                            secondSemester={secondSemester}
                            session={sess}
                            onRequestSetActive={requestSetCurrentSemester}
                            isSettingActive={
                              setCurrentSemesterMutation.isPending
                            }
                          />
                        </td>

                        {/* Session Status Toggle Switch */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <span
                              className={`text-[11px] font-semibold ${
                                isCurrent
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-zinc-400"
                              }`}
                            >
                              {isCurrent ? "Active" : "Inactive"}
                            </span>
                            <Switch
                              checked={isCurrent}
                              onCheckedChange={(nextVal) =>
                                requestToggleSession(sess, nextVal)
                              }
                              disabled={setCurrentSessionMutation.isPending}
                              size="sm"
                              aria-label={`Toggle active state for ${sess.name}`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= SENSITIVE ACTION CONFIRMATION MODAL ================= */}
      <Dialog
        open={Boolean(pendingConfirm)}
        onOpenChange={(open) => !open && !isExecutingConfirm && setPendingConfirm(null)}
      >
        <DialogContent className="sm:max-w-md">
          {pendingConfirm && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      pendingConfirm.type === "TOGGLE_REGISTRATION"
                        ? pendingConfirm.currentStatus
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-burgundy-100 text-burgundy-700 dark:bg-burgundy-950/60 dark:text-burgundy-300"
                    }`}
                  >
                    {pendingConfirm.type === "TOGGLE_REGISTRATION" ? (
                      pendingConfirm.currentStatus ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Unlock className="w-5 h-5" />
                      )
                    ) : pendingConfirm.type === "SET_SESSION" ? (
                      <Calendar className="w-5 h-5" />
                    ) : (
                      <GraduationCap className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <DialogTitle className="text-base font-bold">
                      {pendingConfirm.type === "SET_SESSION" &&
                        (pendingConfirm.newStatus
                          ? "Activate Academic Session?"
                          : "Deactivate Academic Session?")}
                      {pendingConfirm.type === "SET_SEMESTER" &&
                        "Activate Semester Term?"}
                      {pendingConfirm.type === "TOGGLE_REGISTRATION" &&
                        (pendingConfirm.currentStatus
                          ? "Close Course Registration Window?"
                          : "Open Course Registration Window?")}
                    </DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">
                      Confirming this sensitive action impacts portal-wide
                      operations.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-3">
                {pendingConfirm.type === "SET_SESSION" && (
                  <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                    {pendingConfirm.newStatus ? (
                      <>
                        <p>
                          You are about to promote{" "}
                          <strong className="text-zinc-900 dark:text-zinc-100 font-bold font-mono">
                            {pendingConfirm.session.name}
                          </strong>{" "}
                          to the university&apos;s current operational session.
                        </p>
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                          <span>
                            Student course registrations, grade submissions, and fee
                            schedules portal-wide will immediately transition to
                            this academic year.
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>
                          Are you sure you want to <strong>deactivate</strong>{" "}
                          <strong className="text-zinc-900 dark:text-zinc-100 font-bold font-mono">
                            {pendingConfirm.session.name}
                          </strong>
                          ?
                        </p>
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                          <span>
                            Portal services and student course registration require an active
                            academic session to operate. Proceeding will set this session as
                            inactive until another session is activated.
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {pendingConfirm.type === "SET_SEMESTER" && (
                  <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                    <p>
                      You are about to activate{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                        {formatSemesterName(pendingConfirm.semester.name)}
                      </strong>{" "}
                      {pendingConfirm.sessionName ? (
                        <>
                          for the{" "}
                          <span className="font-mono font-semibold">
                            {pendingConfirm.sessionName}
                          </span>{" "}
                          session
                        </>
                      ) : (
                        ""
                      )}
                      .
                    </p>
                    <div className="p-3 rounded-xl bg-burgundy-50 dark:bg-burgundy-950/40 border border-burgundy-200 dark:border-burgundy-900/50 text-[11px] text-burgundy-800 dark:text-burgundy-300 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-burgundy-600 dark:text-burgundy-400" />
                      <span>
                        All faculties and students will now operate under this
                        term. Course enrollment records and lecturer grade sheets
                        will anchor to this semester.
                      </span>
                    </div>
                  </div>
                )}

                {pendingConfirm.type === "TOGGLE_REGISTRATION" && (
                  <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                    {pendingConfirm.currentStatus ? (
                      <>
                        <p>
                          Are you sure you want to <strong>lock and close</strong>{" "}
                          the course registration window for{" "}
                          <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                            {pendingConfirm.semesterName}
                          </strong>
                          ?
                        </p>
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                          <span>
                            Students will immediately be blocked from
                            registering, altering, or submitting new course forms
                            for this term.
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>
                          Are you sure you want to <strong>open</strong> the
                          course registration window for{" "}
                          <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                            {pendingConfirm.semesterName}
                          </strong>
                          ?
                        </p>
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                          <Unlock className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            All enrolled students will immediately be allowed to
                            pick courses, confirm credit units, and submit
                            enrollment cards online.
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingConfirm(null)}
                  disabled={isExecutingConfirm}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleExecuteConfirmedAction}
                  disabled={isExecutingConfirm}
                  className={`text-xs font-semibold shadow-xs ${
                    pendingConfirm.type === "TOGGLE_REGISTRATION" &&
                    !pendingConfirm.currentStatus
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-burgundy-700 hover:bg-burgundy-800 text-white"
                  }`}
                >
                  {isExecutingConfirm && (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  )}
                  {pendingConfirm.type === "SET_SESSION" &&
                    (pendingConfirm.newStatus
                      ? "Confirm & Activate Session"
                      : "Confirm & Deactivate Session")}
                  {pendingConfirm.type === "SET_SEMESTER" &&
                    "Confirm & Activate Semester"}
                  {pendingConfirm.type === "TOGGLE_REGISTRATION" &&
                    (pendingConfirm.currentStatus
                      ? "Confirm & Close Window"
                      : "Confirm & Open Window")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: ADD ACADEMIC SESSION ================= */}
      <Dialog
        open={isSessionModalOpen}
        onOpenChange={setIsSessionModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateSession}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-burgundy-700" />
                Add Academic Session
              </DialogTitle>
              <DialogDescription className="text-xs">
                Register a new academic calendar operational year. First and
                Second Semesters will be automatically provisioned.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Session Name</Label>
                <Input
                  placeholder="e.g. 2026/2027"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  required
                  className="h-8 text-xs font-mono"
                />
                <p className="text-[11px] text-zinc-400">
                  Standard format: YYYY/YYYY (e.g. 2026/2027)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="sess-is-current"
                    className="text-xs font-semibold cursor-pointer block"
                  >
                    Set as Current Operational Session
                  </Label>
                  <p className="text-[11px] text-zinc-500">
                    Will make this session and its First Semester active across
                    all portal modules.
                  </p>
                </div>
                <Switch
                  id="sess-is-current"
                  checked={isCurrentSession}
                  onCheckedChange={setIsCurrentSession}
                />
              </div>

              <div className="p-3 rounded-xl bg-burgundy-50/60 dark:bg-burgundy-950/30 border border-burgundy-200 dark:border-burgundy-900/50 text-[11px] text-burgundy-800 dark:text-burgundy-300 space-y-1">
                <span className="font-semibold block">
                  Automatic Semester Provisioning:
                </span>
                <p>
                  &bull; <strong>First Semester</strong> and{" "}
                  <strong>Second Semester</strong> will be auto-created with
                  course registration <strong>closed</strong>. You can open the
                  registration window whenever the university is ready.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSessionModalOpen(false)}
                disabled={createSessionMutation.isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createSessionMutation.isPending}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs"
              >
                {createSessionMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                )}
                Save Academic Session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useAdminUsers,
  useAdminDepartments,
  useCreateAdminUser,
  useUpdateUserStatus,
  useResetUserPassword,
} from "@/hooks/queries";
import { IUser, UserRole, UserStatus, IDepartment } from "@/interfaces";
import { ROLE_LABELS } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  BookOpen,
  Building2,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Sparkles,
  Calendar,
  Mail,
  Phone,
  Hash,
  X,
  Shield,
  School,
  Lock,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Switch } from "@/components/ui/switch";

const isUserActive = (u?: IUser | null): boolean => {
  if (!u) return false;
  if (u.isActive !== undefined) return Boolean(u.isActive);
  return u.status === "ACTIVE";
};

const getUserStaffId = (u?: IUser | null): string | undefined => {
  if (!u) return undefined;
  return u.lecturerProfile?.staffId || u.staffProfile?.staffId;
};

const getUserDesignation = (u?: IUser | null): string | undefined => {
  if (!u) return undefined;
  return (
    u.lecturerProfile?.designation ||
    u.lecturerProfile?.title ||
    u.staffProfile?.designation
  );
};

export function AdminUsersView() {
  const { data: departments = [], isLoading: loadingDepts } =
    useAdminDepartments();
  const currentUser = useAuthStore((s) => s.user);

  const createUserMutation = useCreateAdminUser();
  const updateStatusMutation = useUpdateUserStatus();
  const resetPasswordMutation = useResetUserPassword();

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "ALL"
    | "STUDENT"
    | "LECTURER"
    | "DEPARTMENT_ADMIN"
    | "SUPER_ADMIN"
    | "SUSPENDED"
  >("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Construct server-side query params for useAdminUsers
  const queryParams = useMemo(() => {
    const params: {
      role?: UserRole;
      department?: string;
      search?: string;
      status?: string;
      limit?: number;
    } = { limit: 100 };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (activeTab === "SUSPENDED") {
      params.status = "SUSPENDED";
    } else if (activeTab !== "ALL") {
      params.role = activeTab as UserRole;
    }
    if (departmentFilter !== "ALL") {
      params.department = departmentFilter;
    }
    if (statusFilter !== "ALL" && activeTab !== "SUSPENDED") {
      params.status = statusFilter;
    }
    return params;
  }, [debouncedSearch, activeTab, departmentFilter, statusFilter]);

  const { data: usersData, isLoading: loadingUsers } =
    useAdminUsers(queryParams);
  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  // Selection & Slide-Over Drawer
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  // Status Confirmation Dialog State
  const [pendingStatusUser, setPendingStatusUser] = useState<IUser | null>(
    null,
  );
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createRole, setCreateRole] = useState<UserRole>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Uemp@2026!Sec");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [level, setLevel] = useState<number>(100);
  const [staffId, setStaffId] = useState("");
  const [isHOD, setIsHOD] = useState(false);
  const [designation, setDesignation] = useState("Lecturer II");

  // Reset Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<IUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Helper to copy to clipboard
  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success("Copied to Clipboard", {
      description: `${label}: "${text}" copied.`,
    });
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Helper to generate secure password
  const generateRandomPassword = () => {
    const chars =
      "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%&*";
    let pwd = "Uemp@";
    for (let i = 0; i < 7; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleGenerateCreatePassword = () => {
    const pwd = generateRandomPassword();
    setPassword(pwd);
    toast.info("Password Generated", {
      description: "A secure temporary password was created.",
    });
  };

  const handleGenerateResetPassword = () => {
    const pwd = generateRandomPassword();
    setNewPassword(pwd);
    toast.info("Password Generated", {
      description: "A secure new password was created.",
    });
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    activeTab !== "ALL" ||
    departmentFilter !== "ALL" ||
    statusFilter !== "ALL";

  const clearAllFilters = () => {
    setSearch("");
    setActiveTab("ALL");
    setDepartmentFilter("ALL");
    setStatusFilter("ALL");
  };

  // Status Toggle Flow with Confirmation
  const promptToggleStatus = (user: IUser) => {
    if (
      currentUser &&
      (currentUser._id === user._id || currentUser.email === user.email)
    ) {
      toast.error("Action Prohibited", {
        description: "You cannot modify the status of your own account.",
      });
      return;
    }
    if (user.role === "SUPER_ADMIN") {
      toast.error("Action Prohibited", {
        description:
          "Super Administrator accounts are root system accounts and cannot be suspended.",
      });
      return;
    }
    setPendingStatusUser(user);
    setIsStatusConfirmOpen(true);
  };

  const handleExecuteStatusToggle = async () => {
    if (!pendingStatusUser) return;
    const currentlyActive = isUserActive(pendingStatusUser);
    const nextActive = !currentlyActive;
    const nextStatus: UserStatus = nextActive ? "ACTIVE" : "SUSPENDED";

    try {
      await updateStatusMutation.mutateAsync({
        userId: pendingStatusUser._id,
        status: nextStatus,
      });

      toast.success("Account Status Updated", {
        description: `${pendingStatusUser.firstName} ${pendingStatusUser.lastName} is now ${nextActive ? "activated" : "suspended"}.`,
      });

      // Update selectedUser if open in drawer
      if (selectedUser?._id === pendingStatusUser._id) {
        setSelectedUser({
          ...selectedUser,
          isActive: nextActive,
          status: nextStatus,
        });
      }

      setIsStatusConfirmOpen(false);
      setPendingStatusUser(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update status";
      toast.error("Action Failed", { description: errorMsg });
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserMutation.mutateAsync({
        email,
        password,
        firstName,
        lastName,
        role: createRole,
        department: departmentId || undefined,
        studentProfile:
          createRole === "STUDENT" ? { matricNumber, level } : undefined,
        staffProfile:
          createRole === "LECTURER" || createRole === "DEPARTMENT_ADMIN"
            ? { staffId, designation, isHOD }
            : undefined,
      });

      toast.success("Account Provisioned", {
        description: `New ${ROLE_LABELS[createRole] || createRole} account created for ${firstName} ${lastName}.`,
      });

      setCreateModalOpen(false);
      resetCreateForm();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create user";
      toast.error("Creation Failed", { description: errorMsg });
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser || !newPassword) return;

    try {
      await resetPasswordMutation.mutateAsync({
        userId: targetUser._id,
        newPassword,
      });

      toast.success("Password Updated", {
        description: `New password credential committed for ${targetUser.email}`,
      });

      setResetModalOpen(false);
      setTargetUser(null);
      setNewPassword("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to reset password";
      toast.error("Reset Failed", { description: errorMsg });
    }
  };

  const resetCreateForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("Uemp@2026!Sec");
    setCreateRole("STUDENT");
    setDepartmentId("");
    setMatricNumber("");
    setLevel(100);
    setStaffId("");
    setIsHOD(false);
    setDesignation("Lecturer II");
  };

  // User Row Inspection
  const handleInspectUser = (user: IUser) => {
    setSelectedUser(user);
    setIsProfileSheetOpen(true);
  };

  // Helpers for visual presentation
  const getAvatarUrl = (user: IUser): string | undefined => {
    if (!user.avatar) return undefined;
    if (typeof user.avatar === "string") return user.avatar;
    return user.avatar.url;
  };

  const getInitials = (user: IUser): string => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <Badge
            variant="outline"
            className="border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 gap-1 font-semibold text-[11px]"
          >
            <ShieldCheck className="w-3 h-3" />
            Super Admin
          </Badge>
        );
      case "DEPARTMENT_ADMIN":
        return (
          <Badge
            variant="outline"
            className="border-burgundy-300 dark:border-burgundy-800 bg-burgundy-50 dark:bg-burgundy-950/40 text-burgundy-700 dark:text-burgundy-300 gap-1 font-semibold text-[11px]"
          >
            <Building2 className="w-3 h-3" />
            Dept Admin
          </Badge>
        );
      case "LECTURER":
        return (
          <Badge
            variant="outline"
            className="border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 gap-1 font-semibold text-[11px]"
          >
            <BookOpen className="w-3 h-3" />
            Lecturer
          </Badge>
        );
      case "STUDENT":
      default:
        return (
          <Badge
            variant="outline"
            className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 gap-1 font-semibold text-[11px]"
          >
            <GraduationCap className="w-3 h-3" />
            Student
          </Badge>
        );
    }
  };

  const getAvatarBg = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
      case "DEPARTMENT_ADMIN":
        return "bg-burgundy-100 text-burgundy-700 dark:bg-burgundy-950 dark:text-burgundy-300";
      case "LECTURER":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
      case "STUDENT":
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const isLoading = loadingUsers || loadingDepts;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-7 h-7 animate-spin text-burgundy-700" />
        <span className="text-xs font-medium">
          Loading user directory &amp; access controls...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              User Directory &amp; RBAC
            </h2>
            <Badge className="bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300 font-semibold">
              {pagination?.totalItems ?? users.length} Accounts
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Provision institutional identities, monitor authentication status,
            and administer role-based privileges.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Create New User
        </Button>
      </div>

      {/* Segmented Role Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === "ALL"
              ? "bg-burgundy-700 text-white shadow-2xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Users</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("STUDENT")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === "STUDENT"
              ? "bg-burgundy-700 text-white shadow-2xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Undergraduate Students</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LECTURER")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === "LECTURER"
              ? "bg-burgundy-700 text-white shadow-2xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Lecturers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DEPARTMENT_ADMIN")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === "DEPARTMENT_ADMIN"
              ? "bg-burgundy-700 text-white shadow-2xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Department Admins</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SUPER_ADMIN")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === "SUPER_ADMIN"
              ? "bg-burgundy-700 text-white shadow-2xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admins</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SUSPENDED")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ml-auto ${
            activeTab === "SUSPENDED"
              ? "bg-burgundy-700 text-white shadow-2xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Suspended</span>
        </button>
      </div>

      {/* Search & Multi-Faceted Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, matriculation number, or staff ID..."
            className="pl-9 pr-8 h-9 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Department Filter */}
          <div className="relative flex-1 sm:w-56">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 text-xs bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-burgundy-600 appearance-none pr-8 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="CENTRAL">Central / Unassigned</option>
              {departments.map((d: IDepartment) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            <Building2 className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative w-36">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 text-xs bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-burgundy-600 appearance-none pr-8 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="SUSPENDED">Suspended Only</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-9 px-2.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Directory Card & Modern Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden py-0 gap-0">
        <CardHeader className="py-3.5 px-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Institutional User Accounts
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Displaying {users.length} accounts
              {pagination?.totalItems !== undefined &&
              pagination.totalItems > users.length
                ? ` of ${pagination.totalItems} total`
                : ""}
              {hasActiveFilters && " (Filtered)"}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
              Click any user row to view complete academic profile
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
              <Users className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                No matching accounts found
              </span>
              <p className="text-[11px] max-w-sm text-zinc-400">
                No user records matched your search query or filter selection.
                Try adjusting your search keywords or clearing active filters.
              </p>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllFilters}
                  className="mt-2 text-xs"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 text-zinc-500 font-semibold">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">User &amp; Identity</th>
                    <th className="py-3 px-4">Role &amp; Academic Scope</th>
                    <th className="py-3 px-4">Identifier / Matric</th>
                    <th className="py-3 px-4">Department &amp; Faculty</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {users.map((u: IUser, idx: number) => {
                    const avatarUrl = getAvatarUrl(u);
                    const initials = getInitials(u);
                    const activeState = isUserActive(u);
                    const staffIdValue = getUserStaffId(u);
                    const designationValue = getUserDesignation(u);
                    const isSelf = Boolean(
                      currentUser &&
                      (currentUser._id === u._id ||
                        currentUser.email === u.email),
                    );
                    const isSuperAdmin = u.role === "SUPER_ADMIN";
                    const isDeptAdmin =
                      currentUser?.role === "DEPARTMENT_ADMIN";
                    const canToggleStatus =
                      !isSelf &&
                      !isSuperAdmin &&
                      (!isDeptAdmin ||
                        (u.role !== "SUPER_ADMIN" &&
                          u.role !== "DEPARTMENT_ADMIN"));

                    return (
                      <tr
                        key={u._id}
                        onClick={() => handleInspectUser(u)}
                        className={`group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer ${
                          !activeState
                            ? "bg-rose-50/15 dark:bg-rose-950/10"
                            : ""
                        }`}
                      >
                        {/* Number */}
                        <td className="py-3.5 px-4 text-center text-zinc-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar size="default" className="w-8 h-8 shrink-0">
                              {avatarUrl && (
                                <AvatarImage
                                  src={avatarUrl}
                                  alt={u.firstName}
                                />
                              )}
                              <AvatarFallback
                                className={`font-bold text-xs ${getAvatarBg(u.role)}`}
                              >
                                {initials}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-burgundy-700 dark:group-hover:text-burgundy-400 transition-colors block truncate">
                                {u.firstName} {u.lastName}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-mono block truncate">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role & Academic Scope */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div>{getRoleBadge(u.role)}</div>
                            <div className="text-[11px] text-zinc-500">
                              {u.role === "STUDENT" && u.studentProfile ? (
                                <span>
                                  {u.studentProfile.level}L &bull;{" "}
                                  {typeof u.studentProfile.programme ===
                                  "object"
                                    ? u.studentProfile.programme?.code
                                    : "Undergraduate"}
                                </span>
                              ) : u.role === "LECTURER" ? (
                                <span>
                                  {designationValue || "Lecturer"}
                                  {Boolean(
                                    (
                                      u.lecturerProfile as
                                        | { isHOD?: boolean }
                                        | undefined
                                    )?.isHOD ||
                                    (
                                      u.staffProfile as
                                        | { isHOD?: boolean }
                                        | undefined
                                    )?.isHOD,
                                  ) && (
                                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold ml-1">
                                      &bull; HOD
                                    </strong>
                                  )}
                                </span>
                              ) : u.role === "DEPARTMENT_ADMIN" ? (
                                <span>Department Operations</span>
                              ) : (
                                <span>System Operations</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Identifier / Matric */}
                        <td className="py-3.5 px-4 font-mono font-medium text-zinc-800 dark:text-zinc-200">
                          {u.studentProfile?.matricNumber ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">
                              {u.studentProfile.matricNumber}
                            </span>
                          ) : staffIdValue ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">
                              {staffIdValue}
                            </span>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>

                        {/* Department & Faculty */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 block">
                              {u.department?.name || "Central Administration"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              {u.faculty?.name ||
                                (u.department
                                  ? "Faculty Assigned"
                                  : "Institution Wide")}
                            </span>
                          </div>
                        </td>

                        {/* Account Status Toggle Switch */}
                        <td
                          className="py-3.5 px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isSuperAdmin ? (
                            <div
                              className="flex items-center gap-1.5"
                              title="Root system accounts cannot be suspended"
                            >
                              <Badge
                                variant="outline"
                                className="border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-[11px] gap-1"
                              >
                                <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                Protected
                              </Badge>
                              {isSelf && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 font-medium"
                                >
                                  You
                                </Badge>
                              )}
                            </div>
                          ) : isSelf ? (
                            <div
                              className="flex items-center gap-2"
                              title="You cannot modify the status of your own account"
                            >
                              <Switch
                                checked={activeState}
                                disabled
                                size="sm"
                                aria-label="Cannot modify own account status"
                              />
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 font-medium"
                              >
                                You
                              </Badge>
                            </div>
                          ) : !canToggleStatus ? (
                            <div
                              className="flex items-center gap-2"
                              title="Status modification restricted"
                            >
                              <Switch
                                checked={activeState}
                                disabled
                                size="sm"
                                aria-label="Status modification restricted"
                              />
                              <span className="text-[11px] text-zinc-400 font-medium">
                                {activeState ? "Active" : "Suspended"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={activeState}
                                onCheckedChange={() => promptToggleStatus(u)}
                                disabled={updateStatusMutation.isPending}
                                size="sm"
                                aria-label={`Toggle active status for ${u.firstName} ${u.lastName}`}
                              />
                              <span
                                className={`text-[11px] font-semibold ${
                                  activeState
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : "text-zinc-400"
                                }`}
                              >
                                {activeState ? "Active" : "Suspended"}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleInspectUser(u)}
                              title="Inspect Full Profile"
                              className="h-7 w-7 text-zinc-400 hover:text-burgundy-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
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

      {/* Slide-Over Profile Drawer (Sheet) */}
      <Sheet open={isProfileSheetOpen} onOpenChange={setIsProfileSheetOpen}>
        <SheetContent className="sm:max-w-md! w-full overflow-y-auto p-6">
          {selectedUser && (
            <div className="space-y-6">
              <SheetHeader className="p-0 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-start gap-3.5">
                  <Avatar size="lg" className="w-14 h-14 shrink-0 rounded-2xl">
                    {getAvatarUrl(selectedUser) && (
                      <AvatarImage
                        src={getAvatarUrl(selectedUser)}
                        alt={selectedUser.firstName}
                      />
                    )}
                    <AvatarFallback
                      className={`text-base font-bold rounded-2xl ${getAvatarBg(selectedUser.role)}`}
                    >
                      {getInitials(selectedUser)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1 min-w-0 flex-1">
                    <SheetTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {selectedUser.firstName} {selectedUser.otherName || ""}{" "}
                      {selectedUser.lastName}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-zinc-500 font-mono truncate flex items-center gap-1.5">
                      <span>{selectedUser.email}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedUser.email, "Email")}
                        className="text-zinc-400 hover:text-zinc-600"
                        title="Copy email address"
                      >
                        {copiedText === "Email" ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </SheetDescription>

                    <div className="flex items-center gap-2 pt-1">
                      {getRoleBadge(selectedUser.role)}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedUser.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedUser.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              {/* Academic & Identity Profile Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Academic &amp; Institutional Profile
                </span>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {selectedUser.role === "STUDENT" &&
                    selectedUser.studentProfile && (
                      <>
                        <div className="p-3 flex items-center justify-between">
                          <span className="text-zinc-500">
                            Matriculation Number
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                              {selectedUser.studentProfile.matricNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  selectedUser.studentProfile!.matricNumber,
                                  "Matric Number",
                                )
                              }
                              className="text-zinc-400 hover:text-zinc-600"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 flex items-center justify-between">
                          <span className="text-zinc-500">Academic Level</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {selectedUser.studentProfile.level} Level
                          </span>
                        </div>

                        {selectedUser.studentProfile.programme && (
                          <div className="p-3 flex items-center justify-between">
                            <span className="text-zinc-500">
                              Degree Programme
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                              {typeof selectedUser.studentProfile.programme ===
                              "object"
                                ? selectedUser.studentProfile.programme.name
                                : selectedUser.studentProfile.programme}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                  {(selectedUser.role === "LECTURER" ||
                    selectedUser.role === "DEPARTMENT_ADMIN") && (
                    <>
                      {getUserStaffId(selectedUser) && (
                        <div className="p-3 flex items-center justify-between">
                          <span className="text-zinc-500">Staff ID</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                              {getUserStaffId(selectedUser)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  getUserStaffId(selectedUser)!,
                                  "Staff ID",
                                )
                              }
                              className="text-zinc-400 hover:text-zinc-600"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {getUserDesignation(selectedUser) && (
                        <div className="p-3 flex items-center justify-between">
                          <span className="text-zinc-500">Designation</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {getUserDesignation(selectedUser)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-zinc-500">Assigned Department</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                      {selectedUser.department?.name ||
                        "Central Administration"}
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="text-zinc-500">Faculty</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                      {selectedUser.faculty?.name || "Institutional"}
                    </span>
                  </div>

                  {selectedUser.phone && (
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-zinc-500">Contact Telephone</span>
                      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {selectedUser.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Timestamps */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Account Audit History
                </span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Provisioned Date:
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Last Account Update:
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formatDate(selectedUser.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Drawer Fast Actions Panel */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Administrative Actions
                </span>

                {Boolean(
                  currentUser &&
                  (currentUser._id === selectedUser._id ||
                    currentUser.email === selectedUser.email),
                ) ? (
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 text-center">
                    This is your active session account. Credentials and status
                    can be updated from your Personal Account Settings.
                  </div>
                ) : selectedUser.role === "SUPER_ADMIN" ? (
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-xs text-purple-700 dark:text-purple-300 text-center flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>
                      Protected Root Administrator. Status and credentials
                      cannot be modified from the directory drawer.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTargetUser(selectedUser);
                        setNewPassword("");
                        setResetModalOpen(true);
                      }}
                      className="text-xs h-9 justify-center gap-1.5 font-semibold"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      Reset Password
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => promptToggleStatus(selectedUser)}
                      className={`text-xs h-9 justify-center gap-1.5 font-semibold ${
                        isUserActive(selectedUser)
                          ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200"
                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-200"
                      }`}
                    >
                      {isUserActive(selectedUser) ? (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          Suspend Account
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          Reinstate Account
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Modal for Suspend / Reinstate */}
      <ConfirmationModal
        isOpen={isStatusConfirmOpen}
        onClose={() => {
          setIsStatusConfirmOpen(false);
          setPendingStatusUser(null);
        }}
        onConfirm={handleExecuteStatusToggle}
        isLoading={updateStatusMutation.isPending}
        title={
          isUserActive(pendingStatusUser)
            ? `Suspend Account for ${pendingStatusUser?.firstName} ${pendingStatusUser?.lastName}?`
            : `Reactivate Account for ${pendingStatusUser?.firstName} ${pendingStatusUser?.lastName}?`
        }
        description={
          isUserActive(pendingStatusUser)
            ? "Suspending this user will immediately revoke login access to the portal, block course registration, and restrict academic operations until reactivated."
            : "Reactivating this user will restore their full role permissions, allowing them to sign into the portal and resume academic activities."
        }
        confirmText={
          isUserActive(pendingStatusUser)
            ? "Confirm Suspension"
            : "Reactivate Account"
        }
        cancelText="Cancel"
        variant={isUserActive(pendingStatusUser) ? "destructive" : "default"}
        icon={isUserActive(pendingStatusUser) ? AlertTriangle : CheckCircle2}
      />

      {/* Create User Modal (Enhanced Option A) */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateUser}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-burgundy-700" />
                Provision Institutional Account
              </DialogTitle>
              <DialogDescription className="text-xs">
                Create a verified credential for an undergraduate student,
                academic lecturer, or institutional administrator.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Role Picker Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Account Role
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateRole("STUDENT")}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      createRole === "STUDENT"
                        ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold block">Student</span>
                    <span className="text-[10px] text-zinc-500 leading-tight">
                      Undergraduate
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateRole("LECTURER")}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      createRole === "LECTURER"
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold block">Lecturer</span>
                    <span className="text-[10px] text-zinc-500 leading-tight">
                      Academic Staff
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateRole("DEPARTMENT_ADMIN")}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      createRole === "DEPARTMENT_ADMIN"
                        ? "border-burgundy-600 bg-burgundy-50/60 dark:bg-burgundy-950/40 text-burgundy-900 dark:text-burgundy-200 ring-2 ring-burgundy-600/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-burgundy-700" />
                    <span className="text-xs font-bold block">Dept Admin</span>
                    <span className="text-[10px] text-zinc-500 leading-tight">
                      Department Officer
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateRole("SUPER_ADMIN")}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      createRole === "SUPER_ADMIN"
                        ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-600/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold block">Super Admin</span>
                    <span className="text-[10px] text-zinc-500 leading-tight">
                      Central Ops
                    </span>
                  </button>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">First Name</Label>
                  <Input
                    placeholder="e.g. Samuel"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Last Name</Label>
                  <Input
                    placeholder="e.g. Adebayo"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>

              {/* Email & Initial Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Institutional Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="e.g. s.adebayo@uemp.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-8.5 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Initial Password
                    </Label>
                    <button
                      type="button"
                      onClick={handleGenerateCreatePassword}
                      className="text-[11px] font-semibold text-burgundy-700 hover:text-burgundy-800 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-8.5 text-xs font-mono pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(password, "Initial Password")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      title="Copy password"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Department Assignment */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Department Assignment
                </Label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 h-8.5 px-3 text-xs bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                >
                  <option value="">
                    -- Central Administration / No Department --
                  </option>
                  {departments.map((d: IDepartment) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Role Fields */}
              {createRole === "STUDENT" && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                      Matriculation Number
                    </Label>
                    <Input
                      placeholder="e.g. UEMP/2026/CSC/042"
                      value={matricNumber}
                      onChange={(e) => setMatricNumber(e.target.value)}
                      required
                      className="h-8.5 text-xs font-mono bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                      Academic Level
                    </Label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(Number(e.target.value))}
                      className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 h-8.5 px-3 text-xs bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    >
                      <option value={100}>100 Level</option>
                      <option value={200}>200 Level</option>
                      <option value={300}>300 Level</option>
                      <option value={400}>400 Level</option>
                      <option value={500}>500 Level</option>
                      <option value={600}>600 Level</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Staff / Lecturer Role Fields */}
              {(createRole === "LECTURER" ||
                createRole === "DEPARTMENT_ADMIN") && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                      Staff ID Number
                    </Label>
                    <Input
                      placeholder="e.g. STF/CSC/104"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      required
                      className="h-8.5 text-xs font-mono bg-white dark:bg-zinc-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                      Academic Designation
                    </Label>
                    <Input
                      placeholder="e.g. Senior Lecturer"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="h-8.5 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isHOD"
                      checked={isHOD}
                      onChange={(e) => setIsHOD(e.target.checked)}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <Label
                      htmlFor="isHOD"
                      className="text-xs font-medium cursor-pointer"
                    >
                      Assign as Head of Department (HOD)
                    </Label>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                disabled={createUserMutation.isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createUserMutation.isPending}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs"
              >
                {createUserMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                )}
                Provision User Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal (Enhanced Option A) */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                Reset User Password Credential
              </DialogTitle>
              <DialogDescription className="text-xs">
                Administer a new password for {targetUser?.firstName}{" "}
                {targetUser?.lastName} ({targetUser?.email}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                <Avatar size="sm" className="w-9 h-9">
                  {targetUser && getAvatarUrl(targetUser) && (
                    <AvatarImage
                      src={getAvatarUrl(targetUser)}
                      alt={targetUser.firstName}
                    />
                  )}
                  <AvatarFallback className="font-bold text-xs bg-amber-100 text-amber-800">
                    {targetUser ? getInitials(targetUser) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                    {targetUser?.firstName} {targetUser?.lastName}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono block">
                    {targetUser?.email}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">New Password</Label>
                  <button
                    type="button"
                    onClick={handleGenerateResetPassword}
                    className="text-[11px] font-semibold text-burgundy-700 hover:text-burgundy-800 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter at least 8 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-9 text-xs font-mono pr-8"
                  />
                  {newPassword && (
                    <button
                      type="button"
                      onClick={() => handleCopy(newPassword, "New Password")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      title="Copy new password"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  The user will be required to authenticate with this new
                  credential immediately on their next login session.
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetModalOpen(false)}
                disabled={resetPasswordMutation.isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={resetPasswordMutation.isPending || !newPassword}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs"
              >
                {resetPasswordMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                )}
                Commit New Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth.store";
import {
  useCurrentUser,
  useUpdateProfile,
  useChangePassword,
} from "@/hooks/queries";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  BadgeCheck,
  ShieldAlert,
  Lock,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StudentProfileView() {
  const { user: storeUser } = useAuthStore();
  const { data: serverUser } = useCurrentUser();
  const user = serverUser || storeUser;

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [phone, setPhone] = useState(user?.phone || "+2348055667788");

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user?.phone]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({ phone });
      toast.success("Phone Number Updated Successfully", {
        description: "Your official contact telephone has been updated.",
      });
    } catch (err: unknown) {
      toast.error("Profile Update Failed", {
        description: (err as Error).message || "Could not update contact phone.",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please provide both current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      toast.success("Password Changed Successfully", {
        description: "Your portal password has been updated securely.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error("Password Change Failed", {
        description: (err as Error).message || "Could not update password.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Student Profile &amp; Academic Records
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Review official institutional student data and manage permitted personal contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Student ID Card */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs md:col-span-1 text-center p-6 flex flex-col items-center justify-between space-y-4">
          <div className="space-y-4 flex flex-col items-center w-full">
            <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-burgundy-700 to-burgundy-900 text-white font-bold text-3xl flex items-center justify-center shadow-md overflow-hidden border-2 border-white dark:border-zinc-800">
              {typeof user?.avatar === "object" && user.avatar?.url ? (
                <Image
                  src={user.avatar.url}
                  alt={user.firstName}
                  fill
                  sizes="112px"
                  className="object-cover"
                  priority
                />
              ) : typeof user?.avatar === "string" && user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.firstName}
                  fill
                  sizes="112px"
                  className="object-cover"
                  priority
                />
              ) : (
                <span>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {user?.firstName} {user?.lastName} {user?.otherName || ""}
              </h3>
              <p className="font-mono text-xs text-burgundy-700 dark:text-burgundy-400 font-bold">
                {user?.studentProfile?.matricNumber || "UEMP/2024/001"}
              </p>
              <div className="pt-1">
                <Badge className="bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300">
                  {user?.studentProfile?.level || 200} Level Undergraduate
                </Badge>
              </div>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-zinc-200 dark:border-zinc-800 text-left text-xs text-zinc-500 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-emerald-500" />
                Status:
              </span>
              <span className="font-bold text-emerald-600">Active Enrolled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-burgundy-700" />
                Degree:
              </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">B.Sc. (Hons)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-500" />
                Dept:
              </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {user?.department?.name || "Computer Science"}
              </span>
            </div>
          </div>
        </Card>

        {/* Right Column: Profile Details & Updates */}
        <div className="md:col-span-2 space-y-6">
          {/* Institutional Academic Record Card (Read-Only) */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-burgundy-700" />
                Official Academic Identity (Verified)
              </CardTitle>
              <CardDescription className="text-xs">
                Managed directly by the Academic Affairs Division and Department Administrator.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-zinc-500 block">Faculty:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {user?.faculty?.name || "Faculty of Science"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-zinc-500 block">Department:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {user?.department?.name || "Computer Science"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-zinc-500 block">Programme:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  B.Sc. Computer Science (4-Year Programme)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-zinc-500 block">Institutional Email:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user?.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Permitted Contact Update Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 text-burgundy-700" />
                Permitted Contact Information
              </CardTitle>
              <CardDescription className="text-xs">
                Students may update personal telephone numbers for SMS emergency alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePhone} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">
                    Contact Phone Number (WhatsApp / SMS)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+2348012345678"
                      className="text-xs h-9"
                    />
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-burgundy-700 hover:bg-burgundy-800 text-white shrink-0 text-xs h-9 px-4 font-semibold"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 mr-1.5" />
                          Update Phone
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Restricted Fields Policy Alert */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Security Policy:</strong> Official registered names, matriculation numbers, and passport photos are protected records and cannot be altered directly by students.
                  </span>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security & Password Change */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-burgundy-700 dark:text-burgundy-400" />
                Change Portal Password
              </CardTitle>
              <CardDescription className="text-xs">
                Ensure your portal password is secure and not shared with others.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="currPass" className="text-xs">Current Password</Label>
                    <Input
                      id="currPass"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="newPass" className="text-xs">New Password</Label>
                    <Input
                      id="newPass"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confPass" className="text-xs">Confirm New</Label>
                    <Input
                      id="confPass"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
                    size="sm"
                    className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

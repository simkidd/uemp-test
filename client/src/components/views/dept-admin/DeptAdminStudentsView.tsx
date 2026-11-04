"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useDeptStudents } from "@/hooks/queries";
import {
  Users,
  Search,
  Filter,
  Loader2,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DeptAdminStudentsView() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | "ALL">("ALL");

  const { data: students = [], isLoading } = useDeptStudents(
    levelFilter === "ALL" ? undefined : levelFilter
  );

  const filteredStudents = students.filter((s) => {
    const nameMatch = `${s.firstName} ${s.lastName} ${s.email} ${s.studentProfile?.matricNumber || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return nameMatch;
  });

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading department student registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Department Students Roster
            </h2>
            <Badge className="bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950 dark:text-burgundy-300">
              {students.length} Enrolled
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Active undergraduate students enrolled in {user?.department?.name ? `the Department of ${user.department.name}` : "your department"}.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or matric number..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="rounded-md border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-burgundy-600"
          >
            <option value="ALL">All Levels</option>
            <option value={100}>100 Level</option>
            <option value={200}>200 Level</option>
            <option value={300}>300 Level</option>
            <option value={400}>400 Level</option>
          </select>
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-base font-bold">Matriculated Undergraduates</CardTitle>
          <CardDescription className="text-xs">
            Showing {filteredStudents.length} of {students.length} students
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No students match the selected filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-semibold">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Matric Number</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Programme</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredStudents.map((s, idx) => (
                    <tr key={s._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-4 text-zinc-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-burgundy-100 dark:bg-burgundy-950 text-burgundy-700 dark:text-burgundy-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {s.firstName?.[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                              {s.firstName} {s.lastName}
                            </span>
                            <span className="text-[10px] text-zinc-400">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-burgundy-700 dark:text-burgundy-400">
                        {s.studentProfile?.matricNumber || "UEMP/2026/Pending"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {s.studentProfile?.level || 100}L
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">
                        {s.department?.name || "Computer Science"}
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        {s.phone ? (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            {s.phone}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          Active
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
    </div>
  );
}

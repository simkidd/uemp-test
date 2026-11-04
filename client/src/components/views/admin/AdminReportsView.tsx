"use client";

import React from "react";
import { useAdminAuditLogs } from "@/hooks/queries";
import { formatDateTime, formatRelativeTime } from "@/lib/date";
import {
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AdminReportsView() {
  const { data: auditData, isLoading } = useAdminAuditLogs({ limit: 50 });
  const audits = auditData?.audits || [];

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-burgundy-700" />
        <span className="text-xs">Loading security audit records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Results Audit Trail &amp; Compliance Logs
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Immutable, append-only log of every result submission, departmental approval, rejection remarks, and score change.
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs py-0 gap-0">
        <CardHeader className="p-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <CardTitle className="text-base font-bold">Academic Integrity Ledger</CardTitle>
              <CardDescription className="text-xs">
                Timestamped records with IP attribution and cryptographic user references.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {audits.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No audit records generated yet. Results actions will be captured here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-4">Result Record ID</th>
                    <th className="py-3 px-4">Transition</th>
                    <th className="py-3 px-4">Audit Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {audits.map((a) => (
                    <tr key={a._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        <span className="block text-zinc-800 dark:text-zinc-200 font-medium">
                          {formatDateTime(a.createdAt)}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {formatRelativeTime(a.createdAt)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            a.action === "APPROVED"
                              ? "border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                              : a.action === "REJECTED"
                              ? "border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                              : a.action === "SUBMITTED"
                              ? "border-burgundy-300 text-burgundy-700 bg-burgundy-50 dark:bg-burgundy-950/40 dark:border-burgundy-800 dark:text-burgundy-300"
                              : "border-zinc-300 text-zinc-600"
                          }
                        >
                          {a.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                          {a.performedBy?.firstName} {a.performedBy?.lastName}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {a.performedBy?.email} &bull; {a.performedBy?.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                        {a.result ? a.result.slice(-8) : "Batch"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {a.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                        {a.remarks || "Automated state transition"}
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

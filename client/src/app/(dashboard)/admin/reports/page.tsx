import { Metadata } from "next";
import { AdminReportsView } from "@/components/views/admin/AdminReportsView";

export const metadata: Metadata = {
  title: "Audit Trail & Compliance Ledger | UEMP",
  description: "Immutable, append-only log of every result submission, departmental approval, and score change.",
};

export default function AdminReportsPage() {
  return <AdminReportsView />;
}

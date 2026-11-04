import { Metadata } from "next";
import { DeptAdminDashboardView } from "@/components/views/dept-admin/DeptAdminDashboardView";

export const metadata: Metadata = {
  title: "Department Administration Console | UEMP",
  description: "Departmental operations, approvals queue, teaching allocations, and students.",
};

export default function DeptAdminPage() {
  return <DeptAdminDashboardView />;
}

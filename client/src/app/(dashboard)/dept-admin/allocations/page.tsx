import { Metadata } from "next";
import { DeptAdminAllocationsView } from "@/components/views/dept-admin/DeptAdminAllocationsView";

export const metadata: Metadata = {
  title: "Department Course Allocations | UEMP",
  description: "Assign departmental courses to qualified academic lecturers.",
};

export default function DeptAdminAllocationsPage() {
  return <DeptAdminAllocationsView />;
}

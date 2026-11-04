import { Metadata } from "next";
import { DeptAdminApprovalsView } from "@/components/views/dept-admin/DeptAdminApprovalsView";

export const metadata: Metadata = {
  title: "Department Result Approvals | UEMP",
  description: "Verify, approve, or reject Continuous Assessment and Exam scores submitted by lecturers.",
};

export default function DeptAdminApprovalsPage() {
  return <DeptAdminApprovalsView />;
}

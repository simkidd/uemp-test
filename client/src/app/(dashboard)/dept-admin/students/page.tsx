import { Metadata } from "next";
import { DeptAdminStudentsView } from "@/components/views/dept-admin/DeptAdminStudentsView";

export const metadata: Metadata = {
  title: "Department Student Registry | UEMP",
  description: "Roster of matriculated undergraduate students in the department.",
};

export default function DeptAdminStudentsPage() {
  return <DeptAdminStudentsView />;
}

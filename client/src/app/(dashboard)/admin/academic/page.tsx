import { Metadata } from "next";
import { AdminAcademicView } from "@/components/views/admin/AdminAcademicView";

export const metadata: Metadata = {
  title: "Academic Calendar & Sessions | UEMP",
  description: "Configure academic sessions, semesters, and toggle student course registration windows.",
};

export default function AdminAcademicPage() {
  return <AdminAcademicView />;
}

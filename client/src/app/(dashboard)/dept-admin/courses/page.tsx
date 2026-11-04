import { Metadata } from "next";
import { DeptAdminCoursesView } from "@/components/views/dept-admin/DeptAdminCoursesView";

export const metadata: Metadata = {
  title: "Department Course Catalog | UEMP",
  description: "Curriculum course offerings, credit weighting, and syllabus specifications.",
};

export default function DeptAdminCoursesPage() {
  return <DeptAdminCoursesView />;
}

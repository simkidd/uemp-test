import { Metadata } from "next";
import { LecturerCoursesView } from "@/components/views/lecturer/LecturerCoursesView";

export const metadata: Metadata = {
  title: "Assigned Courses & Classes | UEMP",
  description: "Courses allocated by department administration for the current semester.",
};

export default function LecturerCoursesPage() {
  return <LecturerCoursesView />;
}

import { Metadata } from "next";
import { StudentResultsView } from "@/components/views/student/StudentResultsView";

export const metadata: Metadata = {
  title: "Results & CGPA Transcript | UEMP",
  description: "View verified semester course results, grade points, and academic transcript.",
};

export default function StudentResultsPage() {
  return <StudentResultsView />;
}

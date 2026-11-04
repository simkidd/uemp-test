import { Metadata } from "next";
import { StudentDashboardView } from "@/components/views/student/StudentDashboardView";

export const metadata: Metadata = {
  title: "Student Portal Overview | UEMP",
  description: "Undergraduate student workspace, enrolled courses, and academic standing.",
};

export default function StudentPage() {
  return <StudentDashboardView />;
}

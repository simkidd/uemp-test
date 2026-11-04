import { Metadata } from "next";
import { LecturerDashboardView } from "@/components/views/lecturer/LecturerDashboardView";

export const metadata: Metadata = {
  title: "Lecturer Workspace | UEMP",
  description: "Academic teaching assignments, grade submissions, and course rosters.",
};

export default function LecturerPage() {
  return <LecturerDashboardView />;
}

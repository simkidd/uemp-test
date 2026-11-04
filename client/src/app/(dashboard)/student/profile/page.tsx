import { Metadata } from "next";
import { StudentProfileView } from "@/components/views/student/StudentProfileView";

export const metadata: Metadata = {
  title: "Student Profile & Bio | UEMP",
  description: "View matriculation records and update student contact details.",
};

export default function StudentProfilePage() {
  return <StudentProfileView />;
}

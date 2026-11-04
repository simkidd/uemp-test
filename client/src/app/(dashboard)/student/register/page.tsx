import { Metadata } from "next";
import { StudentRegisterView } from "@/components/views/student/StudentRegisterView";

export const metadata: Metadata = {
  title: "Course Registration | UEMP",
  description: "Select and register approved semester curriculum credit units.",
};

export default function StudentRegisterPage() {
  return <StudentRegisterView />;
}

import { Metadata } from "next";
import { LecturerScoresView } from "@/components/views/lecturer/LecturerScoresView";

export const metadata: Metadata = {
  title: "Score Entry Sheets | UEMP",
  description: "Select an assigned course to record Continuous Assessment and Exam scores.",
};

export default function LecturerScoresPage() {
  return <LecturerScoresView />;
}

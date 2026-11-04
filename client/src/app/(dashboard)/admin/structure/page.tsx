import { Metadata } from "next";
import { AdminStructureView } from "@/components/views/admin/AdminStructureView";

export const metadata: Metadata = {
  title: "Faculties, Departments & Programmes | UEMP",
  description: "Define institutional hierarchy across faculties, academic departments, and degree programmes.",
};

export default function AdminStructurePage() {
  return <AdminStructureView />;
}

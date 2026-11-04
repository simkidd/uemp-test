import { Metadata } from "next";
import { AdminDashboardView } from "@/components/views/admin/AdminDashboardView";

export const metadata: Metadata = {
  title: "Central University Administration | UEMP",
  description: "Executive portal console for institutional management and system governance.",
};

export default function AdminPage() {
  return <AdminDashboardView />;
}

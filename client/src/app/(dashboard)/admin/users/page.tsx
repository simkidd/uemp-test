import { Metadata } from "next";
import { AdminUsersView } from "@/components/views/admin/AdminUsersView";

export const metadata: Metadata = {
  title: "User Directory & RBAC | UEMP",
  description: "Provision, manage, toggle status, and administer password credentials for all institutional accounts.",
};

export default function AdminUsersPage() {
  return <AdminUsersView />;
}

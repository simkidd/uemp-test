import React from "react";
import { UserRole } from "@/interfaces";
import {
  LayoutDashboard,
  ClipboardList,
  Award,
  UserCheck,
  BookOpen,
  FileSpreadsheet,
  CheckCircle,
  Users,
  FileText,
  Calendar,
  FolderTree,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  permission?: string | string[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const STUDENT_NAV_GROUPS: NavGroup[] = [
  {
    group: "Academic Workspace",
    items: [
      {
        label: "Portal Overview",
        href: "/student",
        icon: LayoutDashboard,
      },
      {
        label: "Course Registration",
        href: "/student/register",
        icon: ClipboardList,
      },
      {
        label: "Results & Transcript",
        href: "/student/results",
        icon: Award,
      },
    ],
  },
  {
    group: "Student Records",
    items: [
      {
        label: "My Profile",
        href: "/student/profile",
        icon: UserCheck,
      },
    ],
  },
];

export const LECTURER_NAV_GROUPS: NavGroup[] = [
  {
    group: "Teaching Duties",
    items: [
      {
        label: "Lecturer Overview",
        href: "/lecturer",
        icon: LayoutDashboard,
      },
      {
        label: "Assigned Courses",
        href: "/lecturer/courses",
        icon: BookOpen,
      },
      {
        label: "Score Entry Matrix",
        href: "/lecturer/scores",
        icon: FileSpreadsheet,
      },
    ],
  },
];

export const DEPT_ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    group: "Department Operations",
    items: [
      {
        label: "Department Overview",
        href: "/dept-admin",
        icon: LayoutDashboard,
      },
      {
        label: "Result Approvals",
        href: "/dept-admin/approvals",
        icon: CheckCircle,
      },
      {
        label: "Course Allocations",
        href: "/dept-admin/allocations",
        icon: BookOpen,
      },
    ],
  },
  {
    group: "Academic Records",
    items: [
      {
        label: "Department Students",
        href: "/dept-admin/students",
        icon: Users,
      },
      {
        label: "Course Catalog",
        href: "/dept-admin/courses",
        icon: FileText,
      },
    ],
  },
];

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    group: "Executive Administration",
    items: [
      {
        label: "Executive Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "User Management",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },
  {
    group: "Academic Governance",
    items: [
      {
        label: "Academic Sessions",
        href: "/admin/academic",
        icon: Calendar,
      },
      {
        label: "Faculties & Depts",
        href: "/admin/structure",
        icon: FolderTree,
      },
    ],
  },
  {
    group: "Compliance & Security",
    items: [
      {
        label: "Audit Logs & Reports",
        href: "/admin/reports",
        icon: FileSpreadsheet,
      },
    ],
  },
];

export function getNavGroupsForRole(role?: UserRole): NavGroup[] {
  switch (role) {
    case "STUDENT":
      return STUDENT_NAV_GROUPS;
    case "LECTURER":
      return LECTURER_NAV_GROUPS;
    case "DEPARTMENT_ADMIN":
      return DEPT_ADMIN_NAV_GROUPS;
    case "SUPER_ADMIN":
      return ADMIN_NAV_GROUPS;
    default:
      return [];
  }
}

export function getAllHrefsForRole(role?: UserRole): string[] {
  const groups = getNavGroupsForRole(role);
  return groups.flatMap((g) => g.items.map((i) => i.href));
}

import { UserRole } from "@/interfaces";

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: "/admin",
  DEPARTMENT_ADMIN: "/dept-admin",
  LECTURER: "/lecturer",
  STUDENT: "/student",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Administrator",
  DEPARTMENT_ADMIN: "Department Administrator",
  LECTURER: "Academic Lecturer",
  STUDENT: "Undergraduate Student",
};

export const ROLE_BADGE_VARIANTS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  DEPARTMENT_ADMIN: "bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950/50 dark:text-burgundy-300 border-burgundy-200 dark:border-burgundy-800",
  LECTURER: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  STUDENT: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};


export const GRADING_SCALE = [
  { min: 70, max: 100, grade: "A", points: 5.0, remark: "Excellent" },
  { min: 60, max: 69, grade: "B", points: 4.0, remark: "Very Good" },
  { min: 50, max: 59, grade: "C", points: 3.0, remark: "Good" },
  { min: 45, max: 49, grade: "D", points: 2.0, remark: "Fair" },
  { min: 40, max: 44, grade: "E", points: 1.0, remark: "Pass" },
  { min: 0, max: 39, grade: "F", points: 0.0, remark: "Fail" },
];

export const COURSE_REGISTRATION_LIMITS = {
  MIN_UNITS: 12,
  MAX_UNITS: 24,
};

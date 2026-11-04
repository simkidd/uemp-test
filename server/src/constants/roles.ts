export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN",
  LECTURER = "LECTURER",
  STUDENT = "STUDENT",
}

export const ALL_ROLES = Object.values(UserRole);

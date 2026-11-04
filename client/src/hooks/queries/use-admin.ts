import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { UserRole, UserStatus } from "@/interfaces";

export const ADMIN_QUERY_KEYS = {
  all: ["admin"] as const,
  users: (params?: {
    role?: UserRole;
    department?: string;
    departmentId?: string;
    search?: string;
    status?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => [...ADMIN_QUERY_KEYS.all, "users", params] as const,
  faculties: () => [...ADMIN_QUERY_KEYS.all, "faculties"] as const,
  departments: (facultyId?: string) =>
    [...ADMIN_QUERY_KEYS.all, "departments", { facultyId }] as const,
  programmes: (departmentId?: string) =>
    [...ADMIN_QUERY_KEYS.all, "programmes", { departmentId }] as const,
  sessions: () => [...ADMIN_QUERY_KEYS.all, "sessions"] as const,
  semesters: () => [...ADMIN_QUERY_KEYS.all, "semesters"] as const,
  auditLogs: (params?: { page?: number; limit?: number }) =>
    [...ADMIN_QUERY_KEYS.all, "auditLogs", params] as const,
};

export function useAdminUsers(params?: {
  role?: UserRole;
  department?: string;
  departmentId?: string;
  search?: string;
  status?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.users(params),
    queryFn: () => adminApi.getUsers(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminFaculties() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.faculties(),
    queryFn: () => adminApi.getFaculties(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminDepartments(facultyId?: string) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.departments(facultyId),
    queryFn: () => adminApi.getDepartments(facultyId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminProgrammes(departmentId?: string) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.programmes(departmentId),
    queryFn: () => adminApi.getProgrammes(departmentId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminSessions() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.sessions(),
    queryFn: () => adminApi.getSessions(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminSemesters() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.semesters(),
    queryFn: () => adminApi.getSemesters(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminAuditLogs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.auditLogs(params),
    queryFn: () => adminApi.getAuditLogs(params),
    staleTime: 1000 * 60 * 1,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData | Record<string, unknown>) =>
      adminApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.all, "users"] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.all, "users"] });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: FormData | Record<string, unknown>;
    }) => adminApi.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.all, "users"] });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword?: string }) =>
      adminApi.resetUserPassword(userId, newPassword),
  });
}

export function useCreateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; description?: string }) =>
      adminApi.createFaculty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.faculties() });
    },
  });
}

export function useUpdateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; code?: string; description?: string; isActive?: boolean } }) =>
      adminApi.updateFaculty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.faculties() });
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; faculty: string; description?: string }) =>
      adminApi.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.all, "departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; code?: string; facultyId?: string; description?: string; isActive?: boolean } }) =>
      adminApi.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.all, "departments"] });
    },
  });
}

export function useCreateProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; department: string; durationYears: number; degreeType?: string }) =>
      adminApi.createProgramme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.all, "programmes"] });
    },
  });
}

export function useUpdateProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; code?: string; durationYears?: number; degreeAwarded?: string; isActive?: boolean } }) =>
      adminApi.updateProgramme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEYS.all, "programmes"] });
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; startDate: string; endDate: string; isCurrent?: boolean }) =>
      adminApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.sessions() });
    },
  });
}

export function useSetCurrentSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (param: string | { id: string; isCurrent?: boolean }) => {
      const id = typeof param === "string" ? param : param.id;
      const isCurrent = typeof param === "string" ? true : (param.isCurrent ?? true);
      return adminApi.setCurrentSession(id, isCurrent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.sessions() });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.semesters() });
    },
  });
}

export function useCreateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; sessionId: string; isCurrent?: boolean; isRegistrationOpen?: boolean }) =>
      adminApi.createSemester(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.semesters() });
    },
  });
}

export function useSetCurrentSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.setCurrentSemester(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.semesters() });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.sessions() });
    },
  });
}

export function useToggleRegistrationWindow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ semesterId, registrationOpen }: { semesterId: string; registrationOpen: boolean }) =>
      adminApi.toggleRegistrationWindow(semesterId, registrationOpen),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.semesters() });
    },
  });
}


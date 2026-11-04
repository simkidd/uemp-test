import api from "@/lib/api";
import {
  IFaculty,
  IDepartment,
  IProgramme,
  ISession,
  ISemester,
  IUser,
  IResultAudit,
  UserRole,
  UserStatus,
} from "@/interfaces";

export const adminApi = {
  getUsers: async (params?: {
    role?: UserRole;
    department?: string;
    departmentId?: string;
    search?: string;
    status?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get("/admin/users", { params });
    return {
      users: (res.data?.data || []) as IUser[],
      pagination: res.data?.pagination,
    };
  },

  createUser: async (
    payload: FormData | Record<string, unknown>
  ): Promise<IUser> => {
    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const res = await api.post("/admin/users", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data?.data;
  },

  updateUserStatus: async (
    userId: string,
    status: UserStatus | boolean,
  ): Promise<IUser> => {
    const isActive = typeof status === "boolean" ? status : status === "ACTIVE";
    const res = await api.patch(`/admin/users/${userId}/status`, {
      isActive,
      status: isActive ? "ACTIVE" : "SUSPENDED",
    });
    return res.data?.data;
  },

  updateUser: async (
    userId: string,
    data: FormData | Record<string, unknown>
  ): Promise<IUser> => {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const res = await api.patch(`/admin/users/${userId}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data?.data;
  },

  resetUserPassword: async (userId: string, newPassword?: string) => {
    const res = await api.post(`/admin/users/${userId}/reset-password`, {
      newPassword,
    });
    return res.data;
  },

  getFaculties: async (): Promise<IFaculty[]> => {
    const res = await api.get("/academics/faculties");
    return res.data?.data || [];
  },

  createFaculty: async (data: {
    name: string;
    code: string;
    description?: string;
  }): Promise<IFaculty> => {
    const res = await api.post("/academics/faculties", data);
    return res.data?.data;
  },

  updateFaculty: async (
    id: string,
    data: { name?: string; code?: string; description?: string; isActive?: boolean }
  ): Promise<IFaculty> => {
    const res = await api.put(`/academics/faculties/${id}`, data);
    return res.data?.data;
  },

  getDepartments: async (facultyId?: string): Promise<IDepartment[]> => {
    const res = await api.get("/academics/departments", {
      params: facultyId ? { facultyId } : undefined,
    });
    return res.data?.data || [];
  },

  createDepartment: async (data: {
    name: string;
    code: string;
    faculty: string;
    description?: string;
  }): Promise<IDepartment> => {
    const res = await api.post("/academics/departments", {
      name: data.name,
      code: data.code,
      facultyId: data.faculty,
      description: data.description,
    });
    return res.data?.data;
  },

  updateDepartment: async (
    id: string,
    data: { name?: string; code?: string; facultyId?: string; description?: string; isActive?: boolean }
  ): Promise<IDepartment> => {
    const res = await api.put(`/academics/departments/${id}`, data);
    return res.data?.data;
  },

  getProgrammes: async (departmentId?: string): Promise<IProgramme[]> => {
    const res = await api.get("/academics/programmes", {
      params: departmentId ? { departmentId } : undefined,
    });
    return res.data?.data || [];
  },

  createProgramme: async (data: {
    name: string;
    code: string;
    department: string;
    durationYears: number;
    degreeType?: string;
  }): Promise<IProgramme> => {
    const res = await api.post("/academics/programmes", {
      name: data.name,
      code: data.code,
      departmentId: data.department,
      durationYears: data.durationYears,
      degreeAwarded: data.degreeType || "B.Sc.",
    });
    return res.data?.data;
  },

  updateProgramme: async (
    id: string,
    data: { name?: string; code?: string; durationYears?: number; degreeAwarded?: string; isActive?: boolean }
  ): Promise<IProgramme> => {
    const res = await api.put(`/academics/programmes/${id}`, data);
    return res.data?.data;
  },

  getSessions: async (): Promise<ISession[]> => {
    const res = await api.get("/academics/sessions");
    return res.data?.data || [];
  },

  createSession: async (data: {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
  }): Promise<ISession> => {
    const res = await api.post("/academics/sessions", data);
    return res.data?.data;
  },

  setCurrentSession: async (id: string, isCurrent: boolean = true): Promise<ISession> => {
    const res = await api.patch(`/academics/sessions/${id}/set-current`, { isCurrent });
    return res.data?.data;
  },

  getSemesters: async (sessionId?: string): Promise<ISemester[]> => {
    const res = await api.get("/academics/semesters", {
      params: sessionId ? { sessionId } : undefined,
    });
    const items = res.data?.data || [];
    return items.map((sem: any) => ({
      ...sem,
      registrationOpen: sem.isRegistrationOpen ?? sem.registrationOpen ?? false,
    }));
  },

  createSemester: async (data: {
    name: string;
    sessionId: string;
    isCurrent?: boolean;
    isRegistrationOpen?: boolean;
  }): Promise<ISemester> => {
    const res = await api.post("/academics/semesters", data);
    return res.data?.data;
  },

  setCurrentSemester: async (id: string): Promise<ISemester> => {
    const res = await api.patch(`/academics/semesters/${id}/set-current`);
    return res.data?.data;
  },

  toggleRegistrationWindow: async (
    semesterId: string,
    registrationOpen: boolean,
  ): Promise<ISemester> => {
    const res = await api.patch(
      `/academics/semesters/${semesterId}/toggle-registration`,
      { isOpen: registrationOpen },
    );
    return res.data?.data;
  },

  getAuditLogs: async (params?: { page?: number; limit?: number; action?: string; courseId?: string }) => {
    const res = await api.get("/reports/audit-logs", { params });
    const rawLogs = res.data?.data || [];
    const audits = rawLogs.map((item: any) => ({
      ...item,
      performedBy: item.actor || item.performedBy,
      remarks: item.comments || item.remarks,
    })) as IResultAudit[];
    return {
      audits,
      pagination: res.data?.pagination,
    };
  },
};

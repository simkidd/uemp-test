import api from "@/lib/api";
import { ICourse, ICourseAllocation, IResult, IUser } from "@/interfaces";

export const deptAdminApi = {
  getCourses: async (): Promise<ICourse[]> => {
    const res = await api.get("/dept-admin/courses");
    return res.data?.data || [];
  },

  createCourse: async (courseData: Partial<ICourse>): Promise<ICourse> => {
    const res = await api.post("/dept-admin/courses", courseData);
    return res.data?.data;
  },

  getLecturers: async (): Promise<IUser[]> => {
    const res = await api.get("/dept-admin/lecturers");
    return res.data?.data || [];
  },

  getAllocations: async (): Promise<ICourseAllocation[]> => {
    const res = await api.get("/dept-admin/allocations");
    return res.data?.data || [];
  },

  createAllocation: async (payload: {
    courseId: string;
    lecturerId: string;
    sessionId?: string;
    semesterId?: string;
  }): Promise<ICourseAllocation> => {
    const res = await api.post("/dept-admin/allocations", payload);
    return res.data?.data;
  },

  getStudents: async (params?: { level?: number }): Promise<IUser[]> => {
    const res = await api.get("/dept-admin/students", { params });
    return res.data?.data || [];
  },

  getPendingResults: async (): Promise<IResult[]> => {
    const res = await api.get("/dept-admin/results/pending");
    return res.data?.data || [];
  },

  removeAllocation: async (id: string): Promise<void> => {
    await api.delete(`/dept-admin/allocations/${id}`);
  },

  assignCourse: async (payload: {
    courseId: string;
    lecturerId: string;
    sessionId?: string;
    semesterId?: string;
  }): Promise<ICourseAllocation> => {
    const res = await api.post("/dept-admin/allocations", payload);
    return res.data?.data;
  },

  approveCourseResults: async (courseId: string): Promise<IResult[]> => {
    const res = await api.post(`/dept-admin/results/${courseId}/approve`);
    return res.data?.data || [];
  },

  rejectCourseResults: async ({
    courseId,
    remarks,
  }: {
    courseId: string;
    remarks: string;
  }): Promise<IResult[]> => {
    const res = await api.post(`/dept-admin/results/${courseId}/reject`, {
      remarks,
    });
    return res.data?.data || [];
  },
};


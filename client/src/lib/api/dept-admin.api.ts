import api from "@/lib/api";
import { ICourse, ICourseAllocation, IResult, IUser } from "@/interfaces";

export const deptAdminApi = {

  getCourses: async (): Promise<ICourse[]> => {
    const res = await api.get("/courses");
    return res.data?.data || [];
  },

  createCourse: async (courseData: Partial<ICourse>): Promise<ICourse> => {
    const res = await api.post("/courses", courseData);
    return res.data?.data;
  },

  getLecturers: async (): Promise<IUser[]> => {
    const res = await api.get("/admin/users", {
      params: { role: "LECTURER", limit: 100 },
    });
    return res.data?.data || [];
  },

  getAllocations: async (): Promise<ICourseAllocation[]> => {
    const res = await api.get("/courses/allocations");
    return res.data?.data || [];
  },

  createAllocation: async (payload: {
    courseId: string;
    lecturerId: string;
    sessionId?: string;
    semesterId?: string;
  }): Promise<ICourseAllocation> => {
    const res = await api.post("/courses/allocate", payload);
    return res.data?.data;
  },

  getStudents: async (params?: { level?: number }): Promise<IUser[]> => {
    const res = await api.get("/admin/users", {
      params: {
        role: "STUDENT",
        limit: 100,
        ...(params?.level ? { level: params.level } : {}),
      },
    });
    return res.data?.data || [];
  },

  getPendingResults: async (): Promise<IResult[]> => {
    const res = await api.get("/results/pending");
    return res.data?.data || [];
  },

  removeAllocation: async (id: string): Promise<void> => {
    await api.delete(`/courses/allocations/${id}`);
  },

  assignCourse: async (payload: {
    courseId: string;
    lecturerId: string;
    sessionId?: string;
    semesterId?: string;
  }): Promise<ICourseAllocation> => {
    const res = await api.post("/courses/allocate", payload);
    return res.data?.data;
  },

  approveCourseResults: async (courseOrResultId: string): Promise<IResult> => {
    const res = await api.post(`/results/${courseOrResultId}/approve`);
    return res.data?.data;
  },

  rejectCourseResults: async ({
    courseId,
    remarks,
  }: {
    courseId: string;
    remarks: string;
  }): Promise<IResult> => {
    const res = await api.post(`/results/${courseId}/reject`, {
      reason: remarks,
      remarks,
    });
    return res.data?.data;
  },
};



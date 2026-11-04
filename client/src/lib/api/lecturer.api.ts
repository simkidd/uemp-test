import api from "@/lib/api";
import { ICourse, ICourseAllocation, IResult, IUser } from "@/interfaces";

export interface ScoreEntryPayload {
  studentId: string;
  caScore: number;
  examScore: number;
}

export const lecturerApi = {
  getAssignedCourses: async (): Promise<ICourseAllocation[]> => {
    const res = await api.get("/lecturer/courses");
    return res.data?.data || [];
  },

  getCourseStudents: async (
    courseId: string,
  ): Promise<{ course: ICourse; students: IUser[] }> => {
    const res = await api.get(`/lecturer/courses/${courseId}/students`);
    return res.data?.data;
  },

  getCourseResults: async (courseId: string): Promise<IResult[]> => {
    const res = await api.get(`/lecturer/results?course=${courseId}`);
    return res.data?.data || [];
  },

  saveDraftResults: async (
    courseId: string,
    results: ScoreEntryPayload[],
  ): Promise<IResult[]> => {
    const res = await api.post("/lecturer/results/draft", {
      courseId,
      results,
    });
    return res.data?.data || [];
  },

  submitResults: async (
    courseId: string,
    results: ScoreEntryPayload[],
  ): Promise<IResult[]> => {
    const res = await api.post("/lecturer/results/submit", {
      courseId,
      results,
    });
    return res.data?.data || [];
  },
};

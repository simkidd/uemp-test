import api from "@/lib/api";
import { ICourse, ICourseAllocation, IResult, IUser } from "@/interfaces";

export interface ScoreEntryPayload {
  studentId: string;
  caScore: number;
  examScore: number;
}

export const lecturerApi = {
  getAssignedCourses: async (): Promise<ICourseAllocation[]> => {
    const res = await api.get("/courses/assigned");
    return res.data?.data || [];
  },

  getCourseStudents: async (
    courseId: string,
  ): Promise<{
    course: ICourse;
    students: IUser[];
    resultStatus?: string;
    resultId?: string;
    isReopened?: boolean;
    rejectionReason?: string;
  }> => {
    const res = await api.get(`/results/course/${courseId}/students`);
    return res.data?.data;
  },

  getCourseResults: async (courseId: string): Promise<IResult[]> => {
    const res = await api.get("/results", {
      params: { course: courseId },
    });
    return res.data?.data || [];
  },

  saveDraftResults: async (
    courseId: string,
    results: ScoreEntryPayload[],
  ): Promise<IResult[]> => {
    const res = await api.post("/results/save-or-submit", {
      courseId,
      scores: results,
      action: "DRAFT",
    });
    return res.data?.data || [];
  },

  submitResults: async (
    courseId: string,
    results: ScoreEntryPayload[],
  ): Promise<IResult[]> => {
    const res = await api.post("/results/save-or-submit", {
      courseId,
      scores: results,
      action: "SUBMIT",
    });
    return res.data?.data || [];
  },
};


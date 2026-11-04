import api from "@/lib/api";
import { ICourse, ICourseRegistration, IUser } from "@/interfaces";

export interface IAvailableCoursesResponse {
  activeSession: {
    _id: string;
    name: string;
    isCurrent: boolean;
  };
  activeSemester: {
    _id: string;
    name: string;
    isCurrent: boolean;
    isRegistrationOpen: boolean;
  };
  isRegistrationOpen: boolean;
  studentInfo: {
    matricNumber: string;
    level: number;
    department: any;
    programme: any;
  };
  hasRegistered: boolean;
  existingRegistration: ICourseRegistration | null;
  availableCourses: ICourse[];
}

export interface IStudentResultsResponse {
  student: {
    firstName: string;
    lastName: string;
    matricNumber: string;
    department: any;
  };
  semesters: Array<{
    sessionAndSemester: string;
    session: string;
    semester: string;
    courses: Array<{
      courseCode: string;
      courseTitle: string;
      creditUnit: number;
      caScore: number;
      examScore: number;
      totalScore: number;
      grade: string;
      gradePoint: number;
    }>;
    totalUnits: number;
    totalPoints: number;
    gpa: number;
  }>;
  cgpa: number;
  classification: string;
}

export interface IResultStatementResponse {
  student: IUser;
  semesters: Array<{
    term: string;
    session: string;
    semester: string;
    courses: Array<{
      code: string;
      title: string;
      creditUnit: number;
      caScore: number;
      examScore: number;
      totalScore: number;
      grade: string;
      gradePoint: number;
    }>;
    gpa: number;
    totalUnits: number;
    totalPoints: number;
  }>;
  totalCreditUnitsCompleted: number;
  cgpa: number;
  classification: string;
  generatedAt: string;
}

export const studentApi = {
  getAvailableCourses: async (): Promise<IAvailableCoursesResponse> => {
    const res = await api.get("/registrations/available");
    return res.data?.data;
  },

  getRegisteredCourses: async (): Promise<ICourseRegistration | null> => {
    const res = await api.get("/registrations/my");
    const data = res.data?.data;
    if (Array.isArray(data)) {
      return data[0] || null;
    }
    return data || null;
  },

  getAllRegistrations: async (): Promise<ICourseRegistration[]> => {
    const res = await api.get("/registrations/my");
    return res.data?.data || [];
  },

  registerCourses: async (courseIds: string[]): Promise<ICourseRegistration> => {
    const res = await api.post("/registrations", { courseIds });
    return res.data?.data;
  },

  getRegistrationSlip: async (registrationId: string): Promise<ICourseRegistration> => {
    const res = await api.get(`/registrations/slip/${registrationId}`);
    return res.data?.data;
  },

  getResults: async (): Promise<IStudentResultsResponse> => {
    const res = await api.get("/results/my-results");
    return res.data?.data;
  },

  getStatementOfResults: async (): Promise<IResultStatementResponse> => {
    const res = await api.get("/results/statement");
    return res.data?.data;
  },

  updateProfile: async (data: { phone?: string }): Promise<IUser> => {
    const res = await api.patch("/auth/profile", data);
    return res.data?.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post("/auth/change-password", data);
  },
};

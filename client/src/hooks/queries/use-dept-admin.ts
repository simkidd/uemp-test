import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deptAdminApi } from "@/lib/api";
import { ICourse } from "@/interfaces";

export const DEPT_ADMIN_QUERY_KEYS = {
  all: ["deptAdmin"] as const,
  courses: () => [...DEPT_ADMIN_QUERY_KEYS.all, "courses"] as const,
  lecturers: () => [...DEPT_ADMIN_QUERY_KEYS.all, "lecturers"] as const,
  allocations: () => [...DEPT_ADMIN_QUERY_KEYS.all, "allocations"] as const,
  students: (level?: number) =>
    [...DEPT_ADMIN_QUERY_KEYS.all, "students", { level }] as const,
  pendingResults: () => [...DEPT_ADMIN_QUERY_KEYS.all, "pendingResults"] as const,
};

export function useDeptCourses() {
  return useQuery({
    queryKey: DEPT_ADMIN_QUERY_KEYS.courses(),
    queryFn: () => deptAdminApi.getCourses(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useDeptLecturers() {
  return useQuery({
    queryKey: DEPT_ADMIN_QUERY_KEYS.lecturers(),
    queryFn: () => deptAdminApi.getLecturers(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useDeptAllocations() {
  return useQuery({
    queryKey: DEPT_ADMIN_QUERY_KEYS.allocations(),
    queryFn: () => deptAdminApi.getAllocations(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeptStudents(level?: number) {
  return useQuery({
    queryKey: DEPT_ADMIN_QUERY_KEYS.students(level),
    queryFn: () => deptAdminApi.getStudents(level ? { level } : undefined),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeptPendingResults() {
  return useQuery({
    queryKey: DEPT_ADMIN_QUERY_KEYS.pendingResults(),
    queryFn: () => deptAdminApi.getPendingResults(),
    staleTime: 1000 * 60 * 1,
  });
}

export function useCreateDeptCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseData: Partial<ICourse>) => deptAdminApi.createCourse(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPT_ADMIN_QUERY_KEYS.courses() });
    },
  });
}

export function useCreateDeptAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      courseId: string;
      lecturerId: string;
      sessionId?: string;
      semesterId?: string;
    }) => deptAdminApi.createAllocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPT_ADMIN_QUERY_KEYS.allocations() });
    },
  });
}

export function useRemoveDeptAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deptAdminApi.removeAllocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPT_ADMIN_QUERY_KEYS.allocations() });
    },
  });
}

export function useApproveDeptResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => deptAdminApi.approveCourseResults(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPT_ADMIN_QUERY_KEYS.pendingResults() });
    },
  });
}

export function useRejectDeptResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, remarks }: { courseId: string; remarks: string }) =>
      deptAdminApi.rejectCourseResults({ courseId, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPT_ADMIN_QUERY_KEYS.pendingResults() });
    },
  });
}

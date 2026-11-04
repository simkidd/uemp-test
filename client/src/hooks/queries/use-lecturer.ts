import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lecturerApi, ScoreEntryPayload } from "@/lib/api";

export const LECTURER_QUERY_KEYS = {
  all: ["lecturer"] as const,
  courses: () => [...LECTURER_QUERY_KEYS.all, "courses"] as const,
  courseStudents: (courseId: string) =>
    [...LECTURER_QUERY_KEYS.all, "courseStudents", courseId] as const,
  courseResults: (courseId: string) =>
    [...LECTURER_QUERY_KEYS.all, "courseResults", courseId] as const,
};

export function useAssignedCourses() {
  return useQuery({
    queryKey: LECTURER_QUERY_KEYS.courses(),
    queryFn: () => lecturerApi.getAssignedCourses(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCourseStudents(courseId?: string) {
  return useQuery({
    queryKey: LECTURER_QUERY_KEYS.courseStudents(courseId || ""),
    queryFn: () => lecturerApi.getCourseStudents(courseId!),
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCourseResults(courseId?: string) {
  return useQuery({
    queryKey: LECTURER_QUERY_KEYS.courseResults(courseId || ""),
    queryFn: () => lecturerApi.getCourseResults(courseId!),
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 1,
  });
}

export function useSaveDraftResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      results,
    }: {
      courseId: string;
      results: ScoreEntryPayload[];
    }) => lecturerApi.saveDraftResults(courseId, results),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: LECTURER_QUERY_KEYS.courseResults(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: LECTURER_QUERY_KEYS.courses(),
      });
    },
  });
}

export function useSubmitResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      results,
    }: {
      courseId: string;
      results: ScoreEntryPayload[];
    }) => lecturerApi.submitResults(courseId, results),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: LECTURER_QUERY_KEYS.courseResults(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: LECTURER_QUERY_KEYS.courses(),
      });
    },
  });
}

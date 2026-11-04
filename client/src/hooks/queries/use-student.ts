import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/api";

export const STUDENT_QUERY_KEYS = {
  all: ["student"] as const,
  registeredCourses: () => [...STUDENT_QUERY_KEYS.all, "registeredCourses"] as const,
  availableCourses: () => [...STUDENT_QUERY_KEYS.all, "availableCourses"] as const,
  results: () => [...STUDENT_QUERY_KEYS.all, "results"] as const,
  statement: () => [...STUDENT_QUERY_KEYS.all, "statement"] as const,
  registrationSlip: (id: string) => [...STUDENT_QUERY_KEYS.all, "registrationSlip", id] as const,
};

export function useRegisteredCourses() {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.registeredCourses(),
    queryFn: () => studentApi.getRegisteredCourses(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAvailableCourses() {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.availableCourses(),
    queryFn: () => studentApi.getAvailableCourses(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useStudentResults() {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.results(),
    queryFn: () => studentApi.getResults(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useStatementOfResults() {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.statement(),
    queryFn: () => studentApi.getStatementOfResults(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRegistrationSlip(registrationId?: string) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.registrationSlip(registrationId || ""),
    queryFn: () => studentApi.getRegistrationSlip(registrationId!),
    enabled: Boolean(registrationId),
    staleTime: 1000 * 60 * 5,
  });
}
